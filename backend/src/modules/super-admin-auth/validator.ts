/**
 * Super Admin Auth — Zod validators
 */
import { z } from 'zod';

export const superAdminLoginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(1, 'Password is required'),
});

export type SuperAdminLoginInput = z.infer<typeof superAdminLoginSchema>;
