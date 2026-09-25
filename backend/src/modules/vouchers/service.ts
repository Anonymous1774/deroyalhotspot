import prisma from '../../lib/prisma';
import { GenerateVouchersInput, UpdateStatusInput } from './validator';
import { AppError } from '../bandwidth-profiles/service';
import crypto from 'crypto';
import {
  createHotspotUser,
  ensureRouterReachable,
  formatLimitUptime,
  removeHotspotUser,
  loginActiveHotspotUser,
  getLeaseDeviceName,
  disconnectHotspotSession,
  getRouterConfig
} from '../../services/mikrotik/mikrotik-client';

/**
 * Generates a random uppercase alphanumeric string of specified length.
 * Excludes confusing characters: O, 0, I, 1 for better user entry experience.
 */
function generateRandomCode(length: number): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let result = '';
  const randomBytes = crypto.randomBytes(length);
  for (let i = 0; i < length; i++) {
    result += chars[randomBytes[i] % chars.length];
  }
  return result;
}

/**
 * Bulk generates unique vouchers for a given internet plan and optional router.
 */
export async function generateVouchers(data: GenerateVouchersInput) {
  // 1. Verify plan exists
  const plan = await prisma.plan.findUnique({
    where: { id: data.planId }
  });

  if (!plan) {
    throw new AppError('Internet plan not found. Vouchers cannot be generated.', 422);
  }

  // Verify router if provided
  if (data.routerId) {
    const routerExists = await prisma.router.findFirst({
      where: { id: data.routerId, deletedAt: null }
    });
    if (!routerExists) {
      throw new AppError('Specified router does not exist or has been deleted.', 422);
    }
  }

  // 2. Fetch voucher length from settings
  const setting = await prisma.systemSetting.findUnique({
    where: { key: 'voucher_length' }
  });
  const voucherLength = setting ? parseInt(setting.value, 10) : 8;

  // 3. Generate unique codes in loop
  const codes = new Set<string>();
  const maxAttempts = data.count * 10;
  let attempts = 0;

  while (codes.size < data.count && attempts < maxAttempts) {
    attempts++;
    const code = generateRandomCode(voucherLength);
    
    const exists = await prisma.voucher.findUnique({
      where: { code }
    });

    if (!exists) {
      codes.add(code);
    }
  }

  if (codes.size < data.count) {
    throw new AppError('Failed to generate enough unique codes. Please try again.', 500);
  }

  const voucherData = Array.from(codes).map((code) => ({
    code,
    planId: data.planId,
    routerId: data.routerId || null,
    status: 'UNUSED' as const
  }));

  // 4. Batch create
  await prisma.voucher.createMany({
    data: voucherData
  });

  // Return generated details
  return prisma.voucher.findMany({
    where: {
      code: { in: Array.from(codes) }
    },
    include: {
      plan: true,
      router: {
        select: {
          id: true,
          name: true,
          host: true
        }
      }
    }
  });
}

interface VoucherQueryFilters {
  status?: string;
  planId?: string;
  routerId?: string;
  search?: string;
  page?: number;
  limit?: number;
}

/**
 * Retrieves a filtered, paginated list of vouchers.
 */
