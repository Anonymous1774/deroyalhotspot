import { Request, Response, NextFunction } from 'express';
import * as service from './service';
import { createPlanSchema, updatePlanSchema } from './validator';
import prisma from '../../lib/prisma';

/**
 * Controller to create a new internet plan.
 */
export async function create(req: Request, res: Response, next: NextFunction) {
  try {
    // 1. Validate payload
    const validation = createPlanSchema.safeParse(req.body);
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
    const plan = await service.createPlan(validation.data);

    // 3. Log activity
    await prisma.activityLog.create({
      data: {
        adminId: req.admin?.id || null,
        action: 'Plan Created',
        module: 'SETTINGS',
        description: `Internet plan '${plan.name}' (Price: ₦${plan.price}) was created.`,
        ipAddress: req.ip || null
      }
    });

    // 4. Return response
    return res.status(201).json({
      success: true,
      message: 'Internet plan created successfully.',
      data: plan
    });

  } catch (error) {
    next(error);
  }
}

/**
 * Controller to list all internet plans.
 */
export async function list(req: Request, res: Response, next: NextFunction) {
  try {
    const plans = await service.getAllPlans();
    return res.status(200).json({
      success: true,
      message: 'Internet plans retrieved successfully.',
      data: plans
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Controller to get a single internet plan.
 */
export async function get(req: Request, res: Response, next: NextFunction) {
  try {
    const plan = await service.getPlanById(req.params.id);
    return res.status(200).json({
      success: true,
      message: 'Internet plan retrieved successfully.',
      data: plan
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Controller to update an internet plan.
 */
export async function update(req: Request, res: Response, next: NextFunction) {
  try {
    // 1. Validate payload
    const validation = updatePlanSchema.safeParse(req.body);
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
    const plan = await service.updatePlan(req.params.id, validation.data);

    // 3. Log activity
    await prisma.activityLog.create({
      data: {
        adminId: req.admin?.id || null,
        action: 'Plan Updated',
        module: 'SETTINGS',
        description: `Internet plan '${plan.name}' was updated.`,
        ipAddress: req.ip || null
      }
    });

    // 4. Return response
    return res.status(200).json({
      success: true,
      message: 'Internet plan updated successfully.',
      data: plan
    });

  } catch (error) {
    next(error);
  }
}

/**
 * Controller to delete an internet plan.
 */
export async function remove(req: Request, res: Response, next: NextFunction) {
  try {
    // 1. Call service
    const plan = await service.deletePlan(req.params.id);

    // 2. Log activity
    await prisma.activityLog.create({
      data: {
        adminId: req.admin?.id || null,
        action: 'Plan Deleted',
        module: 'SETTINGS',
        description: `Internet plan '${plan.name}' (ID: ${plan.id}) was deleted.`,
        ipAddress: req.ip || null
      }
    });

    // 3. Return response
    return res.status(200).json({
      success: true,
      message: 'Internet plan deleted successfully.',
      data: {
        id: plan.id,
        name: plan.name
      }
    });

  } catch (error) {
    next(error);
  }
}
