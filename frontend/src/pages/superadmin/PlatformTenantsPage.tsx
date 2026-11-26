import { useState, useEffect, useCallback } from 'react';
import {
  Building2, CheckCircle, XCircle, Clock, AlertCircle,
  Loader2, Search, Eye, Ban, RefreshCw
} from 'lucide-react';
import platformApi from '../../services/platformApi';
import { Link } from 'react-router-dom';

interface Tenant {
  id: string;
  businessName: string;
  businessEmail: string;
  status: string;
  createdAt: string;
  subscription?: { status: string; plan?: { name: string } };
  _count?: { routers: number; vouchers: number };
}

const STATUS_CONFIG: Record<string, { color: string; icon: typeof CheckCircle }> = {
  ACTIVE:    { color: 'text-wire-green bg-green-50', icon: CheckCircle },
  TRIAL:     { color: 'text-amber-600 bg-amber-50', icon: Clock },
  SUSPENDED: { color: 'text-red-600 bg-red-50', icon: XCircle },
  PENDING:   { color: 'text-slate-500 bg-slate-100', icon: Clock },
};

export function PlatformTenantsPage() {
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [acting, setActing] = useState<string | null>(null);

  const load = useCallback(() => {
    setLoading(true);
    const params = new URLSearchParams();
    if (search) params.set('search', search);
    if (statusFilter !== 'All') params.set('status', statusFilter);
    platformApi.get(`/platform/tenants?${params}`)
      .then(r => setTenants(r.data.data?.tenants || r.data.data || []))
      .catch(() => setError('Failed to load ISP accounts.'))
      .finally(() => setLoading(false));
  }, [search, statusFilter]);

  useEffect(() => { load(); }, [load]);

  const handleAction = async (id: string, action: 'suspend' | 'activate' | 'approve') => {
    setActing(id);
    try {
      await platformApi.patch(`/platform/tenants/${id}/${action}`);
      load();
    } catch (err: any) {
      setError(err.response?.data?.message || `Failed to ${action} ISP account.`);
    } finally {
      setActing(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-navy-900">ISP Accounts</h1>
          <p className="text-sm text-slate-500 mt-1">Manage all registered internet service providers</p>
        </div>
        <button onClick={load} className="p-2 text-slate-500 hover:text-wire-blue transition-colors">
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      {error && (
        <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-3 text-sm">
          <AlertCircle className="w-4 h-4 shrink-0" />{error}
          <button onClick={() => setError('')} className="ml-auto">✕</button>
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-wrap gap-3 bg-white rounded-xl border border-slate-100 p-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search business name or email…"
            className="pl-9 pr-4 py-2 text-sm border border-slate-200 rounded-lg w-72 focus:outline-none focus:ring-2 focus:ring-wire-blue/30 focus:border-wire-blue" />
        </div>
        <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}
          className="text-sm border border-slate-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-wire-blue/30">
          {['All', 'ACTIVE', 'TRIAL', 'SUSPENDED', 'PENDING'].map(s =>
            <option key={s} value={s}>{s}</option>
          )}
        </select>
        <span className="ml-auto text-xs text-slate-500 self-center">{tenants.length} accounts</span>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-slate-100 overflow-hidden">
        {loading ? (
          <div className="text-center py-16 text-slate-400"><Loader2 className="w-8 h-8 animate-spin mx-auto" /></div>
        ) : tenants.length === 0 ? (
          <div className="text-center py-16">
            <Building2 className="w-10 h-10 text-slate-300 mx-auto mb-3" />
            <p className="text-sm font-medium text-slate-600">No ISP accounts found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 border-b border-slate-100">
                <tr>
                  {['Business', 'Email', 'Status', 'Plan', 'Routers', 'Registered', 'Actions'].map(h => (
                    <th key={h} className="text-left text-xs font-medium text-slate-500 uppercase tracking-wide px-4 py-3">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {tenants.map(t => {
                  const sc = STATUS_CONFIG[t.subscription?.status || t.status] || STATUS_CONFIG.PENDING;
                  return (
                    <tr key={t.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-4 py-3">
                        <p className="font-semibold text-navy-900">{t.businessName}</p>
                      </td>
                      <td className="px-4 py-3 text-slate-500">{t.businessEmail}</td>
                      <td className="px-4 py-3">
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${sc.color}`}>
                          {t.subscription?.status || t.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-slate-500">{t.subscription?.plan?.name || 'Trial'}</td>
                      <td className="px-4 py-3 text-slate-500">{t._count?.routers ?? '—'}</td>
                      <td className="px-4 py-3 text-slate-500 text-xs">{new Date(t.createdAt).toLocaleDateString()}</td>
                      <td className="px-4 py-3">
                        <div className="flex gap-2">
                          <Link to={`/tenants/${t.id}`}
                            className="p-1 text-slate-400 hover:text-wire-blue transition-colors" title="View">
                            <Eye className="w-4 h-4" />
                          </Link>
                          {t.status !== 'SUSPENDED' && (
                            <button onClick={() => handleAction(t.id, 'suspend')} disabled={acting === t.id}
                              className="p-1 text-slate-400 hover:text-red-500 transition-colors" title="Suspend">
                              {acting === t.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Ban className="w-4 h-4" />}
                            </button>
                          )}
                          {t.status === 'SUSPENDED' && (
                            <button onClick={() => handleAction(t.id, 'activate')} disabled={acting === t.id}
                              className="p-1 text-slate-400 hover:text-wire-green transition-colors" title="Activate">
                              {acting === t.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />}
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
