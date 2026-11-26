/**
 * ISP Auth Service
 * ================
 * Handles: ISP tenant registration, ISP user login, profile fetch, logout.
 *
 * Security:
 *  - Argon2id password hashing (via existing hash util)
 *  - Signed ISP JWT (type: 'isp') with tenantId and tenantRole
 *  - Rate limiting applied at the route level
 *  - Audit log written on every login and registration
 */
import prisma from '../../lib/prisma';
import { hashPassword, comparePassword } from '../../utils/hash';
import { signIspToken } from '../../utils/jwt';
import { IspRegisterInput, IspLoginInput } from './validator';

export class AppError extends Error {
  statusCode: number;
  constructor(message: string, statusCode = 400) {
    super(message);
    this.statusCode = statusCode;
  }
}

/** Converts a business name into a unique URL-safe slug. */
async function generateTenantSlug(businessName: string): Promise<string> {
  const base = businessName
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 50);

  let slug = base;
  let attempt = 0;

  while (true) {
    const existing = await prisma.tenant.findUnique({ where: { slug } });
    if (!existing) return slug;
    attempt++;
    slug = `${base}-${attempt}`;
  }
}

// ─── Registration ─────────────────────────────────────────────

export async function registerIsp(data: IspRegisterInput, ipAddress?: string | null) {
  // 1. Check email not already in use
  const existingUser = await prisma.user.findUnique({
    where: { email: data.email },
  });

  if (existingUser) {
    throw new AppError(
      'An account with this email address already exists. Please log in or use a different email.',
      409,
    );
  }

  // 2. Generate a unique slug for the tenant
  const slug = await generateTenantSlug(data.businessName);

  // 3. Hash the password
  const passwordHash = await hashPassword(data.password);

  // 4. Find the default subscription plan (or create one)
  let defaultPlan = await prisma.subscriptionPlan.findFirst({
    where: { isActive: true },
    orderBy: { sortOrder: 'asc' },
  });

  if (!defaultPlan) {
    defaultPlan = await prisma.subscriptionPlan.create({
      data: {
        name: 'DHOS Starter',
        description: 'Entry-level plan',
        price: 0,
        billingInterval: 'monthly',
        routerLimit: 3,
        staffLimit: 3,
        trialDays: 14,
        features: JSON.stringify(['Router management', 'Plans', 'Vouchers', 'Sessions']),
        isActive: true,
      },
    });
  }

  // 5. Create Tenant, User, TenantUser, Subscription in a transaction
  const result = await prisma.$transaction(async (tx: any) => {
    // Create tenant
    const tenant = await tx.tenant.create({
      data: {
        name: data.businessName,
        slug,
        email: data.email,
        phone: data.phone || null,
        country: data.country || null,
        address: data.address || null,
        status: 'ACTIVE',
      },
    });

    // Create user (platform-level account)
    const user = await tx.user.create({
      data: {
        fullName: data.ownerFullName,
        email: data.email,
        passwordHash,
        isActive: true,
        isSuperAdmin: false,
      },
    });

    // Link user to tenant as OWNER
    await tx.tenantUser.create({
      data: {
        tenantId: tenant.id,
        userId: user.id,
        role: 'OWNER',
        isActive: true,
      },
    });

    // Create trial subscription
    const trialEndsAt = new Date();
    trialEndsAt.setDate(trialEndsAt.getDate() + (defaultPlan!.trialDays || 14));

    await tx.tenantSubscription.create({
      data: {
        tenantId: tenant.id,
        planId: defaultPlan!.id,
        status: defaultPlan!.trialDays > 0 ? 'TRIAL' : 'ACTIVE',
        trialEndsAt: defaultPlan!.trialDays > 0 ? trialEndsAt : null,
        activatedAt: defaultPlan!.trialDays === 0 ? new Date() : null,
      },
    });

    // Write audit log
    await tx.auditLog.create({
      data: {
        tenantId: tenant.id,
        userId: user.id,
        actorType: 'owner',
        actorEmail: user.email,
        action: 'ISP Registration',
        module: 'AUTH',
        description: `New ISP tenant '${tenant.name}' registered by ${user.email}.`,
        ipAddress: ipAddress || null,
      },
    });

    return { tenant, user };
  });

  // 6. Issue JWT
  const token = signIspToken({
    sub: result.user.id,
    email: result.user.email,
    tenantId: result.tenant.id,
    tenantRole: 'OWNER',
  });

  return {
    token,
    user: {
      id: result.user.id,
      fullName: result.user.fullName,
      email: result.user.email,
      tenantId: result.tenant.id,
      tenantRole: 'OWNER' as const,
    },
    tenant: {
      id: result.tenant.id,
      name: result.tenant.name,
      slug: result.tenant.slug,
    },
  };
}

// ─── Login ────────────────────────────────────────────────────

