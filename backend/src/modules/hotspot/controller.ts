import { Request, Response, NextFunction } from 'express';
import * as service from './service';
import { disconnectUserSchema } from './validator';
import prisma from '../../lib/prisma';

/**
 * Controller to list all active hotspot sessions.
 */
export async function listSessions(req: Request, res: Response, next: NextFunction) {
  try {
    const { page, limit } = req.query;
    const result = await service.getActiveSessions({
      page: page ? Number(page) : undefined,
      limit: limit ? Number(limit) : undefined
    });

    return res.status(200).json({
      success: true,
      message: 'Active hotspot sessions retrieved successfully.',
      data: result
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Controller to administratively disconnect a user session.
 */
export async function disconnect(req: Request, res: Response, next: NextFunction) {
  try {
    // 1. Validate payload
    const validation = disconnectUserSchema.safeParse(req.body);
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
    const session = await service.disconnectUser(validation.data.username);

    // 3. Log activity
    await prisma.activityLog.create({
      data: {
        adminId: req.admin?.id || null,
        action: 'Hotspot User Disconnected',
        module: 'ROUTER',
        description: `Hotspot user '${validation.data.username}' was administratively disconnected.`,
        ipAddress: req.ip || null
      }
    });

    // 4. Return response
    return res.status(200).json({
      success: true,
      message: `Hotspot user '${validation.data.username}' disconnected successfully.`,
      data: session
    });

  } catch (error) {
    next(error);
  }
}
