import { Request, Response, NextFunction } from 'express';
import * as service from './service';
import prisma from '../../lib/prisma';

/**
 * Controller to list all activity logs (filtered and paginated).
 */
export async function list(req: Request, res: Response, next: NextFunction) {
  try {
    const { module, search, page, limit } = req.query;
    const result = await service.getLogsList({
      module: module ? String(module) : undefined,
      search: search ? String(search) : undefined,
      page: page ? Number(page) : undefined,
      limit: limit ? Number(limit) : undefined
    });

    return res.status(200).json({
      success: true,
      message: 'Activity logs retrieved successfully.',
      data: result
    });

  } catch (error) {
    next(error);
  }
}

/**
 * Controller to clear activity logs (filtered or bulk clear).
 */
export async function clear(req: Request, res: Response, next: NextFunction) {
  try {
    const olderThanDays = req.body.olderThanDays !== undefined
      ? Number(req.body.olderThanDays)
      : (req.query.olderThanDays !== undefined ? Number(req.query.olderThanDays) : undefined);

    const module = req.body.module
      ? String(req.body.module)
      : (req.query.module ? String(req.query.module) : undefined);

    const result = await service.clearLogs({ olderThanDays, module });

    // Audit log the clearing event
    await prisma.activityLog.create({
      data: {
        adminId: req.admin?.id || null,
        action: 'Logs Cleared',
        module: 'SYSTEM',
        description: `Cleared ${result.count} activity log records${olderThanDays ? ` older than ${olderThanDays} days` : ''}${module ? ` for module '${module}'` : ''}.`,
        ipAddress: req.ip || null
      }
    }).catch((e) => console.error('Failed to log clearLogs audit event:', e));

    return res.status(200).json({
      success: true,
      message: `${result.count} activity log(s) cleared successfully.`,
      data: {
        count: result.count
      }
    });

  } catch (error) {
    next(error);
  }
}
