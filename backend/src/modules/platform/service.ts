/**
 * Platform API — Super Admin management of all tenants
 */
import prisma from '../../lib/prisma';

export class AppError extends Error {
  statusCode: number;
  constructor(message: string, statusCode = 400) { super(message); this.statusCode = statusCode; }
}

// ─── Platform overview stats ──────────────────────────────────

export async function getPlatformStats() {
  const [
    totalTenants,
    activeTenants,
    suspendedTenants,
    trialTenants,
    totalRouters,
    totalVouchers,
    totalUsers,
  ] = await Promise.all([
    prisma.tenant.count(),
    prisma.tenant.count({ where: { status: 'ACTIVE' } }),
    prisma.tenant.count({ where: { status: 'SUSPENDED' } }),
    prisma.tenantSubscription.count({ where: { status: 'TRIAL' } }),
    prisma.router.count(),
    prisma.voucher.count(),
    prisma.user.count(),
  ]);

  return { totalTenants, activeTenants, suspendedTenants, trialTenants, totalRouters, totalVouchers, totalUsers };
}

// ─── Tenant management ────────────────────────────────────────

export async function listTenants(page = 1, limit = 20, search?: string, status?: string) {
  const skip = (page - 1) * limit;
  const where: any = {};
  if (search) {
    where.OR = [
      { name: { contains: search, mode: 'insensitive' as const } },
      { email: { contains: search, mode: 'insensitive' as const } },
    ];
  }
  if (status && status !== 'All') where.status = status;

  const [tenants, total] = await Promise.all([
    prisma.tenant.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: {
        subscription: { include: { plan: { select: { name: true } } } },
        _count: { select: { tenantUsers: true, routers: true, vouchers: true } },
      },
    }),
    prisma.tenant.count({ where }),
  ]);

  // Normalise field names to match frontend expectations
  const normalised = tenants.map((t: any) => ({
    id: t.id,
    businessName: t.name,
    businessEmail: t.email,
    status: t.status,
    createdAt: t.createdAt.toISOString(),
    isFirstTenant: t.isFirstTenant,
    subscription: t.subscription ? {
      status: t.subscription.status,
      plan: t.subscription.plan,
      trialEndsAt: t.subscription.trialEndsAt?.toISOString() ?? null,
    } : undefined,
    _count: t._count,
  }));

  return { tenants: normalised, total, page, limit, totalPages: Math.ceil(total / limit) };
}

export async function getTenantById(id: string) {
  const tenant = await prisma.tenant.findUnique({
    where: { id },
    include: {
      subscription: { include: { plan: true, payments: { orderBy: { createdAt: 'desc' }, take: 5 } } },
      tenantUsers: { include: { user: { select: { id: true, fullName: true, email: true, lastLogin: true, isActive: true } } } },
      _count: { select: { routers: true, plans: true, vouchers: true, customers: true } },
    },
  });
  if (!tenant) throw new AppError('Tenant not found.', 404);
  return tenant;
}

export async function suspendTenant(id: string, adminId: string, adminEmail: string) {
  const tenant = await prisma.tenant.findUnique({ where: { id } });
  if (!tenant) throw new AppError('Tenant not found.', 404);
  if (tenant.isFirstTenant) throw new AppError('The founding tenant cannot be suspended.', 403);

  await prisma.tenant.update({ where: { id }, data: { status: 'SUSPENDED' } });

  await prisma.auditLog.create({
    data: {
      tenantId: id,
      userId: adminId,
      actorType: 'superadmin',
      actorEmail: adminEmail,
      action: 'Tenant Suspended',
      module: 'PLATFORM',
      description: `Super Admin suspended tenant '${tenant.name}'.`,
    },
  });
}

export async function activateTenant(id: string, adminId: string, adminEmail: string) {
  const tenant = await prisma.tenant.findUnique({ where: { id } });
  if (!tenant) throw new AppError('Tenant not found.', 404);

  await prisma.tenant.update({ where: { id }, data: { status: 'ACTIVE' } });

  await prisma.auditLog.create({
    data: {
      tenantId: id,
      userId: adminId,
      actorType: 'superadmin',
      actorEmail: adminEmail,
      action: 'Tenant Activated',
      module: 'PLATFORM',
      description: `Super Admin activated tenant '${tenant.name}'.`,
    },
  });
}

