import { z } from 'zod';

/**
 * Validation schema for disconnecting a customer hotspot session.
 */
export const disconnectUserSchema = z.object({
  username: z
    .string()
    .trim()
    .min(1, { message: 'Username is required to trigger disconnection.' })
});

export type DisconnectUserInput = z.infer<typeof disconnectUserSchema>;
