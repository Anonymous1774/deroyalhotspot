import React, { useState, useEffect } from 'react';
import { Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import api from './services/api';
import { AdminUser } from './types';
import { ThemeProvider } from './contexts/ThemeContext';
import { ToastProvider, useToast } from './contexts/ToastContext';
import { ToastContainer } from './components/ui/ToastContainer';
import { AdminLayout } from './layouts/AdminLayout';
import { CaptivePortalPage } from './pages/CaptivePortalPage';
import { AdminLoginPage } from './pages/AdminLoginPage';
import { AdminDashboardPage } from './pages/AdminDashboardPage';
import { PlansPage } from './pages/PlansPage';
import { ProfilesPage } from './pages/ProfilesPage';
import { VouchersPage } from './pages/VouchersPage';
import { SessionsPage } from './pages/SessionsPage';
import { LogsPage } from './pages/LogsPage';
import { SettingsPage } from './pages/SettingsPage';
import { NotFoundPage } from './pages/NotFoundPage';

// Protected Route Guard Component
const ProtectedRoute = ({
  children,
  admin,
  loading
}: {
  children: React.ReactNode;
  admin: AdminUser | null;
  loading: boolean;
}) => {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (!loading && !admin && !localStorage.getItem('dhos_token')) {
      navigate('/admin/login', { replace: true, state: { from: location } });
    }
  }, [admin, loading, navigate, location]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col justify-center items-center font-sans text-slate-100">
        <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-4" />
        <p className="text-slate-400 text-sm font-semibold">Verifying administrator session...</p>
      </div>
    );
  }

  return admin ? <>{children}</> : null;
};

// Main App Router Inner Component
const AppContent: React.FC = () => {
  const [admin, setAdmin] = useState<AdminUser | null>(() => {
    const savedToken = localStorage.getItem('dhos_token');
    const savedAdmin = localStorage.getItem('dhos_admin');
    if (savedToken && savedAdmin) {
      try {
        return JSON.parse(savedAdmin);
      } catch (e) {
        return null;
      }
    }
    return null;
  });
  const [authLoading, setAuthLoading] = useState<boolean>(() => !localStorage.getItem('dhos_token'));
  const navigate = useNavigate();
  const { showToast } = useToast();

  const verifyAuthSession = async () => {
    const token = localStorage.getItem('dhos_token');
    if (!token) {
      setAdmin(null);
      setAuthLoading(false);
      return;
    }

    try {
      const response = await api.get('/auth/profile');
      if (response.data && response.data.success) {
        const adminProfile = response.data.data.admin || response.data.data;
        setAdmin(adminProfile);
        localStorage.setItem('dhos_admin', JSON.stringify(adminProfile));
      } else {
        localStorage.removeItem('dhos_token');
        localStorage.removeItem('dhos_admin');
        setAdmin(null);
      }
    } catch (err) {
      console.warn('Authentication token verification failed:', err);
      localStorage.removeItem('dhos_token');
      localStorage.removeItem('dhos_admin');
      setAdmin(null);
    } finally {
      setAuthLoading(false);
    }
  };

  useEffect(() => {
    verifyAuthSession();
  }, []);

  const handleLogout = async () => {
    try {
      await api.post('/auth/logout').catch(() => {});
    } finally {
      localStorage.removeItem('dhos_token');
      localStorage.removeItem('dhos_admin');
      setAdmin(null);
      showToast('Logged Out', 'You have been signed out of Admin OS.', 'info');
      navigate('/admin/login');
    }
  };

  return (
    <>
      <ToastContainer />
      <Routes>
        {/* Customer Captive Portal */}
        <Route path="/" element={<CaptivePortalPage />} />

        {/* Admin Login */}
        <Route
          path="/admin/login"
          element={<AdminLoginPage onLoginSuccess={(adminData) => setAdmin(adminData)} />}
        />

        {/* Protected Admin Routes */}
        <Route
          path="/admin"
          element={
            <ProtectedRoute admin={admin} loading={authLoading}>
              <AdminLayout onLogout={handleLogout} admin={admin}>
                <AdminDashboardPage />
              </AdminLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/plans"
          element={
            <ProtectedRoute admin={admin} loading={authLoading}>
              <AdminLayout onLogout={handleLogout} admin={admin}>
                <PlansPage />
              </AdminLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/profiles"
          element={
            <ProtectedRoute admin={admin} loading={authLoading}>
              <AdminLayout onLogout={handleLogout} admin={admin}>
                <ProfilesPage />
              </AdminLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/vouchers"
          element={
            <ProtectedRoute admin={admin} loading={authLoading}>
              <AdminLayout onLogout={handleLogout} admin={admin}>
                <VouchersPage />
              </AdminLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/sessions"
          element={
            <ProtectedRoute admin={admin} loading={authLoading}>
              <AdminLayout onLogout={handleLogout} admin={admin}>
                <SessionsPage />
              </AdminLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/logs"
          element={
            <ProtectedRoute admin={admin} loading={authLoading}>
              <AdminLayout onLogout={handleLogout} admin={admin}>
                <LogsPage />
              </AdminLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/settings"
          element={
            <ProtectedRoute admin={admin} loading={authLoading}>
              <AdminLayout onLogout={handleLogout} admin={admin}>
                <SettingsPage />
              </AdminLayout>
            </ProtectedRoute>
          }
        />

        {/* 404 Fallback */}
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </>
  );
};

export default function App() {
  return (
    <ThemeProvider>
      <ToastProvider>
        <AppContent />
      </ToastProvider>
    </ThemeProvider>
  );
}
