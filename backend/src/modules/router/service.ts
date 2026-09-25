import prisma from '../../lib/prisma';
import { CreateRouterInput, UpdateRouterInput } from './validator';
import { AppError } from '../bandwidth-profiles/service';
import { encrypt, decrypt } from '../../utils/crypto';
import { testRouterConnection as testMikrotikConnection, getSingleRouterHealth, getOrCreateDefaultRouter } from '../../services/mikrotik/mikrotik-client';

/**
 * Strips password field before returning router details to clients.
 */
export function sanitizeRouter(router: any) {
  if (!router) return null;
  const { encryptedPassword, ...sanitized } = router;
  return sanitized;
}

/**
 * Fetches all non-deleted routers from the database.
 */
export async function getAllRouters() {
  await getOrCreateDefaultRouter(); // Ensure default router exists
  const routers = await prisma.router.findMany({
    where: { deletedAt: null },
    orderBy: { createdAt: 'desc' },
    include: {
      _count: {
        select: {
          vouchers: true,
          hotspotSessions: {
            where: { status: 'ONLINE' }
          }
        }
      }
    }
  });

  return routers.map(sanitizeRouter);
}

/**
 * Fetches a single router by ID.
 */
export async function getRouterById(id: string) {
  const router = await prisma.router.findFirst({
    where: { id, deletedAt: null },
    include: {
      _count: {
        select: {
          vouchers: true,
          hotspotSessions: {
            where: { status: 'ONLINE' }
          }
        }
      }
    }
  });

  if (!router) {
    throw new AppError('Router not found.', 404);
  }

  return sanitizeRouter(router);
}

/**
 * Creates a new MikroTik router record with encrypted password storage.
 */
export async function createRouter(data: CreateRouterInput) {
  // Check for duplicate name
  const existing = await prisma.router.findFirst({
    where: { name: data.name, deletedAt: null }
  });

  if (existing) {
    throw new AppError(`A router named '${data.name}' already exists.`, 400);
  }

  const encryptedPassword = encrypt(data.password);

  const router = await prisma.router.create({
    data: {
      name: data.name,
      description: data.description || null,
      host: data.host,
      apiPort: data.apiPort,
      apiSsl: data.apiSsl,
      username: data.username,
      encryptedPassword,
      enabled: data.enabled,
      status: 'UNKNOWN'
    }
  });

  // Attempt initial connection test asynchronously to update status & identity
  testMikrotikConnection(router.id).catch(() => {});

  return sanitizeRouter(router);
}

/**
 * Updates an existing router record. Preserves password if not explicitly modified.
 */
export async function updateRouter(id: string, data: UpdateRouterInput) {
  const router = await prisma.router.findFirst({
    where: { id, deletedAt: null }
  });

  if (!router) {
    throw new AppError('Router not found.', 404);
  }

  if (data.name && data.name !== router.name) {
    const duplicate = await prisma.router.findFirst({
      where: { name: data.name, deletedAt: null, NOT: { id } }
    });
    if (duplicate) {
      throw new AppError(`A router named '${data.name}' already exists.`, 400);
    }
  }

  const updateData: any = {};
  if (data.name !== undefined) updateData.name = data.name;
  if (data.description !== undefined) updateData.description = data.description;
  if (data.host !== undefined) updateData.host = data.host;
  if (data.apiPort !== undefined) updateData.apiPort = data.apiPort;
  if (data.apiSsl !== undefined) updateData.apiSsl = data.apiSsl;
  if (data.username !== undefined) updateData.username = data.username;
  if (data.enabled !== undefined) updateData.enabled = data.enabled;

  if (data.password !== undefined && data.password.trim() !== '') {
    updateData.encryptedPassword = encrypt(data.password.trim());
  }

  const updated = await prisma.router.update({
    where: { id },
    data: updateData
  });

  return sanitizeRouter(updated);
}

/**
 * Enables a router.
 */
export async function enableRouter(id: string) {
  const router = await prisma.router.findFirst({ where: { id, deletedAt: null } });
  if (!router) throw new AppError('Router not found.', 404);

  const updated = await prisma.router.update({
    where: { id },
    data: { enabled: true }
  });

  return sanitizeRouter(updated);
}

/**
 * Disables a router.
 */
export async function disableRouter(id: string) {
  const router = await prisma.router.findFirst({ where: { id, deletedAt: null } });
  if (!router) throw new AppError('Router not found.', 404);

  const updated = await prisma.router.update({
    where: { id },
    data: { enabled: false, status: 'OFFLINE' }
  });

  return sanitizeRouter(updated);
}

/**
 * Safely soft deletes a router after checking for active sessions or dependency risks.
 */
export async function deleteRouter(id: string) {
  const router = await prisma.router.findFirst({
    where: { id, deletedAt: null }
  });

  if (!router) {
    throw new AppError('Router not found.', 404);
  }

  // Check for active sessions on this router
  const activeSessionsCount = await prisma.hotspotSession.count({
    where: { routerId: id, status: 'ONLINE' }
  });

  if (activeSessionsCount > 0) {
    throw new AppError(
      `Cannot delete router '${router.name}'. It currently has ${activeSessionsCount} active online session(s). Disconnect active sessions first.`,
      400
    );
  }

  // Soft delete to preserve historical voucher and session records
  const softDeleted = await prisma.router.update({
    where: { id },
    data: {
      deletedAt: new Date(),
      enabled: false,
      status: 'OFFLINE'
    }
  });

  return sanitizeRouter(softDeleted);
}

/**
 * Tests connection to an existing router by ID or unsaved form payload.
 */
export async function testRouterConnection(id?: string, bodyConfig?: any) {
  if (id) {
    const router = await prisma.router.findFirst({ where: { id, deletedAt: null } });
    if (!router) throw new AppError('Router not found.', 404);

    return await testMikrotikConnection(id);
  }

  // Testing unsaved configuration
  const host = bodyConfig?.host;
  const port = bodyConfig?.apiPort ? Number(bodyConfig.apiPort) : 8728;
  const useSsl = Boolean(bodyConfig?.apiSsl);
  const username = bodyConfig?.username;
  const password = bodyConfig?.password;

  if (!host || !username) {
    throw new AppError('Host and username are required for connection testing.', 422);
  }

  return await testMikrotikConnection({
    host,
    port,
    useSsl,
    username,
    password: password || ''
  });
}

/**
 * Gets live health telemetry for a specific router.
 */
export async function getRouterHealthDetails(id: string) {
  const router = await prisma.router.findFirst({ where: { id, deletedAt: null } });
  if (!router) throw new AppError('Router not found.', 404);

  return await getSingleRouterHealth(id);
}
