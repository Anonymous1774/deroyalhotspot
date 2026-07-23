import prisma from '../../lib/prisma';
import { getRouterHealth, removeHotspotUser, disconnectHotspotSession } from './mikrotik-client';

let syncInterval: NodeJS.Timeout | null = null;

/**
 * Starts the background sync scheduler running every 60 seconds.
 */
export async function startSyncScheduler() {
  if (syncInterval) return;

  console.log('[Scheduler] Initializing background RouterOS & Session synchronization...');

  // Perform initial synchronization immediately on boot
  await performSynchronization().catch((err) => {
    console.error('[Scheduler] Initial synchronization failed:', err);
  });

  // Schedule periodic synchronization every 60 seconds
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
 * 2. Scans corresponding online hotspot sessions, sets their status to DISCONNECTED.
 * 3. Logs automatic voucher expiration events in the audit log.
 * 4. Polling router health telemetry to keep connection statuses up-to-date.
 */
async function performSynchronization() {
  const now = new Date();

  // 1. Expire Active Vouchers that are past their expiresAt timestamp
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

      // 1. Terminate user account on the router so they can't reconnect
      await removeHotspotUser(voucher.code).catch((err) => {
        console.warn(`[Scheduler Warning] Failed to delete hotspot user '${voucher.code}' from router on expiration:`, err);
      });

      // 2. Disconnect active session immediately to cut off internet
      await disconnectHotspotSession(voucher.code).catch((err) => {
        console.warn(`[Scheduler Warning] Failed to disconnect active session for '${voucher.code}' from router on expiration:`, err);
      });

      // 3. Update voucher status to EXPIRED in database
      await prisma.voucher.update({
        where: { id: voucher.id },
        data: { status: 'EXPIRED' }
      });

      // 4. Update corresponding online sessions to DISCONNECTED in database
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

      // 5. Log system audit log for automatic expiration
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

  // 2. Poll Router Health telemetry (automatically updates router status between ONLINE/OFFLINE in database)
  await getRouterHealth();
}
