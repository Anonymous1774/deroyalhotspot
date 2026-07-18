import prisma from '../../lib/prisma';

/**
 * Gathers system statistics aggregates and recent activities.
 */
export async function getDashboardStats() {
  const [
    plansCount,
    activeVouchersCount,
    unusedVouchersCount,
    onlineUsersCount,
    recentActivity
  ] = await Promise.all([
    prisma.plan.count(),
    prisma.voucher.count({ where: { status: 'ACTIVE' } }),
    prisma.voucher.count({ where: { status: 'UNUSED' } }),
    prisma.hotspotSession.count({ where: { status: 'ONLINE' } }),
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
    })
  ]);

  return {
    plansCount,
    activeVouchersCount,
    unusedVouchersCount,
    onlineUsersCount,
    recentActivity
  };
}
