import { Request, Response, NextFunction } from 'express';
import * as service from './service';
import { generateVouchersSchema, activateVoucherSchema } from './validator';
import prisma from '../../lib/prisma';

/**
 * Controller to bulk generate new vouchers.
 */
export async function generate(req: Request, res: Response, next: NextFunction) {
  try {
    // 1. Validate payload
    const validation = generateVouchersSchema.safeParse(req.body);
    if (!validation.success) {
      return res.status(422).json({
        success: false,
        message: 'Validation failed',
        error: {
          code: 'VALIDATION_ERROR',
          details: validation.error.format()
        }
      });
    }

    // 2. Call service
    const vouchers = await service.generateVouchers(validation.data);
    const planName = vouchers[0]?.plan?.name || 'Unknown Plan';

    // 3. Log activity
    await prisma.activityLog.create({
      data: {
        adminId: req.admin?.id || null,
        action: 'Vouchers Generated',
        module: 'VOUCHER',
        description: `Generated ${validation.data.count} vouchers for plan '${planName}'.`,
        ipAddress: req.ip || null
      }
    });

    // 4. Return response
    return res.status(201).json({
      success: true,
      message: `${vouchers.length} vouchers generated successfully.`,
      data: vouchers
    });

  } catch (error) {
    next(error);
  }
}

/**
 * Controller to list all vouchers (filtered and paginated).
 */
export async function list(req: Request, res: Response, next: NextFunction) {
  try {
    const { status, planId, search, page, limit } = req.query;
    const result = await service.getVouchersList({
      status: status ? String(status) : undefined,
      planId: planId ? String(planId) : undefined,
      search: search ? String(search) : undefined,
      page: page ? Number(page) : undefined,
      limit: limit ? Number(limit) : undefined
    });

    return res.status(200).json({
      success: true,
      message: 'Vouchers retrieved successfully.',
      data: result
    });

  } catch (error) {
    next(error);
  }
}

/**
 * Controller to disable an active or unused voucher.
 */
export async function disable(req: Request, res: Response, next: NextFunction) {
  try {
    const voucher = await service.disableVoucher(req.params.id);

    await prisma.activityLog.create({
      data: {
        adminId: req.admin?.id || null,
        action: 'Voucher Disabled',
        module: 'VOUCHER',
        description: `Voucher code '${voucher.code}' was disabled.`,
        ipAddress: req.ip || null
      }
    });

    return res.status(200).json({
      success: true,
      message: 'Voucher disabled successfully.',
      data: voucher
    });

  } catch (error) {
    next(error);
  }
}

/**
 * Controller to delete an unused voucher.
 */
export async function remove(req: Request, res: Response, next: NextFunction) {
  try {
    const voucher = await service.deleteVoucher(req.params.id);

    await prisma.activityLog.create({
      data: {
        adminId: req.admin?.id || null,
        action: 'Voucher Deleted',
        module: 'VOUCHER',
        description: `Unused voucher '${voucher.code}' (ID: ${voucher.id}) was deleted.`,
        ipAddress: req.ip || null
      }
    });

    return res.status(200).json({
      success: true,
      message: 'Voucher deleted successfully.',
      data: {
        id: voucher.id,
        code: voucher.code
      }
    });

  } catch (error) {
    next(error);
  }
}

/**
 * Public controller to activate a customer voucher.
 */
export async function activate(req: Request, res: Response, next: NextFunction) {
  try {
    // 1. Validate payload
    const validation = activateVoucherSchema.safeParse(req.body);
    if (!validation.success) {
      return res.status(422).json({
        success: false,
        message: 'Validation failed',
        error: {
          code: 'VALIDATION_ERROR',
          details: validation.error.format()
        }
      });
    }

    const { voucher } = validation.data;
    const ip = req.ip || String(req.headers['x-forwarded-for'] || '0.0.0.0');
    const mac = req.body.macAddress || req.body.mac || null;

    // 2. Call service
    const result = await service.activateVoucherCode(voucher, ip, mac);

    // 3. Log activity (public event: no admin ID)
    await prisma.activityLog.create({
      data: {
        adminId: null,
        action: 'Hotspot User Activated',
        module: 'ROUTER',
        description: `Hotspot customer activated voucher code '${result.voucher.code}' for plan '${result.voucher.plan.name}'.`,
        ipAddress: ip || null
      }
    });

    // 4. Return success details
    return res.status(200).json({
      success: true,
      message: 'Voucher activated successfully. Internet access granted.',
      data: {
        code: result.voucher.code,
        expiresAt: result.voucher.expiresAt,
        remainingTime: result.remainingTime,
        plan: {
          name: result.voucher.plan.name,
          price: result.voucher.plan.price,
          duration: result.voucher.plan.duration,
          durationUnit: result.voucher.plan.durationUnit,
          bandwidthProfile: result.voucher.plan.bandwidthProfile.name
        }
      }
    });

  } catch (error) {
    next(error);
  }
}