export async function getVouchersList(filters: VoucherQueryFilters) {
  const page = Number(filters.page) || 1;
  const limit = Number(filters.limit) || 50;
  const skip = (page - 1) * limit;

  const whereClause: any = {};

  if (filters.status && filters.status !== 'All') {
    whereClause.status = filters.status;
  }

  if (filters.planId && filters.planId !== 'All') {
    whereClause.planId = filters.planId;
  }

  if (filters.routerId && filters.routerId !== 'All') {
    whereClause.routerId = filters.routerId;
  }

  if (filters.search) {
    whereClause.code = {
      contains: filters.search.trim().toUpperCase(),
      mode: 'insensitive'
    };
  }

  // Fetch count & records in parallel
  const [vouchers, total] = await Promise.all([
    prisma.voucher.findMany({
      where: whereClause,
      include: {
        plan: {
          include: {
            bandwidthProfile: true
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
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit
    }),
    prisma.voucher.count({
      where: whereClause
    })
  ]);

  return {
    vouchers,
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit)
  };
}

/**
 * Updates a voucher's status to DISABLED.
 */
export async function disableVoucher(id: string) {
  const voucher = await prisma.voucher.findUnique({
    where: { id }
  });

  if (!voucher) {
    throw new AppError('Voucher not found.', 404);
  }

  if (voucher.status === 'EXPIRED' || voucher.status === 'DISABLED') {
    throw new AppError(`Cannot disable a voucher that is already ${voucher.status.toLowerCase()}.`, 400);
  }

  // If the voucher is active, disable on router and disconnect active session
  if (voucher.status === 'ACTIVE') {
    const targetRouterId = voucher.routerId || undefined;
    await removeHotspotUser(targetRouterId, voucher.code).catch((err) => {
      console.warn(`[Voucher Service Warning] Failed to delete disabled hotspot user '${voucher.code}' from router:`, err);
    });
    await disconnectHotspotSession(targetRouterId, voucher.code).catch((err) => {
      console.warn(`[Voucher Service Warning] Failed to disconnect disabled active session for '${voucher.code}' on router:`, err);
    });
  }

  return prisma.voucher.update({
    where: { id },
    data: { status: 'DISABLED' }
  });
}

/**
 * Deletes a voucher (active, unused, or expired).
 * Clears related hotspot sessions and router accounts if active.
 */
export async function deleteVoucher(id: string) {
  const voucher = await prisma.voucher.findUnique({
    where: { id }
  });

  if (!voucher) {
    throw new AppError('Voucher not found.', 404);
  }

  // Remove corresponding hotspot user and session from MikroTik router if it was active
  if (voucher.status === 'ACTIVE') {
    const targetRouterId = voucher.routerId || undefined;
    await removeHotspotUser(targetRouterId, voucher.code).catch((err) => {
      console.warn(`[Voucher Service Warning] Failed to delete hotspot user '${voucher.code}' from router on delete:`, err);
    });
    await disconnectHotspotSession(targetRouterId, voucher.code).catch((err) => {
      console.warn(`[Voucher Service Warning] Failed to disconnect active session for '${voucher.code}' on router on delete:`, err);
    });
  }

  // Delete related hotspot sessions to preserve referential integrity
  await prisma.hotspotSession.deleteMany({
    where: { voucherId: id }
  });

  return prisma.voucher.delete({
    where: { id }
  });
}

/**
 * Deletes all vouchers in the database.
 * Clears all hotspot sessions and router accounts.
 */
export async function deleteAllVouchers() {
  // 1. Fetch active vouchers to clean up RouterOS users
  const activeVouchers = await prisma.voucher.findMany({
    where: { status: 'ACTIVE' },
    select: { code: true, routerId: true }
  });

  for (const v of activeVouchers) {
    const targetRouterId = v.routerId || undefined;
    await removeHotspotUser(targetRouterId, v.code).catch((err) => {
      console.warn(`[Voucher Service Warning] Failed to delete hotspot user '${v.code}' from router on bulk delete:`, err);
    });
    await disconnectHotspotSession(targetRouterId, v.code).catch((err) => {
      console.warn(`[Voucher Service Warning] Failed to disconnect active session for '${v.code}' from router on bulk delete:`, err);
    });
  }

  // 2. Delete all hotspot sessions
  await prisma.hotspotSession.deleteMany({});

  // 3. Delete all vouchers
  return prisma.voucher.deleteMany({});
}

/**
 * Activates an unused voucher code, calculates expiration, and logs a hotspot session on target router.
 */
export async function activateVoucherCode(
  code: string,
  ip?: string,
  mac?: string,
  userAgent?: string,
  explicitRouterId?: string
) {
  // 1. Fetch voucher (case-insensitive)
  const voucher = await prisma.voucher.findFirst({
    where: {
      code: {
        equals: code.trim().toUpperCase(),
      }
    },
    include: {
      plan: {
        include: {
          bandwidthProfile: true
        }
      },
      router: true
    }
  });

  if (!voucher) {
    throw new AppError('Invalid voucher code. Please check the code and try again.', 404);
  }

  // Resolve target router config
  const routerConfig = await getRouterConfig(voucher.routerId || explicitRouterId);
  const targetRouterId = routerConfig.id;

  // 2. Validate voucher status or handle re-login if already active and not expired
  const now = new Date();
  if (voucher.status === 'ACTIVE') {
    if (voucher.expiresAt && voucher.expiresAt > now) {
      console.log(`[Voucher Service] Re-authenticating active voucher ${code} for client IP ${ip} on router ${targetRouterId}...`);
      if (ip && ip !== '0.0.0.0' && !ip.startsWith('10.10.10.')) {
        await loginActiveHotspotUser(targetRouterId, voucher.code, ip).catch((err) => {
          console.warn(`[Voucher Service Warning] Re-login failed:`, err);
        });
      }

      const updatedVoucher = await prisma.voucher.update({
        where: { id: voucher.id },
        data: {
          activatedIp: ip || voucher.activatedIp,
          activatedMac: mac || voucher.activatedMac,
          routerId: targetRouterId
        },
        include: {
          plan: {
            include: {
              bandwidthProfile: true
            }
          },
          router: true
        }
      });

      const remainingMs = updatedVoucher.expiresAt ? Math.max(0, updatedVoucher.expiresAt.getTime() - Date.now()) : 0;
      return {
        voucher: updatedVoucher,
        remainingTime: Math.round(remainingMs / 1000)
      };
    } else {
      await prisma.voucher.update({
        where: { id: voucher.id },
        data: { status: 'EXPIRED' }
      });
      throw new AppError('This voucher code has already been used.', 400);
    }
  }

  if (voucher.status === 'EXPIRED') {
    throw new AppError('This voucher code has already been used.', 400);
  }

  if (voucher.status === 'DISABLED') {
    throw new AppError('This voucher code is disabled.', 400);
  }

  if (voucher.status !== 'UNUSED') {
    throw new AppError('This voucher code has already been used.', 400);
  }

  // 3. Validate linked plan status
  if (voucher.plan.status !== 'ACTIVE') {
    throw new AppError('This voucher plan is currently inactive.', 400);
  }

  // 4. Calculate duration limit
  let durationMs = 0;
  const durationValue = voucher.plan.duration;
  const unit = voucher.plan.durationUnit.toLowerCase();

  if (unit === 'minutes') {
    durationMs = durationValue * 60 * 1000;
  } else if (unit === 'hours') {
    durationMs = durationValue * 60 * 60 * 1000;
  } else if (unit === 'days') {
    durationMs = durationValue * 24 * 60 * 60 * 1000;
  } else {
    durationMs = durationValue * 60 * 1000;
  }

  const loginTime = new Date();
  const expiresAt = new Date(loginTime.getTime() + durationMs);
  const username = voucher.code;
  const limitUptime = formatLimitUptime(durationValue, unit);
  const profile = voucher.plan.bandwidthProfile.mikrotikQueueName;

  const cleanSpeed = (val: string) => {
    const match = val.trim().toUpperCase().match(/^(\d+)([MKG])?/);
    if (!match) return '1M';
    return `${match[1]}${match[2] || 'M'}`;
  };
  const rateLimit = `${cleanSpeed(voucher.plan.bandwidthProfile.uploadSpeed)}/${cleanSpeed(voucher.plan.bandwidthProfile.downloadSpeed)}`;

  // 5. Verify target router is reachable
  try {
    await ensureRouterReachable(targetRouterId);
  } catch {
    throw new AppError(
      'Hotspot service for this router is temporarily unavailable. Please try again in a moment.',
      503
    );
  }

  // 6. Create hotspot user on MikroTik
  try {
    await createHotspotUser(targetRouterId, {
      username,
      password: username,
      profile,
      limitUptime,
      comment: `DHOS plan: ${voucher.plan.name}`,
      ip,
      rateLimit
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Router communication failed';
    throw new AppError(
      `Unable to activate internet access: ${message}`,
      503
    );
  }

  // 7. Persist activation
  try {
    const updatedVoucher = await prisma.voucher.update({
      where: { id: voucher.id },
      data: {
        status: 'ACTIVE',
        activatedAt: loginTime,
        expiresAt,
        activatedIp: ip || null,
        activatedMac: mac || null,
        mikrotikUsername: username,
        routerId: targetRouterId
      },
      include: {
        plan: {
          include: {
            bandwidthProfile: true
          }
        },
        router: true
      }
    });

    await prisma.hotspotSession.create({
      data: {
        voucherId: voucher.id,
        routerId: targetRouterId,
        username,
        ipAddress: ip || '0.0.0.0',
        macAddress: mac || '00:00:00:00:00:00',
        loginTime,
        status: 'ONLINE'
      }
    });

    if (mac && mac !== '00:00:00:00:00:00') {
      const deviceName = await getLeaseDeviceName(targetRouterId, mac).catch(() => 'Unknown Device');
      await prisma.registeredDevice.upsert({
        where: { macAddress: mac.trim().toUpperCase() },
        update: {
          voucherId: voucher.id,
          lastIpAddress: ip || null,
          deviceName,
          userAgent: userAgent || null,
          lastSeen: new Date()
        },
        create: {
          voucherId: voucher.id,
          macAddress: mac.trim().toUpperCase(),
          deviceName,
          userAgent: userAgent || null,
          lastIpAddress: ip || null,
          firstSeen: new Date(),
          lastSeen: new Date(),
          isBlocked: false
        }
      });
    }

    return {
      voucher: updatedVoucher,
      remainingTime: Math.round(durationMs / 1000)
    };
  } catch (error) {
    await removeHotspotUser(targetRouterId, username).catch((rollbackError) => {
      console.error(`Failed to rollback MikroTik user '${username}' on router '${targetRouterId}':`, rollbackError);
    });
    throw error;
  }
}
