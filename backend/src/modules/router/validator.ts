import { z } from 'zod';

export const createRouterSchema = z.object({
  name: z.string().min(2, 'Router name must be at least 2 characters'),
  description: z.string().optional(),
  host: z.string().min(1, 'Host/IP Address is required'),
  apiPort: z.number().int().min(1).max(65535).default(8728),
  apiSsl: z.boolean().default(false),
  username: z.string().min(1, 'Username is required'),
  password: z.string().min(1, 'Password is required'),
  enabled: z.boolean().default(true)
});

export const updateRouterSchema = z.object({
  name: z.string().min(2).optional(),
  description: z.string().optional(),
  host: z.string().min(1).optional(),
  apiPort: z.number().int().min(1).max(65535).optional(),
  apiSsl: z.boolean().optional(),
  username: z.string().min(1).optional(),
  password: z.string().optional(), // If empty string or undefined, password remains unchanged
  enabled: z.boolean().optional()
});

export const testRouterSchema = z.object({
  host: z.string().optional(),
  apiPort: z.number().int().min(1).max(65535).optional(),
  apiSsl: z.boolean().optional(),
  username: z.string().optional(),
  password: z.string().optional()
});

export type CreateRouterInput = z.infer<typeof createRouterSchema>;
export type UpdateRouterInput = z.infer<typeof updateRouterSchema>;
export type TestRouterInput = z.infer<typeof testRouterSchema>;
