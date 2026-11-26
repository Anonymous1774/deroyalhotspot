import prisma from '../../lib/prisma';
import { AppError } from '../bandwidth-profiles/service';
import { disconnectHotspotSession } from '../../services/mikrotik/mikrotik-client';

interface SessionsQueryFilters {
  page?: number;
  limit?: number;
  routerId?: string;
  tenantId?: string;
}

/** Build a Prisma where clause that optionally scopes to a tenant via router join. */
function tenantRouterWhere(tenantId?: string) {
  if (!tenantId) return {};
  // HotspotSession links to Router via routerId; filter through router's tenantId
  return { router: { tenantId } };
}

/**
 * Retrieves all active customer hotspot sessions (status: ONLINE), with optional router/tenant filter.
 */
export async function getActiveSessions(filters: SessionsQueryFilters) {
  const page = Number(filters.page) || 1;
  const limit = Number(filters.limit) || 50;
  const skip = (page - 1) * limit;

  const whereClause: any = { status: 'ONLINE', ...tenantRouterWhere(filters.tenantId) };
  if (filters.routerId && filters.routerId !== 'All') {
    whereClause.routerId = filters.routerId;
  }

  const [sessions, total] = await Promise.all([
    prisma.hotspotSession.findMany({
      where: whereClause,
      include: {
        voucher: {
          include: {
            plan: {
              include: {
                bandwidthProfile: true
              }
            }
          }
        },
        router: {
          select: {
            id: true,
            name: true,
            host: true,
            status: true
          }
        }
      },
      orderBy: { loginTime: 'desc' },
      skip,
      take: limit
    }),
    prisma.hotspotSession.count({
      where: whereClause
    })
  ]);

  return {
    sessions,
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit)
  };
}

/**
 * Administrative disconnect for a user session on target router (tenant-scoped).
 */
export async function disconnectUser(username: string, explicitRouterId?: string, tenantId?: string) {
  const normalizedUsername = username.trim();

  const whereClause: any = {
    username: normalizedUsername,
    status: 'ONLINE',
    ...tenantRouterWhere(tenantId)
  };
  if (explicitRouterId) {
    whereClause.routerId = explicitRouterId;
  }

  const activeSession = await prisma.hotspotSession.findFirst({
    where: whereClause
  });

  if (!activeSession) {
    throw new AppError(`No active online session found for user '${username}'.`, 404);
  }

  const targetRouterId = activeSession.routerId || explicitRouterId || undefined;

  try {
    await disconnectHotspotSession(targetRouterId, normalizedUsername);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Router communication failed';
    throw new AppError(`Unable to disconnect user on router: ${message}`, 503);
  }

  const logoutTime = new Date();
  let sessionDuration = 0;

  if (activeSession.loginTime) {
    sessionDuration = Math.round((logoutTime.getTime() - activeSession.loginTime.getTime()) / 1000);
  }

  const updatedSession = await prisma.hotspotSession.update({
    where: { id: activeSession.id },
    data: {
      status: 'DISCONNECTED',
      logoutTime,
      sessionDuration
    }
  });

  return updatedSession;
}

/**
 * Purges offline, expired, or disconnected sessions older than specified days.
 * If olderThanDays is omitted or <= 0, purges all non-ONLINE sessions.
 */
export async function purgeOldSessions(olderThanDays?: number, tenantId?: string) {
  const whereClause: any = {
    status: {
      in: ['OFFLINE', 'EXPIRED', 'DISCONNECTED']
    },
    ...tenantRouterWhere(tenantId)
  };

  if (olderThanDays && olderThanDays > 0) {
    const cutoffDate = new Date(Date.now() - olderThanDays * 24 * 60 * 60 * 1000);
    whereClause.createdAt = { lt: cutoffDate };
  }

  const result = await prisma.hotspotSession.deleteMany({
    where: whereClause
  });

  return {
    count: result.count
  };
}
