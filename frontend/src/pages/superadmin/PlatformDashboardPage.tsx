import { useState, useEffect } from 'react';
import { Building2, Users, Server, TrendingUp, Activity, AlertCircle, Loader2 } from 'lucide-react';
import platformApi from '../../services/platformApi';
import { usePlatformAuth } from '../../contexts/platform/PlatformAuthContext';

interface PlatformStats {
  totalTenants: number;
  activeTenants: number;
  trialTenants: number;
  suspendedTenants: number;
  totalRouters: number;
  totalVouchers: number;
  totalUsers: number;
}

export function PlatformDashboardPage() {
  const { admin } = usePlatformAuth();
  const [stats, setStats] = useState<PlatformStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    platformApi.get('/platform/stats')
      .then(r => setStats(r.data.data))
      .catch(() => setError('Failed to load platform statistics.'))
      .finally(() => setLoading(false));
  }, []);

  const statCards = stats ? [
    { label: 'Total ISPs',    value: stats.totalTenants,    icon: Building2,    color: 'wire-orange' },
    { label: 'Active ISPs',   value: stats.activeTenants,   icon: Activity,     color: 'wire-green' },
    { label: 'On Trial',      value: stats.trialTenants,    icon: TrendingUp,   color: 'wire-blue' },
    { label: 'Suspended',     value: stats.suspendedTenants, icon: AlertCircle, color: 'wire-brown' },
    { label: 'Total Routers', value: stats.totalRouters,    icon: Server,       color: 'wire-orange' },
    { label: 'Total Users',   value: stats.totalUsers,      icon: Users,        color: 'wire-green' },
  ] : [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-navy-900">Platform Overview</h1>
        <p className="text-sm text-slate-500 mt-1">Welcome, {admin?.fullName}. DHOS Super Admin.</p>
      </div>

      {error && (
        <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-3 text-sm">
          <AlertCircle className="w-4 h-4 shrink-0" />{error}
        </div>
      )}

      {loading ? (
        <div className="text-center py-16 text-slate-400"><Loader2 className="w-8 h-8 animate-spin mx-auto" /></div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {statCards.map(card => (
            <div key={card.label} className="bg-white rounded-xl border border-slate-100 p-5">
              <div className="flex items-start justify-between mb-3">
                <span className="text-xs font-medium text-slate-500 uppercase tracking-wide">{card.label}</span>
                <card.icon className={`w-4 h-4 text-${card.color} opacity-70`} />
              </div>
              <p className="text-2xl font-bold text-navy-900">{card.value}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
