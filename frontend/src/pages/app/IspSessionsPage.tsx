import { useState, useEffect, useCallback } from 'react';
import { Activity, LogOut, Trash2, AlertCircle, Loader2 } from 'lucide-react';
import ispApi from '../../services/ispApi';

interface Session {
  id: string;
  username: string;
  ipAddress: string;
  macAddress: string;
  loginTime: string;
  status: string;
  router?: { name: string };
  voucher?: { plan?: { name: string } };
}

export function IspSessionsPage() {
  const [data, setData] = useState<{ sessions: Session[]; total: number; totalPages: number } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [page, setPage] = useState(1);
  const [disconnecting, setDisconnecting] = useState<string | null>(null);

  const load = useCallback(() => {
    setLoading(true);
    ispApi.get(`/isp/sessions?page=${page}&limit=50`)
      .then(r => setData(r.data.data))
      .catch(() => setError('Failed to load sessions.'))
      .finally(() => setLoading(false));
  }, [page]);

  useEffect(() => { load(); }, [load]);

  const handleDisconnect = async (username: string) => {
    if (!confirm(`Disconnect user '${username}'?`)) return;
    setDisconnecting(username);
    try {
      await ispApi.post('/isp/sessions/disconnect', { username });
      load();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to disconnect user.');
    } finally {
      setDisconnecting(null);
    }
  };

  const handlePurge = async () => {
    if (!confirm('Purge all offline/expired/disconnected sessions?')) return;
    try {
      await ispApi.delete('/isp/sessions/purge');
      load();
    } catch {
      setError('Failed to purge sessions.');
    }
  };

  const elapsed = (loginTime: string) => {
    const ms = Date.now() - new Date(loginTime).getTime();
    const h = Math.floor(ms / 3600000);
    const m = Math.floor((ms % 3600000) / 60000);
    return h > 0 ? `${h}h ${m}m` : `${m}m`;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-navy-900">Active Sessions</h1>
          <p className="text-sm text-slate-500 mt-1">Currently connected hotspot users</p>
        </div>
        <button onClick={handlePurge}
          className="flex items-center gap-2 border border-slate-200 text-slate-600 px-4 py-2 rounded-lg text-sm hover:bg-slate-50 transition-colors">
          <Trash2 className="w-4 h-4" /> Purge Old Sessions
        </button>
      </div>

      {error && (
        <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-3 text-sm">
          <AlertCircle className="w-4 h-4 shrink-0" />{error}
          <button onClick={() => setError('')} className="ml-auto">✕</button>
        </div>
      )}

      <div className="bg-white rounded-xl border border-slate-100 overflow-hidden">
        {loading ? (
          <div className="text-center py-16 text-slate-400"><Loader2 className="w-8 h-8 animate-spin mx-auto" /></div>
        ) : !data?.sessions.length ? (
          <div className="text-center py-16">
            <Activity className="w-10 h-10 text-slate-300 mx-auto mb-3" />
            <p className="text-sm font-medium text-slate-600">No active sessions</p>
            <p className="text-xs text-slate-400 mt-1">Sessions will appear here when users connect to your hotspot.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 border-b border-slate-100">
                <tr>
                  {['User / Code', 'IP Address', 'MAC Address', 'Router', 'Plan', 'Duration', 'Actions'].map(h => (
                    <th key={h} className="text-left text-xs font-medium text-slate-500 uppercase tracking-wide px-4 py-3">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {data.sessions.map(s => (
                  <tr key={s.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-4 py-3">
                      <p className="font-mono font-semibold text-navy-900">{s.username}</p>
                      <span className="text-xs bg-green-50 text-green-700 px-1.5 py-0.5 rounded-full">{s.status}</span>
                    </td>
                    <td className="px-4 py-3 text-slate-600 font-mono text-xs">{s.ipAddress}</td>
                    <td className="px-4 py-3 text-slate-500 font-mono text-xs">{s.macAddress}</td>
                    <td className="px-4 py-3 text-slate-600">{s.router?.name || '—'}</td>
                    <td className="px-4 py-3 text-slate-600">{s.voucher?.plan?.name || '—'}</td>
                    <td className="px-4 py-3 text-slate-500 text-xs">{elapsed(s.loginTime)}</td>
                    <td className="px-4 py-3">
                      <button onClick={() => handleDisconnect(s.username)} disabled={disconnecting === s.username}
                        className="flex items-center gap-1 text-xs text-red-500 hover:text-red-700 transition-colors disabled:opacity-50">
                        {disconnecting === s.username ? <Loader2 className="w-3 h-3 animate-spin" /> : <LogOut className="w-3 h-3" />}
                        Disconnect
                      </button>
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
