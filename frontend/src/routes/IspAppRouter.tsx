import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { IspAuthProvider, useIspAuth } from '../contexts/isp/IspAuthContext';
import { IspLayout } from '../layouts/IspLayout';
import { IspLoginPage }      from '../pages/app/IspLoginPage';
import { IspRegisterPage }   from '../pages/app/IspRegisterPage';
import { IspOnboardingPage } from '../pages/app/IspOnboardingPage';

// Re-using existing admin pages until Stage 6 ISP-specific redesign
import { AdminDashboardPage } from '../pages/AdminDashboardPage';
import { RoutersPage }        from '../pages/RoutersPage';
import { PlansPage }          from '../pages/PlansPage';
import { VouchersPage }       from '../pages/VouchersPage';
import { SessionsPage }       from '../pages/SessionsPage';
import { ProfilesPage }       from '../pages/ProfilesPage';
import { LogsPage }           from '../pages/LogsPage';
import { SettingsPage }       from '../pages/SettingsPage';

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useIspAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-navy-950 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-wire-orange border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) return <Navigate to="/login" replace />;
  return <IspLayout>{children}</IspLayout>;
}

export function IspAppRouter() {
  return (
    <IspAuthProvider>
      <Routes>
        {/* Public ISP routes */}
        <Route path="/login"      element={<IspLoginPage />} />
        <Route path="/register"   element={<IspRegisterPage />} />
        <Route path="/onboarding" element={<IspOnboardingPage />} />

        {/* Protected dashboard routes */}
        <Route path="/dashboard"    element={<ProtectedRoute><AdminDashboardPage /></ProtectedRoute>} />
        <Route path="/routers"      element={<ProtectedRoute><RoutersPage /></ProtectedRoute>} />
        <Route path="/plans"        element={<ProtectedRoute><PlansPage /></ProtectedRoute>} />
        <Route path="/vouchers"     element={<ProtectedRoute><VouchersPage /></ProtectedRoute>} />
        <Route path="/sessions"     element={<ProtectedRoute><SessionsPage /></ProtectedRoute>} />
        <Route path="/profiles"     element={<ProtectedRoute><ProfilesPage /></ProtectedRoute>} />
        <Route path="/analytics"    element={<ProtectedRoute><AdminDashboardPage /></ProtectedRoute>} />
        <Route path="/staff"        element={<ProtectedRoute><SettingsPage /></ProtectedRoute>} />
        <Route path="/customers"    element={<ProtectedRoute><SessionsPage /></ProtectedRoute>} />
        <Route path="/subscription" element={<ProtectedRoute><SettingsPage /></ProtectedRoute>} />
        <Route path="/logs"         element={<ProtectedRoute><LogsPage /></ProtectedRoute>} />
        <Route path="/support"      element={<ProtectedRoute><SettingsPage /></ProtectedRoute>} />
        <Route path="/settings"     element={<ProtectedRoute><SettingsPage /></ProtectedRoute>} />

        <Route path="/"  element={<Navigate to="/dashboard" replace />} />
        <Route path="*"  element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </IspAuthProvider>
  );
}
