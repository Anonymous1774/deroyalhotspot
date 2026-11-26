import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Wifi, Server, Ticket, Activity, TrendingUp,
  ArrowUpRight, AlertCircle, CheckCircle, Clock
} from 'lucide-react';
import ispApi from '../../services/ispApi';
import { useIspAuth } from '../../contexts/isp/IspAuthContext';

interface DashboardStats {
  plansCount: number;
  activeVouchersCount: number;
  unusedVouchersCount: number;
  onlineUsersCount: number;
  totalIncome: number;
  totalRouters: number;
  onlineRoutersCount: number;
  offlineRoutersCount: number;
  dataUsage: { formatted: string };
  recentActivity: any[];
  routersSummary: any[];
  hourlyTrend: any[];
}

export function IspDashboardPage() {
  const { tenant } = useIspAuth();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    ispApi.get('/isp/dashboard/stats')
      .then(r => setStats(r.data.data))
      .catch(() => setError('Failed to load dashboard statistics.'))
      .finally(() => setLoading(false));
  }, []);

  const statCards = stats ? [
    { label: 'Active Plans', value: stats.plansCount, icon: Ticket, color: 'wire-orange', to: '/plans' },
    { label: 'Online Users', value: stats.onlineUsersCount, icon: Wifi, color: 'wire-green', to: '/sessions' },
    { label: 'Active Vouchers', value: stats.activeVouchersCount, icon: CheckCircle, color: 'wire-blue', to: '/vouchers' },
    { label: 'Unused Vouchers', value: stats.unusedVouchersCount, icon: Clock, color: 'wire-brown', to: '/vouchers' },
    { label: 'Total Routers', value: stats.totalRouters, icon: Server, color: 'wire-orange', to: '/routers' },
    { label: 'Revenue (₦)', value: `₦${stats.totalIncome.toLocaleString()}`, icon: TrendingUp, color: 'wire-green', to: '/analytics' },
  ] : [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-navy-900">Dashboard</h1>
        <p className="text-sm text-slate-500 mt-1">
          Welcome back, {tenant?.businessName || 'your business'}
        </p>
      </div>

      {error && (
        <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-3 text-sm">
          <AlertCircle className="w-4 h-4 shrink-0" />
          {error}
        </div>
      )}

      {/* Stats Grid */}
      {loading ? (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="bg-white rounded-xl border border-slate-100 p-5 animate-pulse">
              <div className="h-4 bg-slate-100 rounded w-24 mb-3" />
              <div className="h-8 bg-slate-100 rounded w-16" />
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {statCards.map((card) => (
            <Link key={card.label} to={card.to}
              className="bg-white rounded-xl border border-slate-100 p-5 hover:border-slate-200 hover:shadow-sm transition-all group">
              <div className="flex items-start justify-between mb-3">
                <span className="text-xs font-medium text-slate-500 uppercase tracking-wide">{card.label}</span>
                <card.icon className={`w-4 h-4 text-${card.color} opacity-70`} />
              </div>
              <p className="text-2xl font-bold text-navy-900">{card.value}</p>
              <div className="mt-2 flex items-center gap-1 text-xs text-slate-400 group-hover:text-wire-blue transition-colors">
                <span>View details</span>
                <ArrowUpRight className="w-3 h-3" />
              </div>
            </Link>
          ))}
        </div>
      )}

      {/* Router Health */}
      {stats && stats.routersSummary.length > 0 && (
        <div className="bg-white rounded-xl border border-slate-100 p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-navy-900">Router Status</h2>
            <Link to="/routers" className="text-xs text-wire-blue hover:underline">Manage routers</Link>
          </div>
          <div className="space-y-3">
            {stats.routersSummary.map((router: any) => (
              <div key={router.id} className="flex items-center justify-between py-2 border-b border-slate-50 last:border-0">
                <div className="flex items-center gap-3">
                  <div className={`w-2 h-2 rounded-full ${router.status === 'ONLINE' ? 'bg-wire-green' : router.status === 'OFFLINE' ? 'bg-red-400' : 'bg-amber-400'}`} />
                  <div>
                    <p className="text-sm font-medium text-navy-900">{router.name}</p>
                    <p className="text-xs text-slate-400">{router.host}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xs font-medium text-slate-600">{router._count?.hotspotSessions ?? 0} online</p>
                  <p className={`text-xs capitalize ${router.status === 'ONLINE' ? 'text-wire-green' : 'text-slate-400'}`}>{router.status?.toLowerCase()}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recent Activity */}
      {stats && stats.recentActivity.length > 0 && (
        <div className="bg-white rounded-xl border border-slate-100 p-5">
          <h2 className="font-semibold text-navy-900 mb-4">Recent Activity</h2>
          <div className="space-y-3">
            {stats.recentActivity.map((log: any) => (
              <div key={log.id} className="flex items-start gap-3 text-sm">
                <Activity className="w-4 h-4 text-wire-blue mt-0.5 shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-navy-800 truncate">{log.action}</p>
                  <p className="text-xs text-slate-400 truncate">{log.description}</p>
                </div>
                <span className="text-xs text-slate-400 shrink-0">
                  {new Date(log.createdAt).toLocaleDateString()}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
