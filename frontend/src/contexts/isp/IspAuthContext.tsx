import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import ispApi from '../../services/ispApi';

interface IspUser {
  id: string;
  fullName: string;
  email: string;
  tenantId: string;
  tenantRole: string;
  lastLogin: string | null;
}

interface Tenant {
  id: string;
  name: string;
  slug: string;
  status: string;
}

interface Subscription {
  status: string;
  planName: string;
  trialEndsAt: string | null;
  currentPeriodEnd: string | null;
}

interface IspAuthContextValue {
  user: IspUser | null;
  tenant: Tenant | null;
  subscription: Subscription | null;
  loading: boolean;
  login: (token: string, user: IspUser, tenant: Tenant) => void;
  logout: () => void;
}

const IspAuthContext = createContext<IspAuthContextValue | null>(null);

export function IspAuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser]                 = useState<IspUser | null>(null);
  const [tenant, setTenant]             = useState<Tenant | null>(null);
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [loading, setLoading]           = useState(true);

  useEffect(() => {
    const token    = localStorage.getItem('dhos_isp_token');
    const savedUser = localStorage.getItem('dhos_isp_user');
    if (!token) { setLoading(false); return; }

    if (savedUser) {
      try { setUser(JSON.parse(savedUser)); } catch { /* ignore */ }
    }

    // Verify token and fetch fresh profile
    ispApi.get('/isp/auth/profile')
      .then((r) => {
        const p = r.data?.data;
        if (p) {
          setUser({ id: p.id, fullName: p.fullName, email: p.email, tenantId: p.tenantId, tenantRole: p.tenantRole, lastLogin: p.lastLogin });
          setTenant(p.tenant);
          setSubscription(p.subscription);
          localStorage.setItem('dhos_isp_user', JSON.stringify(p));
        }
      })
      .catch(() => {
        localStorage.removeItem('dhos_isp_token');
        localStorage.removeItem('dhos_isp_user');
        setUser(null);
      })
      .finally(() => setLoading(false));
  }, []);

  function login(token: string, u: IspUser, t: Tenant) {
    localStorage.setItem('dhos_isp_token', token);
    localStorage.setItem('dhos_isp_user', JSON.stringify(u));
    setUser(u);
    setTenant(t);
  }

  function logout() {
    ispApi.post('/isp/auth/logout').catch(() => {});
    localStorage.removeItem('dhos_isp_token');
    localStorage.removeItem('dhos_isp_user');
    setUser(null);
    setTenant(null);
    setSubscription(null);
    window.location.href = '/login';
  }

  return (
    <IspAuthContext.Provider value={{ user, tenant, subscription, loading, login, logout }}>
      {children}
    </IspAuthContext.Provider>
  );
}

export function useIspAuth() {
  const ctx = useContext(IspAuthContext);
  if (!ctx) throw new Error('useIspAuth must be used inside IspAuthProvider');
  return ctx;
}
