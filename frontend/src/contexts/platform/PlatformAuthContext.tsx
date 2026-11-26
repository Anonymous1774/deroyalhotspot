import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import platformApi from '../../services/platformApi';

interface SuperAdmin {
  id: string;
  fullName: string;
  email: string;
  role: string;
}

interface PlatformAuthContextValue {
  admin: SuperAdmin | null;
  loading: boolean;
  login: (token: string, admin: SuperAdmin) => void;
  logout: () => void;
  fetchProfile: () => Promise<void>;
}

const PlatformAuthContext = createContext<PlatformAuthContextValue | null>(null);

export function PlatformAuthProvider({ children }: { children: ReactNode }) {
  const [admin, setAdmin] = useState<SuperAdmin | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = useCallback(async () => {
    const r = await platformApi.get('/platform/auth/profile');
    const p = r.data?.data;
    if (p) setAdmin({ id: p.id, fullName: p.fullName, email: p.email, role: p.role });
  }, []);

  useEffect(() => {
    const token = localStorage.getItem('dhos_platform_token');
    const saved = localStorage.getItem('dhos_platform_admin');
    if (!token) { setLoading(false); return; }
    if (saved) { try { setAdmin(JSON.parse(saved)); } catch { /* ignore */ } }
    platformApi.get('/platform/auth/profile')
      .then(r => {
        const p = r.data?.data;
        if (p) {
          const a = { id: p.id, fullName: p.fullName, email: p.email, role: p.role };
          setAdmin(a);
          localStorage.setItem('dhos_platform_admin', JSON.stringify(a));
        }
      })
      .catch(() => {
        localStorage.removeItem('dhos_platform_token');
        localStorage.removeItem('dhos_platform_admin');
        setAdmin(null);
      })
      .finally(() => setLoading(false));
  }, []);

  function login(token: string, a: SuperAdmin) {
    localStorage.setItem('dhos_platform_token', token);
    localStorage.setItem('dhos_platform_admin', JSON.stringify(a));
    setAdmin(a);
  }

  function logout() {
    platformApi.post('/platform/auth/logout').catch(() => {});
    localStorage.removeItem('dhos_platform_token');
    localStorage.removeItem('dhos_platform_admin');
    setAdmin(null);
    window.location.href = '/login';
  }

  return (
    <PlatformAuthContext.Provider value={{ admin, loading, login, logout, fetchProfile }}>
      {children}
    </PlatformAuthContext.Provider>
  );
}

export function usePlatformAuth() {
  const ctx = useContext(PlatformAuthContext);
  if (!ctx) throw new Error('usePlatformAuth must be used inside PlatformAuthProvider');
  return ctx;
}
