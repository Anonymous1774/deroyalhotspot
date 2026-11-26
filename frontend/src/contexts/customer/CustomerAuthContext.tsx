import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import axios from 'axios';

const customerApi = axios.create({ baseURL: '/api/v1' });
customerApi.interceptors.request.use(c => {
  const t = localStorage.getItem('dhos_customer_token');
  if (t) c.headers.Authorization = `Bearer ${t}`;
  return c;
});

interface Customer { id: string; name: string; email: string; phone?: string; }

interface CustomerAuthContextValue {
  customer: Customer | null;
  loading: boolean;
  login: (token: string, customer: Customer) => void;
  logout: () => void;
}

const CustomerAuthContext = createContext<CustomerAuthContextValue | null>(null);

export function CustomerAuthProvider({ children }: { children: ReactNode }) {
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [loading, setLoading]   = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('dhos_customer_token');
    const saved = localStorage.getItem('dhos_customer');
    if (!token) { setLoading(false); return; }
    if (saved) { try { setCustomer(JSON.parse(saved)); } catch { /* ignore */ } }
    customerApi.get('/customer/auth/profile')
      .then(r => { const p = r.data?.data; if (p) { setCustomer(p); localStorage.setItem('dhos_customer', JSON.stringify(p)); } })
      .catch(() => { localStorage.removeItem('dhos_customer_token'); setCustomer(null); })
      .finally(() => setLoading(false));
  }, []);

  function login(token: string, c: Customer) {
    localStorage.setItem('dhos_customer_token', token);
    localStorage.setItem('dhos_customer', JSON.stringify(c));
    setCustomer(c);
  }

  function logout() {
    localStorage.removeItem('dhos_customer_token');
    localStorage.removeItem('dhos_customer');
    setCustomer(null);
    window.location.href = '/login';
  }

  return (
    <CustomerAuthContext.Provider value={{ customer, loading, login, logout }}>
      {children}
    </CustomerAuthContext.Provider>
  );
}

export function useCustomerAuth() {
  const ctx = useContext(CustomerAuthContext);
  if (!ctx) throw new Error('useCustomerAuth must be used inside CustomerAuthProvider');
  return ctx;
}
