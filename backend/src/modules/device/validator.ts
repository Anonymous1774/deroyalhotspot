import { z } from 'zod';

/**
 * Validation schema for device re-authentication.
 */
export const reauthenticateSchema = z.object({
  mac: z
    .string()
    .trim()
    .min(1, { message: 'MAC Address is required.' })
    .toUpperCase(),
  ip: z
    .string()
    .trim()
    .min(1, { message: 'IP Address is required.' })
});

export type ReauthenticateInput = z.infer<typeof reauthenticateSchema>;
