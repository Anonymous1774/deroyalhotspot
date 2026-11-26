/**
 * DHOS Multi-Tenant Migration Seed Script
 * ========================================
 * Stage 2: Safe, idempotent migration of existing single-tenant data
 * into the new multi-tenant schema.
 *
 * This script:
 *   1. Creates the "De Royal Hotspot" tenant (Tenant 1 / isFirstTenant: true)
 *   2. Creates a default DHOS subscription plan
 *   3. Creates an ACTIVE subscription for DRH
 *   4. Migrates all existing Admin records → User + TenantUser
 *   5. Backfills tenantId on all existing resources
 *   6. Migrates existing SystemSetting records to TenantSetting
 *   7. Migrates ActivityLog records to AuditLog
 *
 * SAFETY GUARANTEES:
 *   - Fully idempotent: safe to run multiple times
 *   - Never deletes any existing records
 *   - Uses upsert / updateMany rather than create where possible
 *   - Checks existence before creating to avoid duplicates
 *   - Admin table remains intact for rollback
 *
 * Run: npx ts-node --project tsconfig.json prisma/seed/migrate-to-multitenant.ts
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient({
  log: ['warn', 'error'],
});

const DRH_TENANT_SLUG = 'de-royal-hotspot';
const DRH_TENANT_NAME = 'De Royal Hotspot';
const STARTER_PLAN_NAME = 'DHOS Starter';

// ─── Utility ─────────────────────────────────────────────────

function log(msg: string) {
  console.log(`[MIGRATE] ${msg}`);
}

function warn(msg: string) {
  console.warn(`[WARN]    ${msg}`);
}

// ─── Main ─────────────────────────────────────────────────────

async function main() {
  log('Starting DHOS multi-tenant migration...');
  log('This script is idempotent — safe to run multiple times.');
  console.log('');

  // ── STEP 1: Create De Royal Hotspot Tenant ─────────────────
  log('Step 1: Ensuring De Royal Hotspot tenant exists...');

  const drhTenant = await prisma.tenant.upsert({
    where: { slug: DRH_TENANT_SLUG },
    update: {}, // never overwrite existing data
    create: {
      name: DRH_TENANT_NAME,
      slug: DRH_TENANT_SLUG,
      email: 'support@deroyalhotspot.name.ng',
      phone: '+2347017741881',
      country: 'NG',
      status: 'ACTIVE',
      isFirstTenant: true,
    },
  });

  log(`  ✓ Tenant: ${drhTenant.name} (id: ${drhTenant.id})`);

  // ── STEP 2: Create default subscription plan ───────────────
  log('Step 2: Ensuring DHOS Starter subscription plan exists...');

  const starterPlan = await prisma.subscriptionPlan.upsert({
    where: { name: STARTER_PLAN_NAME },
    update: {},
    create: {
      name: STARTER_PLAN_NAME,
      description: 'Entry-level DHOS plan for small ISPs',
      price: 0,
      billingInterval: 'monthly',
      routerLimit: 5,
      staffLimit: 5,
      trialDays: 0,
      features: JSON.stringify([
        'Router management',
        'Internet plan management',
        'Voucher generation',
        'Session monitoring',
        'Activity logs',
      ]),
      isActive: true,
      sortOrder: 1,
    },
  });

  log(`  ✓ Subscription plan: ${starterPlan.name} (id: ${starterPlan.id})`);

  // ── STEP 3: Create subscription for DRH ───────────────────
  log('Step 3: Ensuring De Royal Hotspot subscription exists...');

  const existingSub = await prisma.tenantSubscription.findUnique({
    where: { tenantId: drhTenant.id },
  });

  if (!existingSub) {
    await prisma.tenantSubscription.create({
      data: {
        tenantId: drhTenant.id,
        planId: starterPlan.id,
        status: 'ACTIVE',
        activatedAt: new Date(),
        currentPeriodStart: new Date(),
        // Effectively no expiry for the first tenant
        currentPeriodEnd: new Date('2099-12-31'),
        notes: 'De Royal Hotspot — platform founder tenant, permanent access.',
      },
    });
    log(`  ✓ Created ACTIVE subscription for DRH`);
  } else {
    log(`  ✓ Subscription already exists (status: ${existingSub.status})`);
  }

  // ── STEP 4: Migrate Admin → User + TenantUser ──────────────
  log('Step 4: Migrating existing Admin records to User + TenantUser...');

  const admins = await prisma.admin.findMany();
  log(`  Found ${admins.length} admin(s) to migrate.`);

  for (const admin of admins) {
    // Skip if already migrated (migratedAt is set)
    if (admin.migratedAt) {
      log(`  ⟳ Admin ${admin.email} already migrated — skipping.`);
      continue;
    }

    // Determine if Super Admin
    const isSuperAdmin = admin.role === 'SUPER_ADMIN';

    // Create or find User record (email must be unique)
    const user = await prisma.user.upsert({
      where: { email: admin.email },
      update: {},
      create: {
        id: admin.id, // preserve the original ID where possible
        fullName: admin.fullName,
        email: admin.email,
        passwordHash: admin.passwordHash, // already Argon2id — safe to copy
        isActive: admin.isActive,
        isSuperAdmin,
        lastLogin: admin.lastLogin,
        createdAt: admin.createdAt,
      },
    });

    log(`  ✓ User created/found: ${user.email} (isSuperAdmin: ${isSuperAdmin})`);

    // Map Admin role → TenantRole
    const tenantRole = isSuperAdmin ? 'OWNER' : 'ADMINISTRATOR';

    // Create TenantUser linking User to DRH tenant
    const existingTenantUser = await prisma.tenantUser.findFirst({
      where: { tenantId: drhTenant.id, userId: user.id },
    });

    if (!existingTenantUser) {
      await prisma.tenantUser.create({
        data: {
          tenantId: drhTenant.id,
          userId: user.id,
          role: tenantRole,
          isActive: admin.isActive,
          createdAt: admin.createdAt,
        },
      });
      log(`  ✓ TenantUser created: ${user.email} → ${tenantRole} in ${DRH_TENANT_NAME}`);
    } else {
      log(`  ⟳ TenantUser already exists for ${user.email} — skipping.`);
    }

    // Mark admin as migrated (non-destructive)
    await prisma.admin.update({
      where: { id: admin.id },
      data: { migratedAt: new Date() },
    });
  }

  // ── STEP 5: Backfill tenantId on all existing resources ────
  log('Step 5: Backfilling tenantId on existing resources...');

  const drhId = drhTenant.id;

  const [
    routersUpdated,
    profilesUpdated,
    plansUpdated,
    vouchersUpdated,
    sessionsUpdated,
    devicesUpdated,
  ] = await Promise.all([
    prisma.router.updateMany({
      where: { tenantId: null },
      data: { tenantId: drhId },
    }),
    prisma.bandwidthProfile.updateMany({
      where: { tenantId: null },
      data: { tenantId: drhId },
    }),
    prisma.plan.updateMany({
      where: { tenantId: null },
      data: { tenantId: drhId },
    }),
    prisma.voucher.updateMany({
      where: { tenantId: null },
      data: { tenantId: drhId },
    }),
    prisma.hotspotSession.updateMany({
      where: { tenantId: null },
      data: { tenantId: drhId },
    }),
    prisma.registeredDevice.updateMany({
      where: { tenantId: null },
      data: { tenantId: drhId },
    }),
  ]);

  log(`  ✓ Routers backfilled: ${routersUpdated.count}`);
  log(`  ✓ Bandwidth profiles backfilled: ${profilesUpdated.count}`);
  log(`  ✓ Plans backfilled: ${plansUpdated.count}`);
  log(`  ✓ Vouchers backfilled: ${vouchersUpdated.count}`);
  log(`  ✓ Sessions backfilled: ${sessionsUpdated.count}`);
  log(`  ✓ Registered devices backfilled: ${devicesUpdated.count}`);

  // ── STEP 6: Migrate SystemSettings → TenantSettings ───────
  log('Step 6: Migrating SystemSetting records to TenantSetting...');

  // Settings that belong to a tenant (ISP-scoped)
  const tenantScopedKeys = [
    'voucher_length',
    'voucher_prefix',
    'voucher_expiry_days',
    'hotspot_portal_title',
    'hotspot_welcome_message',
  ];

  const systemSettings = await prisma.systemSetting.findMany({
    where: { key: { in: tenantScopedKeys } },
  });

  for (const setting of systemSettings) {
    await prisma.tenantSetting.upsert({
      where: {
        tenantId_key: {
          tenantId: drhId,
          key: setting.key,
        },
      },
      update: {}, // don't overwrite if already migrated
      create: {
        tenantId: drhId,
        key: setting.key,
        value: setting.value,
      },
    });
    log(`  ✓ Migrated setting: ${setting.key}`);
  }

  if (systemSettings.length === 0) {
    log('  ⟳ No tenant-scoped SystemSettings found — nothing to migrate.');
  }

  // ── STEP 7: Migrate ActivityLog → AuditLog ─────────────────
  log('Step 7: Migrating ActivityLog records to AuditLog...');

  // Find the user IDs we just created from admins
  const userIds = new Map<string, string>(); // adminId → userId
  for (const admin of admins) {
    userIds.set(admin.id, admin.id); // IDs are preserved
  }

  const activityLogs = await prisma.activityLog.findMany({
    orderBy: { createdAt: 'asc' },
    include: { admin: true },
  });

  let migratedLogs = 0;

  // Migrate in batches of 100 to avoid memory issues
  const BATCH_SIZE = 100;
  for (let i = 0; i < activityLogs.length; i += BATCH_SIZE) {
    const batch = activityLogs.slice(i, i + BATCH_SIZE);

    // Check which ones already exist in AuditLog (by matching id)
    // We preserve the original ID to make this idempotent
    const toInsert = [];
    for (const log of batch) {
      const existing = await prisma.auditLog.findUnique({ where: { id: log.id } });
      if (!existing) {
        toInsert.push({
          id: log.id,
          tenantId: drhId,
          userId: log.adminId || null,
          actorType: log.adminId ? 'staff' : 'system',
          actorEmail: log.admin?.email || null,
          action: log.action,
          module: log.module,
          description: log.description,
          ipAddress: log.ipAddress || null,
          createdAt: log.createdAt,
        });
      }
    }

    if (toInsert.length > 0) {
      await prisma.auditLog.createMany({ data: toInsert, skipDuplicates: true });
      migratedLogs += toInsert.length;
    }
  }

  log(`  ✓ ActivityLog records migrated to AuditLog: ${migratedLogs}`);
  log(`  ⟳ Original ActivityLog records preserved (not deleted).`);

  // ── DONE ──────────────────────────────────────────────────
  console.log('');
  log('══════════════════════════════════════════════════════');
  log('Migration complete. Summary:');
  log(`  Tenant:              ${drhTenant.name} (${drhTenant.id})`);
  log(`  Admins migrated:     ${admins.filter(a => !a.migratedAt || a.migratedAt).length}`);
  log(`  Routers backfilled:  ${routersUpdated.count}`);
  log(`  Plans backfilled:    ${plansUpdated.count}`);
  log(`  Vouchers backfilled: ${vouchersUpdated.count}`);
  log(`  Sessions backfilled: ${sessionsUpdated.count}`);
  log(`  Logs migrated:       ${migratedLogs}`);
  log('══════════════════════════════════════════════════════');
  log('');
  log('NEXT STEP (Stage 2b): Once verified, run:');
  log('  npx prisma migrate dev --name make_tenantid_required');
  log('  to convert tenantId columns from nullable → required.');
  log('  DO NOT run this until you have confirmed all records');
  log('  have been backfilled (tenantId IS NOT NULL for all rows).');
}

main()
  .catch((e) => {
    console.error('[ERROR] Migration failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
