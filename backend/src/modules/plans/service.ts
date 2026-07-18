import prisma from '../../lib/prisma';
import { CreatePlanInput, UpdatePlanInput } from './validator';
import { AppError } from '../bandwidth-profiles/service';

/**
 * Creates a new internet plan, resolving the bandwidth profile name to its ID.
 */
export async function createPlan(data: CreatePlanInput) {
  // Resolve bandwidth profile name to ID
  const profile = await prisma.bandwidthProfile.findUnique({
    where: { name: data.bandwidthProfile }
  });

  if (!profile) {
    throw new AppError(`Bandwidth profile '${data.bandwidthProfile}' not found. Please create it first.`, 422);
  }

  // Check if profile is active
  if (profile.status !== 'ACTIVE') {
    throw new AppError(`Cannot link plan to bandwidth profile '${profile.name}' because the profile is disabled.`, 400);
  }

  const { bandwidthProfile, ...planData } = data;

  return prisma.plan.create({
    data: {
      ...planData,
      bandwidthProfileId: profile.id
    },
    include: {
      bandwidthProfile: true
    }
  });
}

/**
 * Retrieves all internet plans, including their bandwidth profile metadata.
 */
export async function getAllPlans() {
  return prisma.plan.findMany({
    include: {
      bandwidthProfile: true
    },
    orderBy: { createdAt: 'desc' }
  });
}

/**
 * Retrieves a single internet plan by ID.
 */
export async function getPlanById(id: string) {
  const plan = await prisma.plan.findUnique({
    where: { id },
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
 * Updates an existing internet plan.
 */
export async function updatePlan(id: string, data: UpdatePlanInput) {
  // Check if plan exists
  const plan = await prisma.plan.findUnique({
    where: { id }
  });

  if (!plan) {
    throw new AppError('Internet plan not found.', 404);
  }

  let bandwidthProfileId = plan.bandwidthProfileId;

  // Resolve new bandwidth profile name if it was updated
  if (data.bandwidthProfile) {
    const profile = await prisma.bandwidthProfile.findUnique({
      where: { name: data.bandwidthProfile }
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
 * Deletes an internet plan by ID if it has no associated vouchers.
 */
export async function deletePlan(id: string) {
  // Check if plan exists
  const plan = await prisma.plan.findUnique({
    where: { id }
  });

  if (!plan) {
    throw new AppError('Internet plan not found.', 404);
  }

  // Check if any vouchers are linked to this plan
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
