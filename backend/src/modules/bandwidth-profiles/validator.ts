import { z } from 'zod';

/**
 * Validation schema for creating a new Bandwidth Profile.
 */
export const createProfileSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, { message: 'Profile name is required.' })
    .max(50, { message: 'Profile name cannot exceed 50 characters.' }),
  downloadSpeed: z
    .string()
    .trim()
    .min(1, { message: 'Download speed limit is required.' }),
  uploadSpeed: z
    .string()
    .trim()
    .min(1, { message: 'Upload speed limit is required.' }),
  mikrotikQueueName: z
    .string()
    .trim()
    .min(1, { message: 'MikroTik Queue Name is required.' }),
  status: z
    .enum(['ACTIVE', 'DISABLED'])
    .default('ACTIVE')
});

/**
 * Validation schema for updating an existing Bandwidth Profile.
 */
export const updateProfileSchema = createProfileSchema.partial();

export type CreateProfileInput = z.infer<typeof createProfileSchema>;
export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
