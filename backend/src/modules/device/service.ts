import prisma from '../../lib/prisma';
import { AppError } from '../bandwidth-profiles/service';
import { loginActiveHotspotUser, ensureRouterReachable } from '../../services/mikrotik/mikrotik-client';

/**
 * Checks if a device is registered and its linked voucher is valid.
 */
export async function checkDeviceRegistration(mac: string) {
  const targetMac = mac.trim().toUpperCase();

  // 1. Query device including voucher and plan
  const device = await prisma.registeredDevice.findUnique({
    where: { macAddress: targetMac },
    include: {
      voucher: {
        include: {
          plan: true
        }
      }
    }
  });

  // If not found
  if (!device) {
    await logDeviceActivity('Unknown Device', `Unregistered device with MAC '${targetMac}' attempted auto-login check.`);
    return { registered: false, voucherActive: false };
  }

  // If blocked
  if (device.isBlocked) {
    await logDeviceActivity('Blocked Device', `Blocked device with MAC '${targetMac}' attempted auto-login check.`);
    return { registered: false, voucherActive: false };
  }

  const voucher = device.voucher;

  // If voucher is disabled or not active
  if (!voucher || voucher.status === 'DISABLED' || voucher.status === 'UNUSED') {
    return { registered: true, voucherActive: false };
  }

  const now = new Date();

  // If voucher has expired
  if (voucher.status === 'ACTIVE' && voucher.expiresAt && voucher.expiresAt <= now) {
    // Transition to expired
    await prisma.voucher.update({
      where: { id: voucher.id },
      data: { status: 'EXPIRED' }
    });

    await logDeviceActivity('Voucher Expired', `Voucher code '${voucher.code}' linked to device '${targetMac}' has expired.`);
    return { registered: true, voucherActive: false };
  }

  if (voucher.status === 'EXPIRED') {
    await logDeviceActivity('Voucher Expired', `Voucher code '${voucher.code}' linked to device '${targetMac}' was already expired.`);
    return { registered: true, voucherActive: false };
  }

  // All checks passed!
  return {
    registered: true,
    voucherActive: true,
    code: voucher.code
  };
}

/**
 * Triggers server-side active login on RouterOS for a registered device.
 */
export async function reauthenticateDevice(mac: string, ip: string) {
  const targetMac = mac.trim().toUpperCase();

  // 1. Fetch device and verify status
  const device = await prisma.registeredDevice.findUnique({
    where: { macAddress: targetMac },
    include: {
      voucher: true
    }
  });

  if (!device || device.isBlocked || !device.voucher || device.voucher.status !== 'ACTIVE') {
    throw new AppError('Device or linked voucher is not authorized for re-authentication.', 400);
  }

  const now = new Date();
  if (device.voucher.expiresAt && device.voucher.expiresAt <= now) {
    await prisma.voucher.update({
      where: { id: device.voucher.id },
      data: { status: 'EXPIRED' }
    });
    throw new AppError('The voucher code linked to this device has expired.', 400);
  }

  // 2. Ensure router is reachable
  try {
    await ensureRouterReachable();
  } catch (err) {
    await logDeviceActivity('Automatic Login Failed', `Auto-login failed for device MAC '${targetMac}' because RouterOS is unreachable.`, ip);
    throw new AppError('Hotspot router is currently offline. Please try again in a moment.', 503);
  }

  // 3. Trigger active login on router
  const username = device.voucher.code;
  try {
    await loginActiveHotspotUser(username, ip);
  } catch (err: any) {
    await logDeviceActivity('Automatic Login Failed', `Auto-login failed for device MAC '${targetMac}' (User: ${username}) on IP '${ip}'. Error: ${err.message || err}`, ip);
    throw new AppError(`Router login failed: ${err.message || err}`, 502);
  }

  // 4. Update device session timestamps
  await prisma.registeredDevice.update({
    where: { id: device.id },
    data: {
      lastIpAddress: ip,
      lastSeen: new Date()
    }
  });

  // 5. Log activity
  await logDeviceActivity('Automatic Login', `Device MAC '${targetMac}' (${device.deviceName || 'Unknown'}) auto-logged in successfully using voucher '${username}'.`, ip);

  return {
    success: true,
    message: 'Device re-authenticated successfully.'
  };
}

/**
 * Helper to write log activities to DB.
 */
async function logDeviceActivity(action: string, description: string, ipAddress?: string) {
  await prisma.activityLog.create({
    data: {
      adminId: null,
      action,
      module: 'ROUTER',
      description,
      ipAddress: ipAddress || null
    }
  }).catch((e) => console.error('[logDeviceActivity Error]:', e));
}
