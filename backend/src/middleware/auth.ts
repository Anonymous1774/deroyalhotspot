/**
 * DHOS Multi-Tenant Authentication Middleware
 * ============================================
 * Four separate middleware functions for the three actor types:
 *
 *   authenticate()         — existing admin JWT (backward compat shim)
 *   authenticateIsp()      — ISP owner / staff
 *   authenticateSuperAdmin() — Platform Super Admin
 *   authenticateCustomer() — Internet customer account
 *
 * Plus authorization helpers:
 *   requireSuperAdmin()    — Only platform super admins
 *   requireTenantRole()    — Require a minimum TenantRole level
 *   requireTenantOwner()   — Must be OWNER of their tenant
 */

import { Request, Response, NextFunction } from 'express';
import { TenantRole } from '../utils/jwt';
import {
  verifyToken,
  verifyIspToken,
  verifySuperAdminToken,
  verifyCustomerToken,
} from '../utils/jwt';

// ─── Role ordering (higher index = more privilege) ────────────

const TENANT_ROLE_ORDER: TenantRole[] = [
  'STAFF',
  'SUPPORT_AGENT',
  'FINANCE_MANAGER',
  'NETWORK_MANAGER',
  'ADMINISTRATOR',
  'OWNER',
];

function tenantRoleLevel(role: TenantRole): number {
  return TENANT_ROLE_ORDER.indexOf(role);
}

// ─── Token extraction helper ──────────────────────────────────

function extractBearerToken(req: Request): string | null {
  const auth = req.headers.authorization;
  if (!auth || !auth.startsWith('Bearer ')) return null;
  return auth.split(' ')[1];
}

function unauthorised(res: Response, message: string, code: string) {
  return res.status(401).json({
    success: false,
    message,
    error: { code },
  });
}

function forbidden(res: Response, message: string, code: string) {
  return res.status(403).json({
    success: false,
    message,
    error: { code },
  });
}

// ─── Middleware: ISP user (owner / staff) ─────────────────────

export function authenticateIsp(req: Request, res: Response, next: NextFunction) {
  const token = extractBearerToken(req);

  if (!token) {
    return unauthorised(res, 'Authentication token is missing.', 'UNAUTHORIZED');
  }

  const decoded = verifyIspToken(token);

  if (!decoded) {
    return unauthorised(
      res,
      'Your session has expired or the token is invalid. Please log in again.',
      'INVALID_TOKEN',
    );
  }

  req.ispUser = {
    id: decoded.sub,
    email: decoded.email,
    tenantId: decoded.tenantId,
    tenantRole: decoded.tenantRole,
  };

  next();
}

// ─── Middleware: Super Admin ───────────────────────────────────

export function authenticateSuperAdmin(req: Request, res: Response, next: NextFunction) {
  const token = extractBearerToken(req);

  if (!token) {
    return unauthorised(res, 'Authentication token is missing.', 'UNAUTHORIZED');
  }

  const decoded = verifySuperAdminToken(token);

  if (!decoded) {
    return unauthorised(
      res,
      'Your session has expired or the token is invalid.',
      'INVALID_TOKEN',
    );
  }

  req.superAdmin = {
    id: decoded.sub,
    email: decoded.email,
  };

  next();
}

// ─── Middleware: Customer ─────────────────────────────────────

export function authenticateCustomer(req: Request, res: Response, next: NextFunction) {
  const token = extractBearerToken(req);

  if (!token) {
    return unauthorised(res, 'Authentication token is missing.', 'UNAUTHORIZED');
  }

  const decoded = verifyCustomerToken(token);

  if (!decoded) {
    return unauthorised(
      res,
      'Your session has expired or the token is invalid. Please log in again.',
      'INVALID_TOKEN',
    );
  }

  req.customer = {
    id: decoded.sub,
    tenantId: decoded.tenantId,
    email: decoded.email,
  };

  next();
}

// ─── Backward-compat: existing admin JWT ─────────────────────
// Kept so existing controllers (which write req.admin) continue
// to work during the Stage 3 migration. Will be removed in Stage 5.

export function authenticate(req: Request, res: Response, next: NextFunction) {
  const token = extractBearerToken(req);

  if (!token) {
    return unauthorised(res, 'Authentication token is missing. Please log in.', 'UNAUTHORIZED');
  }

  const decoded = verifyToken(token);

  if (!decoded) {
    return unauthorised(
      res,
      'Your session has expired or the token is invalid. Please log in again.',
      'INVALID_TOKEN',
    );
  }

  // Support both old payload (id/email/role) and new ISP payload
  if (decoded.type === 'isp') {
    req.admin = {
      id: decoded.sub,
      email: decoded.email,
      role: decoded.tenantRole,
    };
  } else if (decoded.type === 'superadmin') {
    req.admin = {
      id: decoded.sub,
      email: decoded.email,
      role: 'SUPER_ADMIN',
    };
  } else {
    // Legacy token format: { id, email, role }
    const legacy = decoded as any;
    req.admin = {
      id: legacy.id || legacy.sub,
      email: legacy.email,
      role: legacy.role,
    };
  }

  next();
}

// ─── Authorization guards ─────────────────────────────────────

/**
 * Require the authenticated ISP user to have at least the given role.
 * Must be used after authenticateIsp().
 */
export function requireTenantRole(minimumRole: TenantRole) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.ispUser) {
      return forbidden(res, 'ISP authentication required.', 'FORBIDDEN');
    }

    const userLevel = tenantRoleLevel(req.ispUser.tenantRole);
    const requiredLevel = tenantRoleLevel(minimumRole);

    if (userLevel < requiredLevel) {
      return forbidden(
        res,
        `This action requires the '${minimumRole}' role or higher.`,
        'INSUFFICIENT_ROLE',
      );
    }

    next();
  };
}

/** Convenience: require OWNER role */
export const requireTenantOwner = requireTenantRole('OWNER');

/** Convenience: require ADMINISTRATOR or higher */
export const requireTenantAdmin = requireTenantRole('ADMINISTRATOR');

/** Convenience: require NETWORK_MANAGER or higher */
export const requireNetworkManager = requireTenantRole('NETWORK_MANAGER');

/** Convenience: require FINANCE_MANAGER or higher */
export const requireFinanceManager = requireTenantRole('FINANCE_MANAGER');

/**
 * Require Super Admin authentication.
 * Must be used after authenticateSuperAdmin().
 */
export function requireSuperAdmin(req: Request, res: Response, next: NextFunction) {
  if (!req.superAdmin) {
    return forbidden(
      res,
      'Super Admin access is required for this action.',
      'FORBIDDEN',
    );
  }
  next();
}
