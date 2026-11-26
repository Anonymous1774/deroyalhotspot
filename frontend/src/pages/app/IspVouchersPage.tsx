import { useState, useEffect, useCallback } from 'react';
import { Plus, Ticket, Download, Trash2, Ban, AlertCircle, Loader2, Search } from 'lucide-react';
import ispApi from '../../services/ispApi';

interface Voucher {
  id: string;
  code: string;
  status: string;
  createdAt: string;
  activatedAt?: string;
  expiresAt?: string;
  activatedMac?: string;
  plan?: { name: string; price: number };
  router?: { name: string };
}

interface Plan { id: string; name: string; }

const STATUS_PILL: Record<string, string> = {
  UNUSED: 'bg-slate-100 text-slate-600',
  ACTIVE: 'bg-green-50 text-green-700',
  EXPIRED: 'bg-orange-50 text-orange-600',
  DISABLED: 'bg-red-50 text-red-600',
};

export function IspVouchersPage() {
  const [data, setData] = useState<{ vouchers: Voucher[]; total: number; totalPages: number } | null>(null);
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState({ status: 'All', planId: 'All', search: '' });
  const [showGenForm, setShowGenForm] = useState(false);
  const [genForm, setGenForm] = useState({ planId: '', count: 10, routerId: '' });
  const [generating, setGenerating] = useState(false);

  const load = useCallback(() => {
    setLoading(true);
    const params = new URLSearchParams({
      page: String(page), limit: '50',
      ...(filters.status !== 'All' && { status: filters.status }),
      ...(filters.planId !== 'All' && { planId: filters.planId }),
      ...(filters.search && { search: filters.search }),
    });
    ispApi.get(`/isp/vouchers?${params}`)
      .then(r => setData(r.data.data))
      .catch(() => setError('Failed to load vouchers.'))
      .finally(() => setLoading(false));
  }, [page, filters]);

  useEffect(() => {
    ispApi.get('/isp/plans').then(r => setPlans(r.data.data || []));
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    setGenerating(true);
    try {
      await ispApi.post('/isp/vouchers/generate', genForm);
      setShowGenForm(false);
      load();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to generate vouchers.');
    } finally {
      setGenerating(false);
    }
  };

  const handleDisable = async (id: string) => {
    try {
      await ispApi.put(`/isp/vouchers/${id}/disable`);
      load();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to disable voucher.');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this voucher?')) return;
    try {
      await ispApi.delete(`/isp/vouchers/${id}`);
      load();
    } catch {
      setError('Failed to delete voucher.');
    }
  };

  const exportCSV = () => {
    const rows = data?.vouchers.map(v =>
      [v.code, v.status, v.plan?.name || '', v.router?.name || '', v.activatedAt || '', v.expiresAt || ''].join(',')
    ) || [];
    const csv = ['Code,Status,Plan,Router,Activated,Expires', ...rows].join('\n');
    const a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv' }));
    a.download = `vouchers-${Date.now()}.csv`;
    a.click();
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-navy-900">Vouchers</h1>
          <p className="text-sm text-slate-500 mt-1">Generate and manage internet access codes</p>
        </div>
        <div className="flex gap-2">
          <button onClick={exportCSV}
            className="flex items-center gap-2 border border-slate-200 text-slate-600 px-4 py-2 rounded-lg text-sm hover:bg-slate-50 transition-colors">
            <Download className="w-4 h-4" /> Export CSV
          </button>
          <button onClick={() => setShowGenForm(true)}
            className="flex items-center gap-2 bg-wire-orange text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-wire-orange/90 transition-colors">
            <Plus className="w-4 h-4" /> Generate Vouchers
          </button>
        </div>
      </div>

      {error && (
        <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-3 text-sm">
          <AlertCircle className="w-4 h-4 shrink-0" />{error}
          <button onClick={() => setError('')} className="ml-auto">✕</button>
        </div>
      )}

      {showGenForm && (
        <form onSubmit={handleGenerate} className="bg-white rounded-xl border border-slate-200 p-6 space-y-4">
          <h2 className="font-semibold text-navy-900">Generate Vouchers</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Internet Plan *</label>
              <select required value={genForm.planId} onChange={e => setGenForm(p => ({ ...p, planId: e.target.value }))}
                className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-wire-blue/30 focus:border-wire-blue">
                <option value="">Select plan…</option>
                {plans.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Quantity *</label>
              <input required type="number" min="1" max="500" value={genForm.count}
                onChange={e => setGenForm(p => ({ ...p, count: Number(e.target.value) }))}
                className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-wire-blue/30 focus:border-wire-blue" />
            </div>
          </div>
          <div className="flex gap-3">
            <button type="submit" disabled={generating}
              className="flex items-center gap-2 bg-navy-900 text-white px-5 py-2 rounded-lg text-sm font-medium hover:bg-navy-800 disabled:opacity-50 transition-colors">
              {generating && <Loader2 className="w-4 h-4 animate-spin" />}
              Generate
            </button>
            <button type="button" onClick={() => setShowGenForm(false)}
              className="px-5 py-2 rounded-lg text-sm font-medium border border-slate-200 hover:bg-slate-50 transition-colors">Cancel</button>
          </div>
        </form>
      )}

      {/* Filters */}
      <div className="flex flex-wrap gap-3 bg-white rounded-xl border border-slate-100 p-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input value={filters.search} onChange={e => { setFilters(f => ({ ...f, search: e.target.value })); setPage(1); }}
            placeholder="Search code…"
            className="pl-9 pr-4 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-wire-blue/30 focus:border-wire-blue" />
        </div>
        {[{ key: 'status', label: 'Status', opts: ['All', 'UNUSED', 'ACTIVE', 'EXPIRED', 'DISABLED'] },
          { key: 'planId', label: 'Plan', opts: [{ value: 'All', label: 'All Plans' }, ...plans.map(p => ({ value: p.id, label: p.name }))] as any }
        ].map(f => (
          <select key={f.key} value={(filters as any)[f.key]}
            onChange={e => { setFilters(p => ({ ...p, [f.key]: e.target.value })); setPage(1); }}
            className="text-sm border border-slate-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-wire-blue/30 focus:border-wire-blue">
            {f.opts.map((o: any) =>
              typeof o === 'string' ? <option key={o} value={o}>{o}</option>
                : <option key={o.value} value={o.value}>{o.label}</option>
            )}
          </select>
        ))}
        <div className="ml-auto text-xs text-slate-500 self-center">
          {data?.total ?? 0} total
        </div>
      </div>

      {/* Voucher Table */}
      <div className="bg-white rounded-xl border border-slate-100 overflow-hidden">
        {loading ? (
          <div className="text-center py-16 text-slate-400"><Loader2 className="w-8 h-8 animate-spin mx-auto" /></div>
        ) : !data?.vouchers.length ? (
          <div className="text-center py-16">
            <Ticket className="w-10 h-10 text-slate-300 mx-auto mb-3" />
            <p className="text-sm font-medium text-slate-600">No vouchers found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 border-b border-slate-100">
                <tr>
                  {['Code', 'Status', 'Plan', 'Activated', 'Expires', 'Actions'].map(h => (
                    <th key={h} className="text-left text-xs font-medium text-slate-500 uppercase tracking-wide px-4 py-3">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {data.vouchers.map(v => (
                  <tr key={v.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-4 py-3 font-mono font-semibold text-navy-900 tracking-wider">{v.code}</td>
                    <td className="px-4 py-3">
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${STATUS_PILL[v.status] || ''}`}>{v.status}</span>
                    </td>
                    <td className="px-4 py-3 text-slate-600">{v.plan?.name || '—'}</td>
                    <td className="px-4 py-3 text-slate-500 text-xs">{v.activatedAt ? new Date(v.activatedAt).toLocaleString() : '—'}</td>
                    <td className="px-4 py-3 text-slate-500 text-xs">{v.expiresAt ? new Date(v.expiresAt).toLocaleString() : '—'}</td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2">
                        {v.status !== 'DISABLED' && v.status !== 'EXPIRED' && (
                          <button onClick={() => handleDisable(v.id)}
                            className="p-1 text-slate-400 hover:text-amber-500 transition-colors" title="Disable">
                            <Ban className="w-4 h-4" />
                          </button>
                        )}
                        <button onClick={() => handleDelete(v.id)}
                          className="p-1 text-slate-400 hover:text-red-500 transition-colors" title="Delete">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        {data && data.totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-slate-100">
            <button disabled={page <= 1} onClick={() => setPage(p => p - 1)}
              className="px-3 py-1.5 text-xs border border-slate-200 rounded-lg disabled:opacity-40 hover:bg-slate-50 transition-colors">← Prev</button>
            <span className="text-xs text-slate-500">Page {page} of {data.totalPages}</span>
            <button disabled={page >= data.totalPages} onClick={() => setPage(p => p + 1)}
              className="px-3 py-1.5 text-xs border border-slate-200 rounded-lg disabled:opacity-40 hover:bg-slate-50 transition-colors">Next →</button>
          </div>
        )}
      </div>
    </div>
  );
}
