import prisma from '../../lib/prisma';
import { CreateProfileInput, UpdateProfileInput } from './validator';

export class AppError extends Error {
  statusCode: number;

  constructor(message: string, statusCode: number) {
    super(message);
    this.statusCode = statusCode;
    Object.setPrototypeOf(this, AppError.prototype);
  }
}

/** Build a Prisma where clause that optionally scopes to a tenant. */
function tenantWhere(tenantId?: string, extra: Record<string, any> = {}) {
  return tenantId ? { tenantId, ...extra } : extra;
}

/**
 * Creates a new bandwidth profile (tenant-scoped).
 */
export async function createProfile(data: CreateProfileInput, tenantId?: string) {
  const existing = await prisma.bandwidthProfile.findFirst({
    where: tenantWhere(tenantId, { name: data.name })
  });

  if (existing) {
    throw new AppError(`A bandwidth profile with the name '${data.name}' already exists.`, 409);
  }

  return prisma.bandwidthProfile.create({
    data: {
      ...data,
      ...(tenantId ? { tenantId } : {})
    }
  });
}

/**
 * Retrieves all bandwidth profiles (tenant-scoped when tenantId provided).
 */
export async function getAllProfiles(tenantId?: string) {
  return prisma.bandwidthProfile.findMany({
    where: tenantId ? { tenantId } : {},
    orderBy: { createdAt: 'desc' }
  });
}

/**
 * Retrieves a single bandwidth profile by ID (tenant-scoped).
 */
export async function getProfileById(id: string, tenantId?: string) {
  const profile = await prisma.bandwidthProfile.findFirst({
    where: tenantWhere(tenantId, { id })
  });

  if (!profile) {
    throw new AppError('Bandwidth profile not found.', 404);
  }

  return profile;
}

/**
 * Updates an existing bandwidth profile (tenant-scoped).
 */
export async function updateProfile(id: string, data: UpdateProfileInput, tenantId?: string) {
  const profile = await prisma.bandwidthProfile.findFirst({
    where: tenantWhere(tenantId, { id })
  });

  if (!profile) {
    throw new AppError('Bandwidth profile not found.', 404);
  }

  if (data.name && data.name !== profile.name) {
    const existing = await prisma.bandwidthProfile.findFirst({
      where: tenantWhere(tenantId, { name: data.name })
    });

    if (existing) {
      throw new AppError(`A bandwidth profile with the name '${data.name}' already exists.`, 409);
    }
  }

  return prisma.bandwidthProfile.update({
    where: { id },
    data
  });
}

/**
 * Deletes a bandwidth profile by ID if it's not referenced by any plan (tenant-scoped).
 */
export async function deleteProfile(id: string, tenantId?: string) {
  const profile = await prisma.bandwidthProfile.findFirst({
    where: tenantWhere(tenantId, { id })
  });

  if (!profile) {
    throw new AppError('Bandwidth profile not found.', 404);
  }

  const planReference = await prisma.plan.findFirst({
    where: { bandwidthProfileId: id }
  });

  if (planReference) {
    throw new AppError('Cannot delete bandwidth profile. It is referenced by one or more internet plans.', 400);
  }

  return prisma.bandwidthProfile.delete({
    where: { id }
  });
}
