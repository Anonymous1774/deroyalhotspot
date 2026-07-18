import { Request, Response, NextFunction } from 'express';
import * as service from './service';

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