export async function loginIsp(data: IspLoginInput, ipAddress?: string | null) {
  // 1. Find user
  const user = await prisma.user.findUnique({ where: { email: data.email } });

  if (!user) {
    throw new AppError('Invalid email address or password.', 401);
  }

  // 2. Check active
  if (!user.isActive) {
    throw new AppError('Your account has been disabled. Please contact support.', 403);
  }

  // 3. Super admins must use the platform login, not this endpoint
  if (user.isSuperAdmin) {
    throw new AppError('Invalid email address or password.', 401);
  }

  // 4. Verify password
  const valid = await comparePassword(data.password, user.passwordHash);
  if (!valid) {
    throw new AppError('Invalid email address or password.', 401);
  }

  // 5. Find the tenant membership (users can only belong to one tenant as owner)
  const tenantUser = await prisma.tenantUser.findFirst({
    where: { userId: user.id, isActive: true },
    include: { tenant: true },
    orderBy: { createdAt: 'asc' }, // first tenant = primary
  });

  if (!tenantUser) {
    throw new AppError('No active workspace found for this account. Please contact support.', 403);
  }

  if (tenantUser.tenant.status === 'SUSPENDED') {
    throw new AppError(
      'Your business account has been suspended. Please contact DHOS support.',
      403,
    );
  }

  // 5b. Check subscription status
  const subscription = await prisma.tenantSubscription.findUnique({
    where: { tenantId: tenantUser.tenantId },
  });

  if (subscription) {
    if (subscription.status === 'EXPIRED') {
      throw new AppError(
        'Your DHOS subscription has expired. Please contact support to renew.',
        403,
      );
    }
    if (subscription.status === 'CANCELLED') {
      throw new AppError(
        'Your DHOS subscription has been cancelled. Please contact support.',
        403,
      );
    }
    // Auto-expire trial if past trial end date
    if (
      subscription.status === 'TRIAL' &&
      subscription.trialEndsAt &&
      subscription.trialEndsAt < new Date()
    ) {
      await prisma.tenantSubscription.update({
        where: { tenantId: tenantUser.tenantId },
        data: { status: 'EXPIRED' },
      });
      throw new AppError(
        'Your 14-day DHOS trial has expired. Please contact support to activate a subscription.',
        403,
      );
    }
  }

  // 6. Update last login
  await prisma.user.update({
    where: { id: user.id },
    data: { lastLogin: new Date() },
  });

  // 7. Write audit log
  await prisma.auditLog.create({
    data: {
      tenantId: tenantUser.tenantId,
      userId: user.id,
      actorType: 'staff',
      actorEmail: user.email,
      action: 'ISP User Login',
      module: 'AUTH',
      description: `${user.email} logged in to workspace '${tenantUser.tenant.name}'.`,
      ipAddress: ipAddress || null,
    },
  });

  // 8. Issue JWT with tenant context
  const token = signIspToken({
    sub: user.id,
    email: user.email,
    tenantId: tenantUser.tenantId,
    tenantRole: tenantUser.role,
  });

  return {
    token,
    user: {
      id: user.id,
      fullName: user.fullName,
      email: user.email,
      tenantId: tenantUser.tenantId,
      tenantRole: tenantUser.role,
      lastLogin: user.lastLogin?.toISOString() ?? null,
    },
    tenant: {
      id: tenantUser.tenant.id,
      name: tenantUser.tenant.name,
      slug: tenantUser.tenant.slug,
      status: tenantUser.tenant.status,
    },
  };
}

// ─── Profile ──────────────────────────────────────────────────

export async function getIspProfile(userId: string, tenantId: string) {
  const [user, tenantUser, subscription] = await Promise.all([
    prisma.user.findUnique({ where: { id: userId } }),
    prisma.tenantUser.findFirst({
      where: { userId, tenantId, isActive: true },
      include: { tenant: true },
    }),
    prisma.tenantSubscription.findUnique({
      where: { tenantId },
      include: { plan: true },
    }),
  ]);

  if (!user || !tenantUser) {
    throw new AppError('User or workspace not found.', 404);
  }

  return {
    id: user.id,
    fullName: user.fullName,
    email: user.email,
    tenantId,
    tenantRole: tenantUser.role,
    tenant: {
      id: tenantUser.tenant.id,
      name: tenantUser.tenant.name,
      slug: tenantUser.tenant.slug,
      status: tenantUser.tenant.status,
    },
    subscription: subscription
      ? {
          status: subscription.status,
          planName: subscription.plan.name,
          trialEndsAt: subscription.trialEndsAt?.toISOString() ?? null,
          currentPeriodEnd: subscription.currentPeriodEnd?.toISOString() ?? null,
        }
      : null,
    lastLogin: user.lastLogin?.toISOString() ?? null,
  };
}