// ─── Subscription plan management ────────────────────────────

export async function listSubscriptionPlans() {
  return prisma.subscriptionPlan.findMany({ orderBy: { sortOrder: 'asc' } });
}

export async function createSubscriptionPlan(data: {
  name: string; description?: string; price: number; billingInterval?: string; billingCycle?: string;
  routerLimit: number; staffLimit: number; trialDays: number; features?: string[];
}) {
  const billingInterval = data.billingInterval || (data.billingCycle?.toLowerCase() ?? 'monthly');
  return prisma.subscriptionPlan.create({
    data: {
      name: data.name,
      description: data.description,
      price: data.price,
      billingInterval,
      routerLimit: data.routerLimit,
      staffLimit: data.staffLimit,
      trialDays: data.trialDays,
      features: JSON.stringify(data.features || []),
      isActive: true,
    },
  });
}

export async function updateSubscriptionPlan(id: string, data: {
  name?: string; description?: string; price?: number; billingInterval?: string; billingCycle?: string;
  routerLimit?: number; staffLimit?: number; trialDays?: number; features?: string[]; isActive?: boolean;
}) {
  const update: any = { ...data };
  if (data.billingCycle && !data.billingInterval) update.billingInterval = data.billingCycle.toLowerCase();
  delete update.billingCycle;
  if (data.features) update.features = JSON.stringify(data.features);
  return prisma.subscriptionPlan.update({ where: { id }, data: update });
}

export async function deleteSubscriptionPlan(id: string) {
  // Check no tenants are using this plan
  const inUse = await prisma.tenantSubscription.count({ where: { planId: id } });
  if (inUse > 0) {
    throw new AppError(`Cannot delete — ${inUse} tenant(s) are subscribed to this plan.`, 409);
  }
  return prisma.subscriptionPlan.delete({ where: { id } });
}

export async function activateTenantSubscription(tenantId: string, planId: string, adminId: string, adminEmail: string) {
  const [tenant, plan] = await Promise.all([
    prisma.tenant.findUnique({ where: { id: tenantId } }),
    prisma.subscriptionPlan.findUnique({ where: { id: planId } }),
  ]);
  if (!tenant) throw new AppError('Tenant not found.', 404);
  if (!plan) throw new AppError('Subscription plan not found.', 404);

  const now = new Date();
  const periodEnd = new Date(now);
  periodEnd.setMonth(periodEnd.getMonth() + (plan.billingInterval === 'annual' ? 12 : 1));

  await prisma.tenantSubscription.upsert({
    where: { tenantId },
    create: { tenantId, planId, status: 'ACTIVE', activatedAt: now, currentPeriodStart: now, currentPeriodEnd: periodEnd },
    update: { planId, status: 'ACTIVE', activatedAt: now, currentPeriodStart: now, currentPeriodEnd: periodEnd, trialEndsAt: null },
  });

  await prisma.auditLog.create({
    data: {
      tenantId,
      userId: adminId,
      actorType: 'superadmin',
      actorEmail: adminEmail,
      action: 'Subscription Activated',
      module: 'PLATFORM',
      description: `Subscription for '${tenant.name}' activated on plan '${plan.name}'.`,
    },
  });
}

// ─── Audit logs ───────────────────────────────────────────────

export async function getPlatformAuditLogs(page = 1, limit = 50, module?: string) {
  const skip = (page - 1) * limit;
  const where = module ? { module } : {};
  const [logs, total] = await Promise.all([
    prisma.auditLog.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: { tenant: { select: { name: true, slug: true } } },
    }),
    prisma.auditLog.count({ where }),
  ]);
  // Flatten for frontend — return array directly with pagination meta
  return { logs, total, page, limit, totalPages: Math.ceil(total / limit) };
}
