import { z } from 'zod';

/**
 * Validation schema for creating a new Internet Plan.
 */
export const createPlanSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, { message: 'Plan name is required.' })
    .max(100, { message: 'Plan name cannot exceed 100 characters.' }),
  price: z
    .number({ required_error: 'Price is required.' })
    .min(0.01, { message: 'Price must be greater than zero.' }),
  duration: z
    .number({ required_error: 'Duration is required.' })
    .int({ message: 'Duration must be an integer.' })
    .min(1, { message: 'Duration must be at least 1.' }),
  durationUnit: z
    .enum(['minutes', 'hours', 'days'], {
      required_error: 'Duration unit is required.',
      invalid_type_error: 'Duration unit must be either minutes, hours, or days.'
    }),
  bandwidthProfile: z
    .string()
    .trim()
    .min(1, { message: 'Bandwidth profile name is required.' }),
  description: z
    .string()
    .trim()
    .optional(),
  status: z
    .enum(['ACTIVE', 'DISABLED'])
    .default('ACTIVE')
});

/**
 * Validation schema for updating an existing Internet Plan.
 */
export const updatePlanSchema = createPlanSchema.partial();

export type CreatePlanInput = z.infer<typeof createPlanSchema>;
export type UpdatePlanInput = z.infer<typeof updatePlanSchema>;
