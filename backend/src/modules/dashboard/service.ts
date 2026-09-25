import prisma from '../../lib/prisma';

/**
 * Gathers system statistics aggregates, router health summaries, and recent activities.
 */
export async function getDashboardStats(routerId?: string) {
  const routerFilter = routerId && routerId !== 'All' ? { routerId } : {};

  const [
    plansCount,
    activeVouchersCount,
    unusedVouchersCount,
    onlineUsersCount,
    recentActivity,
    allRouters,
    onlineRoutersCount,
    offlineRoutersCount
  ] = await Promise.all([
    prisma.plan.count(),
    prisma.voucher.count({ where: { status: 'ACTIVE', ...routerFilter } }),
    prisma.voucher.count({ where: { status: 'UNUSED', ...routerFilter } }),
    prisma.hotspotSession.count({ where: { status: 'ONLINE', ...routerFilter } }),
    prisma.activityLog.findMany({
      take: 5,
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
      where: { deletedAt: null },
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
    prisma.router.count({ where: { deletedAt: null, status: 'ONLINE' } }),
    prisma.router.count({ where: { deletedAt: null, status: { in: ['OFFLINE', 'DEGRADED', 'UNKNOWN'] } } })
  ]);

  const sales = await prisma.voucher.findMany({
    where: {
      status: {
        in: ['ACTIVE', 'EXPIRED']
      },
      ...routerFilter
    },
    select: {
      plan: {
        select: {
          price: true
        }
      }
    }
  });

  const totalIncome = sales.reduce((sum, v) => sum + (v.plan?.price || 0), 0);

  return {
    plansCount,
    activeVouchersCount,
    unusedVouchersCount,
    onlineUsersCount,
    recentActivity,
    totalIncome,
    totalRouters: allRouters.length,
    onlineRoutersCount,
    offlineRoutersCount,
    routersSummary: allRouters
  };
}
