import { Request, Response, NextFunction } from 'express';
import { verifyToken } from '../utils/jwt';

/**
 * Authentication middleware that verifies JWT and injects req.admin.
 */
export function authenticate(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      success: false,
      message: 'Authentication token is missing. Please log in.',
      error: {
        code: 'UNAUTHORIZED',
        details: 'Authorization header with Bearer token is required.'
      }
    });
  }

  const token = authHeader.split(' ')[1];
  const decoded = verifyToken(token);

  if (!decoded) {
    return res.status(401).json({
      success: false,
      message: 'Your session has expired or the token is invalid. Please log in again.',
      error: {
        code: 'INVALID_TOKEN',
        details: 'Token signature verification failed or token expired.'
      }
    });
  }

  req.admin = {
    id: decoded.id,
    email: decoded.email,
    role: decoded.role
  };

  next();
}
