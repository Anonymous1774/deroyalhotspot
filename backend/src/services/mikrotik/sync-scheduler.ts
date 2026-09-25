import prisma from '../../lib/prisma';
import { getSingleRouterHealth, removeHotspotUser, disconnectHotspotSession } from './mikrotik-client';

let syncInterval: NodeJS.Timeout | null = null;

/**
 * Starts the background sync scheduler running every 60 seconds.
 */
export async function startSyncScheduler() {
  if (syncInterval) return;

  console.log('[Scheduler] Initializing background Multi-RouterOS & Session synchronization...');

  await performSynchronization().catch((err) => {
    console.error('[Scheduler] Initial synchronization failed:', err);
  });

  syncInterval = setInterval(async () => {
    try {
      await performSynchronization();
    } catch (err) {
      console.error('[Scheduler] Synchronization cycle failed:', err);
    }
  }, 60 * 1000);
}

/**
 * Stops the background sync scheduler cleanly.
 */
export function stopSyncScheduler() {
  if (syncInterval) {
    clearInterval(syncInterval);
    syncInterval = null;
    console.log('[Scheduler] Background synchronization stopped.');
  }
}

/**
 * Synchronization cycle:
 * 1. Scans active vouchers past their expiration time, sets their status to EXPIRED.
 * 2. Terminates user accounts and active sessions on target routers.
 * 3. Polls telemetry across all active routers independently.
 */
async function performSynchronization() {
  const now = new Date();

  // 1. Expire Active Vouchers past expiration date
  const expiredVouchers = await prisma.voucher.findMany({
    where: {
      status: 'ACTIVE',
      expiresAt: {
        lt: now
      }
    }
  });

  if (expiredVouchers.length > 0) {
    console.log(`[Scheduler] Found ${expiredVouchers.length} expired vouchers. Processing expiration...`);

    for (const voucher of expiredVouchers) {
      const disconnectTime = voucher.expiresAt || now;
      const targetRouterId = voucher.routerId || undefined;

      // 1. Terminate user account on target router
      await removeHotspotUser(targetRouterId, voucher.code).catch((err) => {
        console.warn(`[Scheduler Warning] Failed to delete hotspot user '${voucher.code}' from router '${targetRouterId}':`, err);
      });

      // 2. Disconnect active session on target router
      await disconnectHotspotSession(targetRouterId, voucher.code).catch((err) => {
        console.warn(`[Scheduler Warning] Failed to disconnect active session for '${voucher.code}' from router '${targetRouterId}':`, err);
      });

      // 3. Update voucher status
      await prisma.voucher.update({
        where: { id: voucher.id },
        data: { status: 'EXPIRED' }
      });

      // 4. Update online sessions
      await prisma.hotspotSession.updateMany({
        where: {
          voucherId: voucher.id,
          status: 'ONLINE'
        },
        data: {
          status: 'DISCONNECTED',
          logoutTime: disconnectTime
        }
      });

      // 5. Audit log
      await prisma.activityLog.create({
        data: {
          adminId: null,
          action: 'Voucher Expired',
          module: 'VOUCHER',
          description: `Voucher code '${voucher.code}' expired automatically after plan limit.`,
          ipAddress: null
        }
      });
    }
  }

  // 2. Poll health across all registered routers independently
  const routers = await prisma.router.findMany({
    where: { deletedAt: null, enabled: true },
    select: { id: true, name: true }
  });

  for (const router of routers) {
    await getSingleRouterHealth(router.id).catch((err) => {
      console.warn(`[Scheduler Warning] Health check failed for router '${router.name}':`, err);
    });
  }
}
