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

/** Build a Prisma where clause that optionally scopes to a tenant. */
function tenantWhere(tenantId?: string, extra: Record<string, any> = {}) {
  return tenantId ? { tenantId, ...extra } : extra;
}

/**
 * Fetches all non-deleted routers from the database, scoped to tenant when provided.
 */
export async function getAllRouters(tenantId?: string) {
  if (!tenantId) {
    await getOrCreateDefaultRouter();
  }
  const routers = await prisma.router.findMany({
    where: tenantWhere(tenantId, { deletedAt: null }),
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
 * Fetches a single router by ID, verifying tenant ownership.
 */
export async function getRouterById(id: string, tenantId?: string) {
  const router = await prisma.router.findFirst({
    where: tenantWhere(tenantId, { id, deletedAt: null }),
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
export async function createRouter(data: CreateRouterInput, tenantId?: string) {
  // Check for duplicate name within tenant scope
  const existing = await prisma.router.findFirst({
    where: tenantWhere(tenantId, { name: data.name, deletedAt: null })
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
      status: 'UNKNOWN',
      ...(tenantId ? { tenantId } : {})
    }
  });

  // Attempt initial connection test asynchronously to update status & identity
  testMikrotikConnection(router.id).catch(() => {});

  return sanitizeRouter(router);
}

/**
 * Updates an existing router record. Verifies tenant ownership. Preserves password if not explicitly modified.
 */
export async function updateRouter(id: string, data: UpdateRouterInput, tenantId?: string) {
  const router = await prisma.router.findFirst({
    where: tenantWhere(tenantId, { id, deletedAt: null })
  });

  if (!router) {
    throw new AppError('Router not found.', 404);
  }

  if (data.name && data.name !== router.name) {
    const duplicate = await prisma.router.findFirst({
      where: tenantWhere(tenantId, { name: data.name, deletedAt: null, NOT: { id } })
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
 * Enables a router (tenant-scoped).
 */
export async function enableRouter(id: string, tenantId?: string) {
  const router = await prisma.router.findFirst({ where: tenantWhere(tenantId, { id, deletedAt: null }) });
  if (!router) throw new AppError('Router not found.', 404);

  const updated = await prisma.router.update({
    where: { id },
    data: { enabled: true }
  });

  return sanitizeRouter(updated);
}

/**
 * Disables a router (tenant-scoped).
 */
export async function disableRouter(id: string, tenantId?: string) {
  const router = await prisma.router.findFirst({ where: tenantWhere(tenantId, { id, deletedAt: null }) });
  if (!router) throw new AppError('Router not found.', 404);

  const updated = await prisma.router.update({
    where: { id },
    data: { enabled: false, status: 'OFFLINE' }
  });

  return sanitizeRouter(updated);
}

/**
 * Safely soft deletes a router after checking for active sessions (tenant-scoped).
 */
export async function deleteRouter(id: string, tenantId?: string) {
  const router = await prisma.router.findFirst({
    where: tenantWhere(tenantId, { id, deletedAt: null })
  });

  if (!router) {
    throw new AppError('Router not found.', 404);
  }

  const activeSessionsCount = await prisma.hotspotSession.count({
    where: { routerId: id, status: 'ONLINE' }
  });

  if (activeSessionsCount > 0) {
    throw new AppError(
      `Cannot delete router '${router.name}'. It currently has ${activeSessionsCount} active online session(s). Disconnect active sessions first.`,
      400
    );
  }

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
export async function testRouterConnection(id?: string, bodyConfig?: any, tenantId?: string) {
  if (id) {
    const router = await prisma.router.findFirst({ where: tenantWhere(tenantId, { id, deletedAt: null }) });
    if (!router) throw new AppError('Router not found.', 404);

    return await testMikrotikConnection(id);
  }

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
 * Gets live health telemetry for a specific router (tenant-scoped).
 */
export async function getRouterHealthDetails(id: string, tenantId?: string) {
  const router = await prisma.router.findFirst({ where: tenantWhere(tenantId, { id, deletedAt: null }) });
  if (!router) throw new AppError('Router not found.', 404);

  return await getSingleRouterHealth(id);
}
