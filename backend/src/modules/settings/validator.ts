import { z } from 'zod';

/**
 * Validation schema for updating system settings and router configuration.
 */
export const updateSettingsSchema = z.object({
  company_name: z
    .string()
    .trim()
    .min(1, { message: 'Company name cannot be empty.' })
    .optional(),
  support_phone: z
    .string()
    .trim()
    .min(1, { message: 'Support phone number cannot be empty.' })
    .optional(),
  support_email: z
    .string()
    .trim()
    .email({ message: 'A valid support email is required.' })
    .optional(),
  session_timeout: z
    .string()
    .regex(/^\d+$/, { message: 'Session timeout must be a positive integer in seconds.' })
    .optional(),
  voucher_length: z
    .number()
    .int()
    .min(4, { message: 'Voucher length must be at least 4 characters.' })
    .max(20, { message: 'Voucher length cannot exceed 20 characters.' })
    .optional(),
  router_host: z
    .string()
    .trim()
    .min(1, { message: 'Router host address cannot be empty.' })
    .optional(),
  router_port: z
    .number()
    .int()
    .positive({ message: 'API Port must be a positive integer.' })
    .optional(),
  router_username: z
    .string()
    .trim()
    .min(1, { message: 'Router API username cannot be empty.' })
    .optional(),
  router_password: z
    .string()
    .optional()
});

export type UpdateSettingsInput = z.infer<typeof updateSettingsSchema>;
