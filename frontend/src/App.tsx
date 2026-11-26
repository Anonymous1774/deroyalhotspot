import React, { useState, useEffect } from 'react';
import { Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import { getAppMode } from './utils/appMode';
import api from './services/api';
import { AdminUser } from './types';
import { ThemeProvider } from './contexts/ThemeContext';
import { ToastProvider, useToast } from './contexts/ToastContext';
import { ToastContainer } from './components/ui/ToastContainer';

// ── Layouts ──────────────────────────────────────────────────────────
import { AdminLayout }  from './layouts/AdminLayout';
import { PublicLayout } from './layouts/PublicLayout';

// ── Existing Admin pages (backward compat) ───────────────────────────
import { AdminLoginPage }     from './pages/AdminLoginPage';
import { AdminDashboardPage } from './pages/AdminDashboardPage';
import { RoutersPage }        from './pages/RoutersPage';
import { PlansPage }          from './pages/PlansPage';
import { ProfilesPage }       from './pages/ProfilesPage';
import { VouchersPage }       from './pages/VouchersPage';
import { SessionsPage }       from './pages/SessionsPage';
import { LogsPage }           from './pages/LogsPage';
import { SettingsPage }       from './pages/SettingsPage';
import { NotFoundPage }       from './pages/NotFoundPage';

// ── Captive portal ────────────────────────────────────────────────────
import { CaptivePortalPage } from './pages/CaptivePortalPage';

// ── Public pages ──────────────────────────────────────────────────────
import { LandingPage }    from './pages/public/LandingPage';
import { PricingPage }    from './pages/public/PricingPage';
import { HowItWorksPage } from './pages/public/HowItWorksPage';
import { CoveragePage }   from './pages/public/CoveragePage';
import { AboutPage }      from './pages/public/AboutPage';
import { ContactPage }    from './pages/public/ContactPage';
import { FAQPage }        from './pages/public/FAQPage';
import { TermsPage }      from './pages/public/TermsPage';
import { PrivacyPage }    from './pages/public/PrivacyPage';

// ── DHOS Platform pages ───────────────────────────────────────────────
import { PlatformPage }         from './pages/platform/PlatformPage';
import { PlatformFeaturesPage } from './pages/platform/PlatformFeaturesPage';
import { ForProvidersPage }     from './pages/platform/ForProvidersPage';
import { PlatformDemoPage }     from './pages/platform/PlatformDemoPage';

// ── Multi-tenant app routers (Stage 4+) ──────────────────────────────
import { IspAppRouter } from './routes/IspAppRouter';

// ── Subdomain mode ────────────────────────────────────────────────────
const APP_MODE = getAppMode();

// ─────────────────────────────────────────────────────────────────────
// Admin protected route guard (existing admin system — backward compat)
// ─────────────────────────────────────────────────────────────────────
const ProtectedAdminRoute = ({
  children, admin, loading,
}: { children: React.ReactNode; admin: AdminUser | null; loading: boolean }) => {
  const navigate  = useNavigate();
  const location  = useLocation();

  useEffect(() => {
    if (!loading && !admin && !localStorage.getItem('dhos_token')) {
      navigate('/admin/login', { replace: true, state: { from: location } });
    }
  }, [admin, loading, navigate, location]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col justify-center items-center font-sans text-slate-100">
        <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-4" />
        <p className="text-slate-400 text-sm font-semibold">Verifying session…</p>
      </div>
    );
  }

  return admin ? <>{children}</> : null;
};

