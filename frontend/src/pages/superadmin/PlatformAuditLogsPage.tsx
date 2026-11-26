import { useState, useEffect } from 'react';
import { FileText, AlertCircle, Loader2, Search } from 'lucide-react';
import platformApi from '../../services/platformApi';

interface AuditLog {
  id: string;
  action: string;
  module: string;
  description: string;
  ipAddress?: string;
  createdAt: string;
  admin?: { fullName: string; email: string };
}

export function PlatformAuditLogsPage() {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');

  useEffect(() => {
    platformApi.get('/platform/audit-logs?limit=100')
      .then(r => setLogs(r.data.data || []))
      .catch(() => setError('Failed to load audit logs.'))
      .finally(() => setLoading(false));
  }, []);

  const filtered = logs.filter(l =>
    !search ||
    l.action.toLowerCase().includes(search.toLowerCase()) ||
    l.description.toLowerCase().includes(search.toLowerCase()) ||
    l.module.toLowerCase().includes(search.toLowerCase())
  );

  const MODULE_COLORS: Record<string, string> = {
    SYSTEM: 'bg-slate-100 text-slate-600',
    ROUTER: 'bg-blue-50 text-wire-blue',
    SETTINGS: 'bg-orange-50 text-wire-orange',
    AUTH: 'bg-green-50 text-wire-green',
    PLATFORM: 'bg-purple-50 text-purple-600',
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-navy-900">Audit Logs</h1>
          <p className="text-sm text-slate-500 mt-1">Platform-wide activity and administration log</p>
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search logs…"
            className="pl-9 pr-4 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-wire-blue/30 focus:border-wire-blue" />
        </div>
      </div>

      {error && (
        <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-3 text-sm">
          <AlertCircle className="w-4 h-4 shrink-0" />{error}
        </div>
      )}

      <div className="bg-white rounded-xl border border-slate-100 overflow-hidden">
        {loading ? (
          <div className="text-center py-16 text-slate-400"><Loader2 className="w-8 h-8 animate-spin mx-auto" /></div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16">
            <FileText className="w-10 h-10 text-slate-300 mx-auto mb-3" />
            <p className="text-sm font-medium text-slate-600">No audit logs found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 border-b border-slate-100">
                <tr>
                  {['Time', 'Action', 'Module', 'Description', 'IP'].map(h => (
                    <th key={h} className="text-left text-xs font-medium text-slate-500 uppercase tracking-wide px-4 py-3">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {filtered.map(log => (
                  <tr key={log.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-4 py-3 text-xs text-slate-400 whitespace-nowrap">{new Date(log.createdAt).toLocaleString()}</td>
                    <td className="px-4 py-3 font-medium text-navy-900">{log.action}</td>
                    <td className="px-4 py-3">
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${MODULE_COLORS[log.module] || 'bg-slate-100 text-slate-600'}`}>
                        {log.module}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-slate-500 text-xs max-w-xs truncate">{log.description}</td>
                    <td className="px-4 py-3 text-slate-400 text-xs font-mono">{log.ipAddress || '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
