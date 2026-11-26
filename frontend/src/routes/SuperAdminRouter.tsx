import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { PlatformAuthProvider, usePlatformAuth } from '../contexts/platform/PlatformAuthContext';
import { PlatformLayout } from '../layouts/PlatformLayout';
import { PlatformLoginPage }            from '../pages/superadmin/PlatformLoginPage';
import { PlatformDashboardPage }        from '../pages/superadmin/PlatformDashboardPage';
import { PlatformTenantsPage }          from '../pages/superadmin/PlatformTenantsPage';
import { PlatformSubscriptionPlansPage } from '../pages/superadmin/PlatformSubscriptionPlansPage';
import { PlatformAuditLogsPage }        from '../pages/superadmin/PlatformAuditLogsPage';

function ProtectedPlatformRoute({ children }: { children: React.ReactNode }) {
  const { admin, loading } = usePlatformAuth();
  if (loading) {
    return (
      <div className="min-h-screen bg-navy-950 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-wire-orange border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }
  if (!admin) return <Navigate to="/login" replace />;
  return <PlatformLayout>{children}</PlatformLayout>;
}

export function SuperAdminRouter() {
  return (
    <PlatformAuthProvider>
      <Routes>
        <Route path="/login"         element={<PlatformLoginPage />} />
        <Route path="/dashboard"     element={<ProtectedPlatformRoute><PlatformDashboardPage /></ProtectedPlatformRoute>} />
        <Route path="/tenants"       element={<ProtectedPlatformRoute><PlatformTenantsPage /></ProtectedPlatformRoute>} />
        <Route path="/plans"         element={<ProtectedPlatformRoute><PlatformSubscriptionPlansPage /></ProtectedPlatformRoute>} />
        <Route path="/audit"         element={<ProtectedPlatformRoute><PlatformAuditLogsPage /></ProtectedPlatformRoute>} />
        <Route path="/"              element={<Navigate to="/dashboard" replace />} />
        <Route path="*"              element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </PlatformAuthProvider>
  );
}
