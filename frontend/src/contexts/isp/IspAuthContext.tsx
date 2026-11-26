import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import ispApi from '../../services/ispApi';

interface IspUser {
  id: string;
  fullName: string;
  email: string;
  tenantId: string;
  tenantRole: string;
  lastLogin: string | null;
}

export interface Tenant {
  id: string;
  name: string;
  businessName: string;
  businessEmail: string;
  businessPhone: string;
  businessAddress: string;
  website: string;
  slug: string;
  status: string;
  subscription?: {
    status: string;
    planName: string;
    trialEndsAt: string | null;
    currentPeriodEnd: string | null;
  };
}

interface IspAuthContextValue {
  user: IspUser | null;
  tenant: Tenant | null;
  loading: boolean;
  login: (token: string, user: IspUser, tenant: Tenant) => void;
  logout: () => void;
  fetchProfile: () => Promise<void>;
}

const IspAuthContext = createContext<IspAuthContextValue | null>(null);

export function IspAuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser]     = useState<IspUser | null>(null);
  const [tenant, setTenant] = useState<Tenant | null>(null);
  const [loading, setLoading] = useState(true);

  const applyProfile = (p: any) => {
    if (!p) return;
    const u: IspUser = { id: p.id, fullName: p.fullName, email: p.email, tenantId: p.tenantId, tenantRole: p.tenantRole, lastLogin: p.lastLogin ?? null };
    const t: Tenant = {
      id: p.tenant?.id || p.tenantId,
      name: p.tenant?.name || '',
      businessName: p.tenant?.businessName || p.tenant?.name || '',
      businessEmail: p.tenant?.businessEmail || '',
      businessPhone: p.tenant?.businessPhone || '',
      businessAddress: p.tenant?.businessAddress || '',
      website: p.tenant?.website || '',
      slug: p.tenant?.slug || '',
      status: p.tenant?.status || 'ACTIVE',
      subscription: p.subscription,
    };
    setUser(u);
    setTenant(t);
    localStorage.setItem('dhos_isp_user', JSON.stringify(p));
  };

  const fetchProfile = useCallback(async () => {
    const r = await ispApi.get('/isp/auth/profile');
    applyProfile(r.data?.data);
  }, []);

  useEffect(() => {
    const token = localStorage.getItem('dhos_isp_token');
    const savedUser = localStorage.getItem('dhos_isp_user');
    if (!token) { setLoading(false); return; }
    if (savedUser) {
      try { applyProfile(JSON.parse(savedUser)); } catch { /* ignore */ }
    }
    ispApi.get('/isp/auth/profile')
      .then(r => applyProfile(r.data?.data))
      .catch(() => {
        localStorage.removeItem('dhos_isp_token');
        localStorage.removeItem('dhos_isp_user');
        setUser(null);
        setTenant(null);
      })
      .finally(() => setLoading(false));
  }, []);

  function login(token: string, u: IspUser, t: Tenant) {
    localStorage.setItem('dhos_isp_token', token);
    localStorage.setItem('dhos_isp_user', JSON.stringify({ ...u, tenant: t }));
    setUser(u);
    setTenant(t);
  }

  function logout() {
    ispApi.post('/isp/auth/logout').catch(() => {});
    localStorage.removeItem('dhos_isp_token');
    localStorage.removeItem('dhos_isp_user');
    setUser(null);
    setTenant(null);
    window.location.href = '/login';
  }

  return (
    <IspAuthContext.Provider value={{ user, tenant, loading, login, logout, fetchProfile }}>
      {children}
    </IspAuthContext.Provider>
  );
}

export function useIspAuth() {
  const ctx = useContext(IspAuthContext);
  if (!ctx) throw new Error('useIspAuth must be used inside IspAuthProvider');
  return ctx;
}
