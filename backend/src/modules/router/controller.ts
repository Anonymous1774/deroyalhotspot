import { Request, Response, NextFunction } from 'express';
import * as service from './service';
import { createRouterSchema, updateRouterSchema, testRouterSchema } from './validator';
import prisma from '../../lib/prisma';
import { getRouterHealth, testRouterConnection as testMikrotikConnection } from '../../services/mikrotik/mikrotik-client';

/**
 * Controller to list all active routers.
 */
export async function list(req: Request, res: Response, next: NextFunction) {
  try {
    const routers = await service.getAllRouters();
    return res.status(200).json({
      success: true,
      message: 'Routers retrieved successfully.',
      data: routers
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Controller to get router details by ID.
 */
export async function getById(req: Request, res: Response, next: NextFunction) {
  try {
    const router = await service.getRouterById(req.params.id);
    return res.status(200).json({
      success: true,
      message: 'Router details retrieved successfully.',
      data: router
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Controller to create a new router.
 */
export async function create(req: Request, res: Response, next: NextFunction) {
  try {
    const validation = createRouterSchema.safeParse(req.body);
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

    const router = await service.createRouter(validation.data);

    await prisma.activityLog.create({
      data: {
        adminId: req.admin?.id || null,
        action: 'Router Created',
        module: 'ROUTER',
        description: `Created router '${router.name}' (${router.host}:${router.apiPort}).`,
        ipAddress: req.ip || null
      }
    });

    return res.status(201).json({
      success: true,
      message: 'Router created successfully.',
      data: router
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Controller to update a router by ID.
 */
export async function update(req: Request, res: Response, next: NextFunction) {
  try {
    const validation = updateRouterSchema.safeParse(req.body);
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

    const router = await service.updateRouter(req.params.id, validation.data);

    await prisma.activityLog.create({
      data: {
        adminId: req.admin?.id || null,
        action: 'Router Updated',
        module: 'ROUTER',
        description: `Updated configuration for router '${router.name}'.`,
        ipAddress: req.ip || null
      }
    });

    return res.status(200).json({
      success: true,
      message: 'Router updated successfully.',
      data: router
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Controller to enable a router.
 */
export async function enable(req: Request, res: Response, next: NextFunction) {
  try {
    const router = await service.enableRouter(req.params.id);

    await prisma.activityLog.create({
      data: {
        adminId: req.admin?.id || null,
        action: 'Router Enabled',
        module: 'ROUTER',
        description: `Enabled router '${router.name}'.`,
        ipAddress: req.ip || null
      }
    });

    return res.status(200).json({
      success: true,
      message: 'Router enabled successfully.',
      data: router
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Controller to disable a router.
 */
export async function disable(req: Request, res: Response, next: NextFunction) {
  try {
    const router = await service.disableRouter(req.params.id);

    await prisma.activityLog.create({
      data: {
        adminId: req.admin?.id || null,
        action: 'Router Disabled',
        module: 'ROUTER',
        description: `Disabled router '${router.name}'.`,
        ipAddress: req.ip || null
      }
    });

    return res.status(200).json({
      success: true,
      message: 'Router disabled successfully.',
      data: router
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Controller to delete (soft delete) a router.
 */
export async function remove(req: Request, res: Response, next: NextFunction) {
  try {
    const router = await service.deleteRouter(req.params.id);

    await prisma.activityLog.create({
      data: {
        adminId: req.admin?.id || null,
        action: 'Router Deleted',
        module: 'ROUTER',
        description: `Archived/deleted router '${router.name}' (ID: ${router.id}).`,
        ipAddress: req.ip || null
      }
    });

    return res.status(200).json({
      success: true,
      message: 'Router archived successfully.',
      data: router
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Controller to test connection for a specific router ID or unsaved body credentials.
 */
export async function testConnection(req: Request, res: Response, next: NextFunction) {
  try {
    const routerId = req.params.id;
    const result = await service.testRouterConnection(routerId, req.body);

    if (!result.success) {
      return res.status(400).json({
        success: false,
        message: `RouterOS connection failed: ${result.error || 'Timeout or connection refused'}`,
        data: result
      });
    }

    await prisma.activityLog.create({
      data: {
        adminId: req.admin?.id || null,
        action: 'Connection Test',
        module: 'ROUTER',
        description: `Tested connection for router ${routerId || req.body.host || 'form'} (Result: ONLINE, Latency: ${result.latencyMs}ms).`,
        ipAddress: req.ip || null
      }
    });

    return res.status(200).json({
      success: true,
      message: 'RouterOS connection test successful.',
      data: result
    });
  } catch (error: any) {
    return res.status(400).json({
      success: false,
      message: `RouterOS connection test failed: ${error.message || 'Unknown error'}`
    });
  }
}

/**
 * Controller to get live health telemetry for a specific router.
 */
export async function health(req: Request, res: Response, next: NextFunction) {
  try {
    const healthData = await service.getRouterHealthDetails(req.params.id);
    return res.status(200).json({
      success: true,
      message: 'Router health telemetry retrieved successfully.',
      data: healthData
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Legacy status endpoint controller for backward compatibility.
 */
export async function legacyStatus(req: Request, res: Response, next: NextFunction) {
  try {
    const healthData = await getRouterHealth();
    return res.status(200).json({
      success: true,
      message: 'Router health status retrieved successfully.',
      data: healthData
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Legacy test endpoint controller for backward compatibility.
 */
export async function legacyTest(req: Request, res: Response, next: NextFunction) {
  try {
    const result = await service.testRouterConnection(undefined, req.body);
    if (!result.success) {
      return res.status(400).json({
        success: false,
        message: `RouterOS API connection test failed: ${result.error || 'Connection failed'}`
      });
    }
    return res.status(200).json({
      success: true,
      message: 'RouterOS API connection test successful.',
      data: result
    });
  } catch (error: any) {
    return res.status(400).json({
      success: false,
      message: `RouterOS API connection test failed: ${error.message || 'Unknown error'}`
    });
  }
}
