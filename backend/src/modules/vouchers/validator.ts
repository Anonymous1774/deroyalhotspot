import { z } from 'zod';

/**
 * Validation schema for bulk voucher generation.
 */
export const generateVouchersSchema = z.object({
  planId: z
    .string()
    .uuid({ message: 'A valid Plan ID (UUID) is required.' }),
  count: z
    .number({ required_error: 'Quantity is required.' })
    .int({ message: 'Quantity must be an integer.' })
    .min(1, { message: 'Must generate at least 1 voucher.' })
    .max(500, { message: 'Cannot generate more than 500 vouchers per batch.' })
});

/**
 * Validation schema for updating voucher status.
 */
export const updateStatusSchema = z.object({
  status: z.enum(['UNUSED', 'ACTIVE', 'EXPIRED', 'DISABLED'], {
    required_error: 'Status is required.',
    invalid_type_error: 'Invalid voucher status value.'
  })
});

export type GenerateVouchersInput = z.infer<typeof generateVouchersSchema>;
export type UpdateStatusInput = z.infer<typeof updateStatusSchema>;

/**
 * Validation schema for voucher activation.
 */
export const activateVoucherSchema = z.object({
  voucher: z
    .string()
    .trim()
    .min(1, { message: 'Voucher code is required.' })
    .toUpperCase()
});

export type ActivateVoucherInput = z.infer<typeof activateVoucherSchema>;
