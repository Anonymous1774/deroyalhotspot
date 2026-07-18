import { Request, Response, NextFunction } from 'express';
import * as service from './service';

/**
 * Controller to fetch dynamic dashboard stats and logs.
 */
export async function fetchStats(req: Request, res: Response, next: NextFunction) {
  try {
    const stats = await service.getDashboardStats();

    return res.status(200).json({
      success: true,
      message: 'Dashboard statistics retrieved successfully.',
      data: stats
    });
  } catch (error) {
    next(error);
  }
}
