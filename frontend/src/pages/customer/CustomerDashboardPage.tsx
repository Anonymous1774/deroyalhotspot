import { useState, useEffect } from 'react';
import { Wifi, Clock, Package, HelpCircle } from 'lucide-react';
import { useCustomerAuth } from '../../contexts/customer/CustomerAuthContext';
import axios from 'axios';

const api = axios.create({ baseURL: '/api/v1' });
api.interceptors.request.use(c => {
  const t = localStorage.getItem('dhos_customer_token');
  if (t) c.headers.Authorization = `Bearer ${t}`;
  return c;
});

export function CustomerDashboardPage() {
  const { customer } = useCustomerAuth();
  const [sessions, setSessions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/customer/sessions')
      .then(r => setSessions(r.data.data || []))
      .catch(() => {/* silent — customer may not have sessions */})
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-navy-900">My Account</h1>
        <p className="text-sm text-slate-500 mt-1">Welcome back, {customer?.name}</p>
      </div>

      {/* Quick actions */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { icon: Wifi, label: 'Connect to Internet', desc: 'Activate a voucher or buy a package', href: '/connect', color: 'bg-wire-orange' },
          { icon: Clock, label: 'View Sessions', desc: 'Check your active connections', href: '#sessions', color: 'bg-wire-blue' },
          { icon: HelpCircle, label: 'Get Support', desc: 'Contact De Royal Hotspot', href: 'mailto:support@deroyalhotspot.name.ng', color: 'bg-wire-green' },
        ].map(card => (
          <a key={card.label} href={card.href}
            className="bg-white rounded-xl border border-slate-100 p-5 hover:border-slate-200 hover:shadow-sm transition-all group flex items-start gap-4">
            <div className={`w-10 h-10 ${card.color} rounded-xl flex items-center justify-center shrink-0`}>
              <card.icon className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="font-semibold text-navy-900 text-sm group-hover:text-wire-blue transition-colors">{card.label}</p>
              <p className="text-xs text-slate-400 mt-0.5">{card.desc}</p>
            </div>
          </a>
        ))}
      </div>

      {/* Sessions */}
      <div id="sessions" className="bg-white rounded-xl border border-slate-100 p-5">
        <h2 className="font-semibold text-navy-900 mb-4">Recent Sessions</h2>
        {loading ? (
          <p className="text-sm text-slate-400">Loading sessions…</p>
        ) : sessions.length === 0 ? (
          <div className="text-center py-8">
            <Package className="w-8 h-8 text-slate-200 mx-auto mb-2" />
            <p className="text-sm text-slate-400">No internet sessions yet.</p>
            <a href="/connect" className="mt-2 inline-block text-sm text-wire-blue hover:underline font-medium">
              Activate a voucher →
            </a>
          </div>
        ) : (
          <div className="space-y-3">
            {sessions.map((s: any) => (
              <div key={s.id} className="flex items-center justify-between py-2 border-b border-slate-50 last:border-0">
                <div>
                  <p className="text-sm font-medium text-navy-900">{s.voucher?.plan?.name || 'Internet Access'}</p>
                  <p className="text-xs text-slate-400">{new Date(s.loginTime).toLocaleDateString()}</p>
                </div>
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${s.status === 'ONLINE' ? 'bg-green-50 text-green-700' : 'bg-slate-100 text-slate-500'}`}>
                  {s.status}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Account details */}
      <div className="bg-white rounded-xl border border-slate-100 p-5">
        <h2 className="font-semibold text-navy-900 mb-4">Account Details</h2>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between py-1.5 border-b border-slate-50">
            <span className="text-slate-500">Name</span>
            <span className="font-medium text-navy-900">{customer?.name}</span>
          </div>
          <div className="flex justify-between py-1.5 border-b border-slate-50">
            <span className="text-slate-500">Email</span>
            <span className="font-medium text-navy-900">{customer?.email}</span>
          </div>
          {customer?.phone && (
            <div className="flex justify-between py-1.5">
              <span className="text-slate-500">Phone</span>
              <span className="font-medium text-navy-900">{customer.phone}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
