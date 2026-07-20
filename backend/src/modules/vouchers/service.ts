import prisma from '../../lib/prisma';
import { GenerateVouchersInput, UpdateStatusInput } from './validator';
import { AppError } from '../bandwidth-profiles/service';
import crypto from 'crypto';
import {
  createHotspotUser,
  ensureRouterReachable,
  formatLimitUptime,
  removeHotspotUser,
  loginActiveHotspotUser
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
 * Bulk generates unique vouchers for a given internet plan.
 */
export async function generateVouchers(data: GenerateVouchersInput) {
  // 1. Verify plan exists
  const plan = await prisma.plan.findUnique({
    where: { id: data.planId }
  });

  if (!plan) {
    throw new AppError('Internet plan not found. Vouchers cannot be generated.', 422);
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
    
    // Check if code is already in database or current set
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
      plan: true
    }
  });
}

interface VoucherQueryFilters {
  status?: string;
  planId?: string;
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

  return prisma.voucher.update({
    where: { id },
    data: { status: 'DISABLED' }
  });
}

/**
 * Deletes an unused voucher.
 */
export async function deleteVoucher(id: string) {
  const voucher = await prisma.voucher.findUnique({
    where: { id }
  });

  if (!voucher) {
    throw new AppError('Voucher not found.', 404);
  }

  if (voucher.status !== 'UNUSED') {
    throw new AppError('Only unused vouchers can be deleted to maintain referential integrity.', 400);
  }
  return prisma.voucher.delete({
    where: { id }
  });
}

/**
 * Activates an unused voucher code, calculates expiration, and logs a hotspot session.
 */
export async function activateVoucherCode(code: string, ip?: string, mac?: string) {
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
      }
    }
  });

  if (!voucher) {
    throw new AppError('Voucher code not found. Please verify the code and try again.', 404);
  }

  // 2. Validate voucher status or handle re-login if already active and not expired
  const now = new Date();
  if (voucher.status === 'ACTIVE') {
    if (voucher.expiresAt && voucher.expiresAt > now) {
      console.log(`[Voucher Service] Re-authenticating active voucher ${code} for client IP ${ip}...`);
      if (ip && ip !== '0.0.0.0' && !ip.startsWith('10.10.10.')) {
        await loginActiveHotspotUser(voucher.code, ip).catch((err) => {
          console.warn(`[Voucher Service Warning] Re-login failed:`, err);
        });
      }

      // Update the active IP and MAC to match the new connection coordinates
      const updatedVoucher = await prisma.voucher.update({
        where: { id: voucher.id },
        data: {
          activatedIp: ip || voucher.activatedIp,
          activatedMac: mac || voucher.activatedMac
        },
        include: {
          plan: {
            include: {
              bandwidthProfile: true
            }
          }
        }
      });

      const remainingMs = updatedVoucher.expiresAt ? Math.max(0, updatedVoucher.expiresAt.getTime() - Date.now()) : 0;
      return {
        voucher: updatedVoucher,
        remainingTime: Math.round(remainingMs / 1000)
      };
    } else {
      // Mark as expired
      await prisma.voucher.update({
        where: { id: voucher.id },
        data: { status: 'EXPIRED' }
      });
      throw new AppError('This voucher has already expired.', 400);
    }
  }

  if (voucher.status !== 'UNUSED') {
    throw new AppError(`This voucher code is already ${voucher.status.toLowerCase()}.`, 400);
  }

  // 3. Validate linked plan status
  if (voucher.plan.status !== 'ACTIVE') {
    throw new AppError('This voucher plan is currently inactive.', 400);
  }

  // 4. Calculate duration limit in milliseconds
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
    // default fallback to minutes
    durationMs = durationValue * 60 * 1000;
  }

  const loginTime = new Date();
  const expiresAt = new Date(loginTime.getTime() + durationMs);
  const username = voucher.code;
  const limitUptime = formatLimitUptime(durationValue, unit);
  const profile = voucher.plan.bandwidthProfile.mikrotikQueueName;

  // Format the rate limit string for MikroTik profile auto-creation (format: "upload/download")
  const cleanSpeed = (val: string) => {
    const match = val.trim().toUpperCase().match(/^(\d+)([MKG])?/);
    if (!match) return '1M';
    return `${match[1]}${match[2] || 'M'}`;
  };
  const rateLimit = `${cleanSpeed(voucher.plan.bandwidthProfile.uploadSpeed)}/${cleanSpeed(voucher.plan.bandwidthProfile.downloadSpeed)}`;

  // 5. Verify router is reachable before consuming the voucher
  try {
    await ensureRouterReachable();
  } catch {
    throw new AppError(
      'Hotspot service is temporarily unavailable. Please try again in a moment.',
      503
    );
  }

  // 6. Create hotspot user on MikroTik (username = password = voucher code)
  try {
    await createHotspotUser({
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

  // 7. Persist activation — rollback MikroTik user if DB write fails
  try {
    const updatedVoucher = await prisma.voucher.update({
      where: { id: voucher.id },
      data: {
        status: 'ACTIVE',
        activatedAt: loginTime,
        expiresAt,
        activatedIp: ip || null,
        activatedMac: mac || null,
        mikrotikUsername: username
      },
      include: {
        plan: {
          include: {
            bandwidthProfile: true
          }
        }
      }
    });

    await prisma.hotspotSession.create({
      data: {
        voucherId: voucher.id,
        username,
        ipAddress: ip || '0.0.0.0',
        macAddress: mac || '00:00:00:00:00:00',
        loginTime,
        status: 'ONLINE'
      }
    });

    return {
      voucher: updatedVoucher,
      remainingTime: Math.round(durationMs / 1000)
    };
  } catch (error) {
    await removeHotspotUser(username).catch((rollbackError) => {
      console.error(`Failed to rollback MikroTik user '${username}':`, rollbackError);
    });
    throw error;
  }
}
