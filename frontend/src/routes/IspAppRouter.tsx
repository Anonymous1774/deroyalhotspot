import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { IspAuthProvider, useIspAuth } from '../contexts/isp/IspAuthContext';
import { IspLayout } from '../layouts/IspLayout';

// Auth pages
import { IspLoginPage }      from '../pages/app/IspLoginPage';
import { IspRegisterPage }   from '../pages/app/IspRegisterPage';
import { IspOnboardingPage } from '../pages/app/IspOnboardingPage';

// Stage 6: Full ISP Dashboard pages
import { IspDashboardPage }          from '../pages/app/IspDashboardPage';
import { IspRoutersPage }            from '../pages/app/IspRoutersPage';
import { IspPlansPage }              from '../pages/app/IspPlansPage';
import { IspVouchersPage }           from '../pages/app/IspVouchersPage';
import { IspSessionsPage }           from '../pages/app/IspSessionsPage';
import { IspStaffPage }              from '../pages/app/IspStaffPage';
import { IspSubscriptionPage }       from '../pages/app/IspSubscriptionPage';
import { IspSettingsPage }           from '../pages/app/IspSettingsPage';
import { IspBandwidthProfilesPage }  from '../pages/app/IspBandwidthProfilesPage';

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
        <Route path="/dashboard"    element={<ProtectedRoute><IspDashboardPage /></ProtectedRoute>} />
        <Route path="/routers"      element={<ProtectedRoute><IspRoutersPage /></ProtectedRoute>} />
        <Route path="/plans"        element={<ProtectedRoute><IspPlansPage /></ProtectedRoute>} />
        <Route path="/profiles"     element={<ProtectedRoute><IspBandwidthProfilesPage /></ProtectedRoute>} />
        <Route path="/vouchers"     element={<ProtectedRoute><IspVouchersPage /></ProtectedRoute>} />
        <Route path="/sessions"     element={<ProtectedRoute><IspSessionsPage /></ProtectedRoute>} />
        <Route path="/staff"        element={<ProtectedRoute><IspStaffPage /></ProtectedRoute>} />
        <Route path="/subscription" element={<ProtectedRoute><IspSubscriptionPage /></ProtectedRoute>} />
        <Route path="/settings"     element={<ProtectedRoute><IspSettingsPage /></ProtectedRoute>} />

        {/* Redirect root to dashboard */}
        <Route path="/"  element={<Navigate to="/dashboard" replace />} />
        <Route path="*"  element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </IspAuthProvider>
  );
}
