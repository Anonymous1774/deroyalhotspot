import prisma from '../../lib/prisma';
import { getRouterHealth } from './mikrotik-client';

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

      // Update voucher status to EXPIRED
      await prisma.voucher.update({
        where: { id: voucher.id },
        data: { status: 'EXPIRED' }
      });

      // Update corresponding online sessions to DISCONNECTED
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

      // Log system audit log for automatic expiration
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
