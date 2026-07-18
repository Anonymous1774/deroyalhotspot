import prisma from '../../lib/prisma';
import { AppError } from '../bandwidth-profiles/service';
import { disconnectHotspotSession } from '../../services/mikrotik/mikrotik-client';

interface SessionsQueryFilters {
  page?: number;
  limit?: number;
}

/**
 * Retrieves all active customer hotspot sessions (status: ONLINE).
 */
export async function getActiveSessions(filters: SessionsQueryFilters) {
  const page = Number(filters.page) || 1;
  const limit = Number(filters.limit) || 50;
  const skip = (page - 1) * limit;

  const [sessions, total] = await Promise.all([
    prisma.hotspotSession.findMany({
      where: { status: 'ONLINE' },
      include: {
        voucher: {
          include: {
            plan: {
              include: {
                bandwidthProfile: true
              }
            }
          }
        }
      },
      orderBy: { loginTime: 'desc' },
      skip,
      take: limit
    }),
    prisma.hotspotSession.count({
      where: { status: 'ONLINE' }
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
 * Administrative disconnect for a user session.
 * Updates session in database to DISCONNECTED, logs out, and tracks duration.
 */
export async function disconnectUser(username: string) {
  // Find first active session
  const activeSession = await prisma.hotspotSession.findFirst({
    where: {
      username: username.trim(),
      status: 'ONLINE'
    }
  });

  if (!activeSession) {
    throw new AppError(`No active online session found for user '${username}'.`, 404);
  }

  const normalizedUsername = username.trim();

  // Terminate session on MikroTik first
  try {
    await disconnectHotspotSession(normalizedUsername);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Router communication failed';
    throw new AppError(`Unable to disconnect user on router: ${message}`, 503);
  }

  const logoutTime = new Date();
  let sessionDuration = 0;

  if (activeSession.loginTime) {
    sessionDuration = Math.round((logoutTime.getTime() - activeSession.loginTime.getTime()) / 1000);
  }

  // Update session state in DB
  const updatedSession = await prisma.hotspotSession.update({
    where: { id: activeSession.id },
    data: {
      status: 'DISCONNECTED',
      logoutTime,
      sessionDuration
    }
  });

  // Note: We can also update the voucher status to EXPIRED if duration or plan limits are exceeded,
  // but for now, we just close the active online session.

  return updatedSession;
}
