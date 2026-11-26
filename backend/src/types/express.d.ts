declare global {
  namespace Express {
    interface Request {
      // ── Backward-compat: existing admin routes ────────────
      admin?: {
        id: string;
        email: string;
        role: string;
      };

      // ── New: ISP owner / staff ─────────────────────────────
      ispUser?: {
        id: string;
        email: string;
        tenantId: string;
        tenantRole: import('../utils/jwt').TenantRole;
      };

      // ── New: Super Admin ───────────────────────────────────
      superAdmin?: {
        id: string;
        email: string;
      };

      // ── New: Customer account ──────────────────────────────
      customer?: {
        id: string;
        tenantId: string;
        email?: string;
      };
    }
  }
}

export {};
