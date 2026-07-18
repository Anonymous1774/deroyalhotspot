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

/**
 * Creates a new bandwidth profile.
 */
export async function createProfile(data: CreateProfileInput) {
  // Check for duplicate name
  const existing = await prisma.bandwidthProfile.findUnique({
    where: { name: data.name }
  });

  if (existing) {
    throw new AppError(`A bandwidth profile with the name '${data.name}' already exists.`, 409);
  }

  return prisma.bandwidthProfile.create({
    data
  });
}

/**
 * Retrieves all bandwidth profiles.
 */
export async function getAllProfiles() {
  return prisma.bandwidthProfile.findMany({
    orderBy: { createdAt: 'desc' }
  });
}

/**
 * Retrieves a single bandwidth profile by ID.
 */
export async function getProfileById(id: string) {
  const profile = await prisma.bandwidthProfile.findUnique({
    where: { id }
  });

  if (!profile) {
    throw new AppError('Bandwidth profile not found.', 404);
  }

  return profile;
}

/**
 * Updates an existing bandwidth profile.
 */
export async function updateProfile(id: string, data: UpdateProfileInput) {
  // Check if profile exists
  const profile = await prisma.bandwidthProfile.findUnique({
    where: { id }
  });

  if (!profile) {
    throw new AppError('Bandwidth profile not found.', 404);
  }

  // Check name conflicts if name is being changed
  if (data.name && data.name !== profile.name) {
    const existing = await prisma.bandwidthProfile.findUnique({
      where: { name: data.name }
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
 * Deletes a bandwidth profile by ID if it's not referenced by any plan.
 */
export async function deleteProfile(id: string) {
  // Check if profile exists
  const profile = await prisma.bandwidthProfile.findUnique({
    where: { id }
  });

  if (!profile) {
    throw new AppError('Bandwidth profile not found.', 404);
  }

  // Check if any plans reference this profile
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
