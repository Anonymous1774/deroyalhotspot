/**
 * Customer Auth — Zod validators
 */
import { z } from 'zod';

export const customerRegisterSchema = z.object({
  fullName: z.string().min(2).max(120),
  email: z.string().email('Please enter a valid email address'),
  phone: z.string().min(7).max(20).optional(),
  password: z
    .string()
    .min(6, 'Password must be at least 6 characters')
    .max(128),
  tenantSlug: z.string().min(2), // which ISP this customer belongs to
});

export const customerLoginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
  tenantSlug: z.string().min(2),
});

export type CustomerRegisterInput = z.infer<typeof customerRegisterSchema>;
export type CustomerLoginInput    = z.infer<typeof customerLoginSchema>;
