import { Request, Response, NextFunction } from 'express';
import { getRouterHealth, testRouterConnection } from '../../services/mikrotik/mikrotik-client';
import prisma from '../../lib/prisma';
import { decrypt } from '../../utils/crypto';

/**
 * Controller to fetch live router health status and telemetry.
 */
export async function status(req: Request, res: Response, next: NextFunction) {
  try {
    const health = await getRouterHealth();

    return res.status(200).json({
      success: true,
      message: 'Router health status retrieved successfully.',
      data: health
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Controller to trigger a socket connection test to MikroTik RouterOS API.
 */
export async function test(req: Request, res: Response, next: NextFunction) {
  try {
    const { host, port, username, password } = req.body;

    let testConfig: any = undefined;

    // If partial body values are provided, merge with stored database configs
    if (host || port || username || password) {
      const storedRouter = await prisma.router.findFirst();
      testConfig = {
        host: host || storedRouter?.host || '192.168.88.1',
        port: port !== undefined ? Number(port) : (storedRouter?.apiPort || 8728),
        username: username || storedRouter?.username || 'admin',
        password: password !== undefined 
          ? password 
          : (storedRouter?.encryptedPassword ? decrypt(storedRouter.encryptedPassword) : '')
      };
    }

    const success = await testRouterConnection(testConfig);

    return res.status(200).json({
      success: true,
      message: 'RouterOS API connection test successful.'
    });

  } catch (error: any) {
    return res.status(400).json({
      success: false,
      message: `RouterOS API connection test failed: ${error.message || 'Unknown error'}`
    });
  }
}
