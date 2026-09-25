import React, { useState, useEffect } from 'react';
import { LogOut, RefreshCw, Smartphone, Globe, Server } from 'lucide-react';
import api from '../services/api';
import { HotspotSession, RouterItem } from '../types';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { useToast } from '../contexts/ToastContext';
import { SEOHead } from '../components/SEOHead';

export const SessionsPage: React.FC = () => {
  const [sessions, setSessions] = useState<HotspotSession[]>([]);
  const [routers, setRouters] = useState<RouterItem[]>([]);
  const [routerFilter, setRouterFilter] = useState('');
  const [loading, setLoading] = useState(true);

  const { showToast } = useToast();

  const fetchRouters = async () => {
    try {
      const res = await api.get('/routers');
      if (res.data && res.data.success) {
        setRouters(res.data.data || []);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const fetchSessions = async () => {
    setLoading(true);
    try {
      const params: any = {};
      if (routerFilter) params.routerId = routerFilter;

      const res = await api.get('/hotspot/sessions', { params });
      if (res.data && res.data.success) {
        setSessions(res.data.data.sessions || []);
      }
    } catch (err) {
      console.error(err);
      showToast('Error Loading Sessions', 'Failed to retrieve active sessions.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRouters();
  }, []);

  useEffect(() => {
    fetchSessions();
  }, [routerFilter]);

  const handleDisconnect = async (username: string) => {
    try {
      const res = await api.post('/hotspot/disconnect', { username });
      if (res.data && res.data.success) {
        showToast('Session Terminated', `Hotspot user '${username}' disconnected.`, 'success');
        fetchSessions();
      }
    } catch (err: any) {
      console.error(err);
      showToast('Disconnect Failed', err.response?.data?.message || 'Failed to disconnect session.', 'error');
    }
  };

  const getSessionBadge = (status: string) => {
    switch (status) {
      case 'ONLINE': return <Badge variant="success">ONLINE</Badge>;
      case 'OFFLINE': return <Badge variant="neutral">OFFLINE</Badge>;
      case 'EXPIRED': return <Badge variant="warning">EXPIRED</Badge>;
      case 'DISCONNECTED': default: return <Badge variant="danger">DISCONNECTED</Badge>;
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <SEOHead 
        title="Active User Sessions | DeRoyal Hotspot OS"
        description="Monitor active connected Wi-Fi users, MAC/IP bindings, and live disconnect tools for DeRoyal Hotspot OS."
        canonicalPath="/admin/sessions"
      />

      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Active Hotspot Sessions
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Real-time connected customer MAC & IP tracking across MikroTik gateways
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
          <select
            value={routerFilter}
            onChange={(e) => setRouterFilter(e.target.value)}
            className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl py-2 px-3 text-xs text-slate-700 dark:text-slate-300 font-semibold"
          >
            <option value="">All Router Gateways</option>
            {routers.map((r) => (
              <option key={r.id} value={r.id}>{r.name} ({r.host})</option>
            ))}
          </select>

          <button
            onClick={fetchSessions}
            className="min-h-[44px] px-4 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold text-xs rounded-xl flex items-center gap-2 transition-colors"
          >
            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
            <span>Refresh Sessions</span>
          </button>
        </div>
      </div>

      {/* Sessions Table */}
      <Card className="p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-800/80 text-slate-500 uppercase font-bold tracking-wider border-b border-slate-200 dark:border-slate-800">
              <tr>
                <th className="p-4">Voucher / User</th>
                <th className="p-4">Router Gateway</th>
                <th className="p-4">IP Address</th>
                <th className="p-4">MAC Address</th>
                <th className="p-4">Login Time</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-medium">
              {loading ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-slate-400">Loading active sessions...</td>
                </tr>
              ) : sessions.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-slate-400">No active sessions currently connected.</td>
                </tr>
              ) : (
                sessions.map((s) => (
                  <tr key={s.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40 transition-colors">
                    <td className="p-4 font-mono font-bold text-slate-900 dark:text-white text-sm">
                      {s.username}
                      {s.voucher?.plan?.name && (
                        <span className="block text-[11px] font-sans font-normal text-slate-400">
                          {s.voucher.plan.name}
                        </span>
                      )}
                    </td>
                    <td className="p-4 text-slate-700 dark:text-slate-300">
                      <div className="flex items-center gap-1.5 font-semibold">
                        <Server size={13} className="text-blue-500" />
                        <span>{s.router?.name || 'Primary Router'}</span>
                      </div>
                    </td>
                    <td className="p-4 font-mono text-slate-700 dark:text-slate-300">
                      <div className="flex items-center gap-1.5">
                        <Globe size={13} className="text-slate-400" />
                        <span>{s.ipAddress}</span>
                      </div>
                    </td>
                    <td className="p-4 font-mono text-slate-700 dark:text-slate-300">
                      <div className="flex items-center gap-1.5">
                        <Smartphone size={13} className="text-slate-400" />
                        <span>{s.macAddress}</span>
                      </div>
                    </td>
                    <td className="p-4 text-slate-500">
                      {s.loginTime ? new Date(s.loginTime).toLocaleString() : '-'}
                    </td>
                    <td className="p-4">{getSessionBadge(s.status)}</td>
                    <td className="p-4 text-right">
                      {s.status === 'ONLINE' && (
                        <button
                          onClick={() => handleDisconnect(s.username)}
                          aria-label={`Disconnect ${s.username}`}
                          title="Disconnect Session"
                          className="min-h-[44px] min-w-[44px] inline-flex items-center justify-center text-xs font-semibold text-red-500 hover:bg-red-500/10 rounded-xl transition-colors"
                        >
                          <LogOut size={16} />
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};