// ─────────────────────────────────────────────────────────────────────
// Public website + existing admin dashboard (main domain)
// ─────────────────────────────────────────────────────────────────────
function PublicAndAdminApp() {
  const [admin, setAdmin] = useState<AdminUser | null>(() => {
    const token = localStorage.getItem('dhos_token');
    const saved = localStorage.getItem('dhos_admin');
    if (token && saved) { try { return JSON.parse(saved); } catch { return null; } }
    return null;
  });
  const [authLoading, setAuthLoading] = useState(!localStorage.getItem('dhos_token'));
  const navigate = useNavigate();
  const { showToast } = useToast();

  useEffect(() => {
    const token = localStorage.getItem('dhos_token');
    if (!token) { setAuthLoading(false); return; }
    api.get('/auth/profile')
      .then((r: { data: { data: { admin?: AdminUser } & AdminUser } }) => {
        const a = r.data?.data?.admin || r.data?.data;
        if (a) { setAdmin(a); localStorage.setItem('dhos_admin', JSON.stringify(a)); }
        else { localStorage.removeItem('dhos_token'); localStorage.removeItem('dhos_admin'); setAdmin(null); }
      })
      .catch(() => { localStorage.removeItem('dhos_token'); localStorage.removeItem('dhos_admin'); setAdmin(null); })
      .finally(() => setAuthLoading(false));
  }, []);

  const handleLogout = async () => {
    try { await api.post('/auth/logout').catch(() => {}); } finally {
      localStorage.removeItem('dhos_token');
      localStorage.removeItem('dhos_admin');
      setAdmin(null);
      showToast('Logged Out', 'You have been signed out.', 'info');
      navigate('/admin/login');
    }
  };

  const adminRoute = (page: React.ReactNode) => (
    <ProtectedAdminRoute admin={admin} loading={authLoading}>
      <AdminLayout onLogout={handleLogout} admin={admin}>{page}</AdminLayout>
    </ProtectedAdminRoute>
  );

  return (
    <>
      <ToastContainer />
      <Routes>
        {/* Public marketing website */}
        <Route path="/"             element={<PublicLayout><LandingPage /></PublicLayout>} />
        <Route path="/pricing"      element={<PublicLayout><PricingPage /></PublicLayout>} />
        <Route path="/how-it-works" element={<PublicLayout><HowItWorksPage /></PublicLayout>} />
        <Route path="/coverage"     element={<PublicLayout><CoveragePage /></PublicLayout>} />
        <Route path="/about"        element={<PublicLayout><AboutPage /></PublicLayout>} />
        <Route path="/contact"      element={<PublicLayout><ContactPage /></PublicLayout>} />
        <Route path="/faq"          element={<PublicLayout><FAQPage /></PublicLayout>} />
        <Route path="/terms"        element={<PublicLayout><TermsPage /></PublicLayout>} />
        <Route path="/privacy"      element={<PublicLayout><PrivacyPage /></PublicLayout>} />

        {/* DHOS Platform product pages */}
        <Route path="/platform"               element={<PublicLayout><PlatformPage /></PublicLayout>} />
        <Route path="/platform/features"      element={<PublicLayout><PlatformFeaturesPage /></PublicLayout>} />
        <Route path="/platform/for-providers" element={<PublicLayout><ForProvidersPage /></PublicLayout>} />
        <Route path="/platform/demo"          element={<PublicLayout><PlatformDemoPage /></PublicLayout>} />

        {/* Captive portal */}
        <Route path="/connect" element={<CaptivePortalPage />} />

        {/* Legacy admin dashboard (existing system — preserved) */}
        <Route path="/admin/login" element={<AdminLoginPage onLoginSuccess={setAdmin} />} />
        <Route path="/admin"            element={adminRoute(<AdminDashboardPage />)} />
        <Route path="/admin/routers"    element={adminRoute(<RoutersPage />)} />
        <Route path="/admin/plans"      element={adminRoute(<PlansPage />)} />
        <Route path="/admin/profiles"   element={adminRoute(<ProfilesPage />)} />
        <Route path="/admin/vouchers"   element={adminRoute(<VouchersPage />)} />
        <Route path="/admin/sessions"   element={adminRoute(<SessionsPage />)} />
        <Route path="/admin/logs"       element={adminRoute(<LogsPage />)} />
        <Route path="/admin/settings"   element={adminRoute(<SettingsPage />)} />

        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </>
  );
}

// ─────────────────────────────────────────────────────────────────────
// App entry — routes to correct interface based on subdomain
// ─────────────────────────────────────────────────────────────────────
export default function App() {
  return (
    <ThemeProvider>
      <ToastProvider>
        {APP_MODE === 'app'
          ? <IspAppRouter />
          : APP_MODE === 'platform'
            ? <IspAppRouter /> /* Stage 7: SuperAdminRouter */
            : APP_MODE === 'account'
              ? <IspAppRouter /> /* Stage 8: CustomerRouter */
              : <PublicAndAdminApp />}
      </ToastProvider>
    </ThemeProvider>
  );
}
