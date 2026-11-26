/**
 * Prisma client singleton.
 *
 * The `any` cast on the extended client is a local development
 * compatibility shim: the Prisma client types only fully reflect the
 * schema after `prisma generate` runs against a live database.
 *
 * On the production server, run:
 *   npx prisma generate
 *   npx prisma migrate deploy
 *
 * This module re-exports the client typed as `PrismaClient` so IDE
 * completion still works for the original models, while new multi-
 * tenant models are accessed via the `any`-cast path.
 */

import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };

const prisma: any =
  globalForPrisma.prisma ||
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['warn', 'error'] : ['error'],
  });

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}

export default prisma;
