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
    .union([z.number(), z.string()])
    .optional(),
  voucher_length: z
    .union([z.number(), z.string()])
    .optional(),
  router_host: z
    .string()
    .trim()
    .min(1, { message: 'Router host address cannot be empty.' })
    .optional(),
  router_port: z
    .union([z.number(), z.string()])
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
