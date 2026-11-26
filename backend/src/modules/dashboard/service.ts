import prisma from '../../lib/prisma';
import { getSingleRouterHealth, ActiveDeviceItem } from '../../services/mikrotik/mikrotik-client';
import { get24HourTrend } from '../../services/telemetry/history-tracker';

/**
 * Gathers system statistics aggregates, router health summaries, real-time trend data, and recent activities.
 * When tenantId is provided, all queries are scoped to that tenant's resources.
 */
export async function getDashboardStats(routerId?: string, tenantId?: string) {
  const routerFilter = routerId && routerId !== 'All' ? { routerId } : {};
  const tenantFilter = tenantId ? { tenantId } : {};

  // For router-scoped queries, also apply tenant filter on router.tenantId if tenantId provided
  const tenantRouterFilter = tenantId
    ? { router: { tenantId } }
    : {};

  const now = new Date();

  const [
    plansCount,
    activeVouchersCount,
    activeUnexpiredVouchersCount,
    unusedVouchersCount,
    onlineSessionsCount,
    recentActivity,
    allRouters,
    onlineRoutersCount,
    offlineRoutersCount
  ] = await Promise.all([
    prisma.plan.count({ where: tenantFilter }),
    prisma.voucher.count({ where: { status: 'ACTIVE', ...routerFilter, ...tenantFilter } }),
    prisma.voucher.count({
      where: {
        status: 'ACTIVE',
        expiresAt: { gt: now },
        ...routerFilter,
        ...tenantFilter
      }
    }),
    prisma.voucher.count({ where: { status: 'UNUSED', ...routerFilter, ...tenantFilter } }),
    prisma.hotspotSession.count({ where: { status: 'ONLINE', ...routerFilter, ...tenantRouterFilter } }),
    prisma.activityLog.findMany({
      take: 6,
      orderBy: { createdAt: 'desc' },
      include: {
        admin: {
          select: {
            fullName: true,
            email: true
          }
        }
      }
    }),
    prisma.router.findMany({
      where: { deletedAt: null, ...tenantFilter },
      select: {
        id: true,
        name: true,
        host: true,
        apiPort: true,
        status: true,
        enabled: true,
        routerIdentity: true,
        latencyMs: true,
        lastConnected: true,
        _count: {
          select: {
            vouchers: true,
            hotspotSessions: { where: { status: 'ONLINE' } }
          }
        }
      }
    }),
    prisma.router.count({ where: { deletedAt: null, status: 'ONLINE', ...tenantFilter } }),
    prisma.router.count({ where: { deletedAt: null, status: { in: ['OFFLINE', 'DEGRADED', 'UNKNOWN'] }, ...tenantFilter } })
  ]);

  // Query live router telemetry to get real connected active devices and data usage
  let activeDevices: ActiveDeviceItem[] = [];
  let connectedUsersCount = 0;
  let totalBytesIn = 0;
  let totalBytesOut = 0;

  try {
    if (routerId && routerId !== 'All') {
      const health = await getSingleRouterHealth(routerId);
      connectedUsersCount = health.connectedUsers || 0;
      activeDevices = health.activeDevices || [];
      totalBytesIn = health.totalBytesIn || 0;
      totalBytesOut = health.totalBytesOut || 0;
    } else {
      const activeRouters = allRouters.filter((r: any) => r.enabled);
      if (activeRouters.length > 0) {
        for (const r of activeRouters) {
          const health = await getSingleRouterHealth(r.id);
          connectedUsersCount += (health.connectedUsers || 0);
          if (health.activeDevices) {
            activeDevices.push(...health.activeDevices);
          }
          totalBytesIn += (health.totalBytesIn || 0);
          totalBytesOut += (health.totalBytesOut || 0);
        }
      } else if (!tenantId) {
        // Only fallback to default router when not tenant-scoped
        const defaultHealth = await getSingleRouterHealth();
        connectedUsersCount = defaultHealth.connectedUsers || 0;
        activeDevices = defaultHealth.activeDevices || [];
        totalBytesIn = defaultHealth.totalBytesIn || 0;
        totalBytesOut = defaultHealth.totalBytesOut || 0;
      }
    }
  } catch (err) {
    console.warn('[Dashboard Service Warning] Telemetry query failed, falling back to database state:', err);
  }

  const realOnlineUsers = connectedUsersCount > 0
    ? connectedUsersCount
    : Math.max(onlineSessionsCount, activeUnexpiredVouchersCount);

  const sales = await prisma.voucher.findMany({
    where: {
      status: {
        in: ['ACTIVE', 'EXPIRED']
      },
      ...routerFilter,
      ...tenantFilter
    },
    select: {
      plan: {
        select: {
          price: true
        }
      }
    }
  });

  const totalIncome = sales.reduce((sum: number, v: any) => sum + (v.plan?.price || 0), 0);

  const downloadMB = parseFloat((totalBytesOut / (1024 * 1024)).toFixed(2));
  const uploadMB = parseFloat((totalBytesIn / (1024 * 1024)).toFixed(2));
  const totalMB = parseFloat(((totalBytesIn + totalBytesOut) / (1024 * 1024)).toFixed(2));
  const totalGB = parseFloat((totalMB / 1024).toFixed(2));
  const downloadGB = parseFloat((downloadMB / 1024).toFixed(2));
  const uploadGB = parseFloat((uploadMB / 1024).toFixed(2));

  let formattedDataUsage = `${totalMB.toLocaleString()} MB`;
  if (totalGB >= 1.0) {
    formattedDataUsage = `${totalGB.toLocaleString()} GB`;
  }

  const hourlyTrend = await get24HourTrend(
    {
      activeUsers: realOnlineUsers,
      downloadMB,
      uploadMB
    },
    routerFilter
  );

  return {
    plansCount,
    activeVouchersCount,
    unusedVouchersCount,
    onlineUsersCount: realOnlineUsers,
    activeDevicesCount: realOnlineUsers,
    activeDevices,
    dataUsage: {
      totalBytes: totalBytesIn + totalBytesOut,
      totalMB,
      totalGB,
      downloadMB,
      uploadMB,
      downloadGB,
      uploadGB,
      formatted: formattedDataUsage
    },
    recentActivity,
    totalIncome,
    totalRouters: allRouters.length,
    onlineRoutersCount,
    offlineRoutersCount,
    routersSummary: allRouters,
    hourlyTrend
  };
}
