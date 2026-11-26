/**
 * ISP Auth — Zod validators
 * Covers: register ISP, login, password reset request
 */
import { z } from 'zod';

export const ispRegisterSchema = z.object({
  businessName: z
    .string()
    .min(2, 'Business name must be at least 2 characters')
    .max(120, 'Business name is too long'),
  ownerFullName: z
    .string()
    .min(2, 'Full name must be at least 2 characters')
    .max(120),
  email: z.string().email('Please enter a valid email address'),
  phone: z
    .string()
    .min(7, 'Phone number is too short')
    .max(20, 'Phone number is too long'),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .max(128, 'Password is too long')
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
      'Password must contain at least one uppercase letter, one lowercase letter, and one number',
    ),
  country: z.string().min(2).max(60).optional(),
  address: z.string().max(255).optional(),
});

export const ispLoginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(1, 'Password is required'),
});

export const forgotPasswordSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
});

export const resetPasswordSchema = z.object({
  token: z.string().min(1),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .max(128)
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, 'Password must contain uppercase, lowercase and a number'),
});

export type IspRegisterInput = z.infer<typeof ispRegisterSchema>;
export type IspLoginInput    = z.infer<typeof ispLoginSchema>;
