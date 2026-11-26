import prisma from '../../lib/prisma';
import { CreatePlanInput, UpdatePlanInput } from './validator';
import { AppError } from '../bandwidth-profiles/service';

/** Build a Prisma where clause that optionally scopes to a tenant. */
function tenantWhere(tenantId?: string, extra: Record<string, any> = {}) {
  return tenantId ? { tenantId, ...extra } : extra;
}

/**
 * Creates a new internet plan, resolving the bandwidth profile name to its ID.
 */
export async function createPlan(data: CreatePlanInput, tenantId?: string) {
  // Resolve bandwidth profile — tenant-scoped or global
  const profile = await prisma.bandwidthProfile.findFirst({
    where: tenantWhere(tenantId, { name: data.bandwidthProfile })
  });

  if (!profile) {
    throw new AppError(`Bandwidth profile '${data.bandwidthProfile}' not found. Please create it first.`, 422);
  }

  if (profile.status !== 'ACTIVE') {
    throw new AppError(`Cannot link plan to bandwidth profile '${profile.name}' because the profile is disabled.`, 400);
  }

  const { bandwidthProfile, ...planData } = data;

  return prisma.plan.create({
    data: {
      ...planData,
      bandwidthProfileId: profile.id,
      ...(tenantId ? { tenantId } : {})
    },
    include: {
      bandwidthProfile: true
    }
  });
}

/**
 * Retrieves all internet plans, scoped to tenant when provided.
 */
export async function getAllPlans(tenantId?: string) {
  return prisma.plan.findMany({
    where: tenantId ? { tenantId } : {},
    include: {
      bandwidthProfile: true
    },
    orderBy: { createdAt: 'desc' }
  });
}

/**
 * Retrieves a single internet plan by ID (tenant-scoped).
 */
export async function getPlanById(id: string, tenantId?: string) {
  const plan = await prisma.plan.findFirst({
    where: tenantWhere(tenantId, { id }),
    include: {
      bandwidthProfile: true
    }
  });

  if (!plan) {
    throw new AppError('Internet plan not found.', 404);
  }

  return plan;
}

/**
 * Updates an existing internet plan (tenant-scoped).
 */
export async function updatePlan(id: string, data: UpdatePlanInput, tenantId?: string) {
  const plan = await prisma.plan.findFirst({
    where: tenantWhere(tenantId, { id })
  });

  if (!plan) {
    throw new AppError('Internet plan not found.', 404);
  }

  let bandwidthProfileId = plan.bandwidthProfileId;

  if (data.bandwidthProfile) {
    const profile = await prisma.bandwidthProfile.findFirst({
      where: tenantWhere(tenantId, { name: data.bandwidthProfile })
    });

    if (!profile) {
      throw new AppError(`Bandwidth profile '${data.bandwidthProfile}' not found.`, 422);
    }
    bandwidthProfileId = profile.id;
  }

  const { bandwidthProfile, ...planData } = data;

  return prisma.plan.update({
    where: { id },
    data: {
      ...planData,
      bandwidthProfileId
    },
    include: {
      bandwidthProfile: true
    }
  });
}

/**
 * Deletes an internet plan by ID if it has no associated vouchers (tenant-scoped).
 */
export async function deletePlan(id: string, tenantId?: string) {
  const plan = await prisma.plan.findFirst({
    where: tenantWhere(tenantId, { id })
  });

  if (!plan) {
    throw new AppError('Internet plan not found.', 404);
  }

  const voucherReference = await prisma.voucher.findFirst({
    where: { planId: id }
  });

  if (voucherReference) {
    throw new AppError('Cannot delete internet plan. Vouchers have already been generated for this plan.', 400);
  }

  return prisma.plan.delete({
    where: { id }
  });
}
