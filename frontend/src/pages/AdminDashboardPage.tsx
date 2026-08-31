import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Users, 
  FileSpreadsheet, 
  DollarSign, 
  Activity, 
  Cpu, 
  RefreshCw, 
  ChevronRight,
  Wifi,
  History
} from 'lucide-react';
import api from '../services/api';
import { DashboardStats, RouterTelemetry } from '../types';
import { Badge } from '../components/ui/Badge';
import { Card } from '../components/ui/Card';
import { useToast } from '../contexts/ToastContext';

import { SEOHead } from '../components/SEOHead';

export const AdminDashboardPage: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loadingStats, setLoadingStats] = useState(true);
  const [routerStatus, setRouterStatus] = useState<RouterTelemetry | null>(null);
  const [loadingRouter, setLoadingRouter] = useState(true);

  const { showToast } = useToast();

  const fetchDashboardData = async () => {
    setLoadingStats(true);
    try {
      const res = await api.get('/dashboard/stats');
      if (res.data && res.data.success) {
        setStats(res.data.data);
      }
    } catch (err) {
      console.error('Failed to load dashboard stats:', err);
    } finally {
      setLoadingStats(false);
    }
  };

  const fetchRouterStatus = async () => {
    setLoadingRouter(true);
    try {
      const res = await api.get('/router/status');
      if (res.data && res.data.success) {
        setRouterStatus(res.data.data);
      }
    } catch (err) {
      console.error('Failed to fetch router status:', err);
    } finally {
      setLoadingRouter(false);
    }
  };


  const handleRefresh = async () => {
    await Promise.all([fetchDashboardData(), fetchRouterStatus()]);
    showToast('Telemetry Updated', 'Dashboard analytics & router status refreshed.', 'info');
  };

  useEffect(() => {
    fetchDashboardData();
    fetchRouterStatus();
  }, []);

  const getStatusBadge = () => {
    if (loadingRouter) {
      return (
        <Badge variant="neutral">
          <div className="w-3 h-3 rounded-full border-2 border-slate-500 border-t-transparent animate-spin" />
          <span>Connecting Router...</span>
        </Badge>
      );
    }

    if (!routerStatus || routerStatus.status === 'OFFLINE') {
      return (
        <Badge variant="danger">
          <span className="w-2 h-2 rounded-full bg-red-500" />
          <span>Router Offline</span>
        </Badge>
      );
    }

    if (routerStatus.status === 'SIMULATED') {
      return (
        <Badge variant="simulated">
          <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
          <span>Simulated Mode</span>
        </Badge>
      );
    }

    return (
      <Badge variant="success">
        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
        <span>Router Online</span>
      </Badge>
    );
  };

  const getModuleBadgeColor = (moduleName: string) => {
    switch (moduleName.toUpperCase()) {
      case 'ROUTER': return 'warning';
      case 'VOUCHER': return 'info';
      case 'SYSTEM': return 'danger';
      case 'SETTINGS': return 'warning';
      default: return 'neutral';
    }
  };

  // Mock hourly activity data for visual SVG chart
  const trendData = [
    { hour: '00:00', users: 12, traffic: 45 },
    { hour: '04:00', users: 5, traffic: 18 },
    { hour: '08:00', users: 34, traffic: 120 },
    { hour: '12:00', users: 68, traffic: 340 },
    { hour: '16:00', users: 85, traffic: 490 },
    { hour: '20:00', users: 92, traffic: 560 },
    { hour: '23:59', users: 44, traffic: 280 }
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      <SEOHead 
        title="Dashboard Overview | DeRoyal Hotspot OS"
        description="Real-time network telemetry, router status, connected users, and revenue monitoring for DeRoyal Hotspot OS."
        canonicalPath="/admin"
      />

      {/* Top Banner Bar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            System Telemetry Overview
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Real-time Monitoring & Hotspot Analytics
          </p>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
          {getStatusBadge()}
          <button
            onClick={handleRefresh}
            aria-label="Refresh dashboard data"
            className="min-h-[44px] min-w-[44px] px-3.5 flex items-center justify-center gap-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700 text-xs font-bold transition-colors"
          >
            <RefreshCw size={14} className={loadingStats || loadingRouter ? 'animate-spin' : ''} />
            <span className="hidden sm:inline">Refresh</span>
          </button>
        </div>
      </div>

      {/* Primary Metrics Grid (5 Stat Cards) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* Metric 1: Total Income */}
        <Card hoverEffect className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Total Income
            </span>
            <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-500">
              <DollarSign size={18} />
            </div>
          </div>
          <div>
            <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
              {loadingStats ? '...' : `₦${(stats?.totalIncome || 0).toLocaleString()}`}
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Revenue from active/used plans</p>
          </div>
        </Card>

        {/* Metric 2: Online Users */}
        <Card hoverEffect className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Online Users
            </span>
            <div className="p-2.5 rounded-xl bg-blue-500/10 text-blue-500">
              <Users size={18} />
            </div>
          </div>
          <div>
            <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
              {loadingStats ? '...' : (stats?.onlineUsersCount ?? 0)}
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Active internet sessions</p>
          </div>
        </Card>

        {/* Metric 3: Active Vouchers */}
        <Card hoverEffect className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Active Vouchers
            </span>
            <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-500">
              <FileSpreadsheet size={18} />
            </div>
          </div>
          <div>
            <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
              {loadingStats ? '...' : (stats?.activeVouchersCount ?? 0)}
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Vouchers currently active</p>
          </div>
        </Card>

        {/* Metric 4: Unused Vouchers */}
        <Card hoverEffect className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Unused Vouchers
            </span>
            <div className="p-2.5 rounded-xl bg-purple-500/10 text-purple-500">
              <FileSpreadsheet size={18} />
            </div>
          </div>
          <div>
            <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
              {loadingStats ? '...' : (stats?.unusedVouchersCount ?? 0)}
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Ready for print or sale</p>
          </div>
        </Card>

        {/* Metric 5: Total Plans */}
        <Card hoverEffect className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Total Plans
            </span>
            <div className="p-2.5 rounded-xl bg-indigo-500/10 text-indigo-500">
              <Wifi size={18} />
            </div>
          </div>
          <div>
            <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
              {loadingStats ? '...' : (stats?.plansCount ?? 0)}
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Configured pricing tiers</p>
          </div>
        </Card>
      </div>

      {/* Visual Analytics Chart & System Telemetry Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Interactive SVG Trend Chart */}
        <Card className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Activity size={18} className="text-blue-500" />
                <span>Bandwidth & Active User Trends</span>
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">24-hour network activity visualization</p>
            </div>
            <div className="flex items-center gap-2 text-xs font-semibold">
              <span className="flex items-center gap-1 text-blue-500">
                <span className="w-2.5 h-2.5 rounded-full bg-blue-500 inline-block" /> Traffic (MB)
              </span>
              <span className="flex items-center gap-1 text-emerald-500">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block" /> Users
              </span>
            </div>
          </div>

          {/* SVG Line Chart Graphic */}
          <div className="pt-4">
            <div className="h-52 w-full relative flex items-end justify-between gap-2 border-b border-slate-200 dark:border-slate-800 pb-2">
              {trendData.map((d, i) => {
                const heightPercent = Math.min(100, Math.max(15, (d.traffic / 600) * 100));
                return (
                  <div key={i} className="flex-1 flex flex-col items-center gap-2 h-full justify-end group">
                    <div className="w-full max-w-[28px] bg-slate-100 dark:bg-slate-800 rounded-t-lg relative overflow-hidden flex items-end h-full">
                      <div
                        style={{ height: `${heightPercent}%` }}
                        className="w-full bg-gradient-to-t from-blue-600 to-blue-400 rounded-t-lg transition-all duration-500 group-hover:from-blue-500 group-hover:to-blue-300"
                      />
                    </div>
                    <span className="text-[10px] text-slate-400 font-mono">{d.hour}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </Card>

        {/* Hardware Resource Telemetry Progress Gauges & Quick Ops */}
        <div className="space-y-6">
          <Card className="space-y-4">
            <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Cpu size={18} className="text-purple-500" />
              <span>Hardware Telemetry</span>
            </h3>

            {/* CPU Gauge */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs font-semibold">
                <span className="text-slate-500 dark:text-slate-400">CPU Load</span>
                <span className="text-slate-900 dark:text-white font-mono">{routerStatus?.cpuUsage ?? 0}%</span>
              </div>
              <div className="h-2.5 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                <div
                  style={{ width: `${routerStatus?.cpuUsage ?? 0}%` }}
                  className={`h-full rounded-full transition-all duration-300 ${
                    (routerStatus?.cpuUsage ?? 0) > 80 ? 'bg-red-500' : (routerStatus?.cpuUsage ?? 0) > 50 ? 'bg-amber-500' : 'bg-blue-500'
                  }`}
                />
              </div>
            </div>

            {/* Memory Gauge */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs font-semibold">
                <span className="text-slate-500 dark:text-slate-400">Memory Usage</span>
                <span className="text-slate-900 dark:text-white font-mono">{routerStatus?.memoryUsage ?? 0}%</span>
              </div>
              <div className="h-2.5 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                <div
                  style={{ width: `${routerStatus?.memoryUsage ?? 0}%` }}
                  className="h-full bg-purple-500 rounded-full transition-all duration-300"
                />
              </div>
            </div>

            {/* RouterOS Details */}
            <div className="pt-2 border-t border-slate-200 dark:border-slate-800 space-y-1.5 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-500">Device Identity:</span>
                <span className="font-bold text-slate-800 dark:text-slate-200">{routerStatus?.identity || 'MikroTik'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Uptime:</span>
                <span className="font-bold text-slate-800 dark:text-slate-200">{routerStatus?.uptime || '-'}</span>
              </div>
            </div>
          </Card>

          {/* Quick Operations Links */}
          <Card className="space-y-3">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">Quick Operations</h3>
            <div className="space-y-2">
              <Link
                to="/admin/vouchers"
                className="w-full bg-blue-600 hover:bg-blue-500 text-white py-2.5 px-3.5 rounded-xl text-xs font-bold transition-all flex items-center justify-between min-h-[44px]"
              >
                <span>Generate Vouchers</span>
                <ChevronRight size={16} />
              </Link>
              <Link
                to="/admin/plans"
                className="w-full bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 py-2.5 px-3.5 rounded-xl text-xs font-bold transition-all flex items-center justify-between min-h-[44px]"
              >
                <span>Create New Plan</span>
                <ChevronRight size={16} />
              </Link>
            </div>
          </Card>
        </div>
      </div>

      {/* Recent System Activity Feed */}
      <Card className="space-y-4">
        <div className="flex justify-between items-center pb-2 border-b border-slate-100 dark:border-slate-800">
          <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <History size={18} className="text-blue-500" />
            <span>Recent System Activity</span>
          </h3>
          <Link to="/admin/logs" className="text-xs text-blue-500 hover:underline font-semibold">
            View All Logs →
          </Link>
        </div>

        <div className="divide-y divide-slate-100 dark:divide-slate-800 text-xs font-medium">
          {stats?.recentActivity && stats.recentActivity.length > 0 ? (
            stats.recentActivity.map((activity) => (
              <div key={activity.id} className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <Badge variant={getModuleBadgeColor(activity.module)}>
                      {activity.module}
                    </Badge>
                    <span className="font-bold text-slate-900 dark:text-white">{activity.action}</span>
                  </div>
                  <p className="text-slate-500 dark:text-slate-400 font-normal">{activity.description}</p>
                  {activity.admin && (
                    <p className="text-[10px] text-slate-400 font-normal">
                      By: {activity.admin.fullName} ({activity.admin.email})
                    </p>
                  )}
                </div>
                <span className="text-[11px] text-slate-400 font-mono flex-shrink-0">
                  {new Date(activity.createdAt).toLocaleString()}
                </span>
              </div>
            ))
          ) : (
            <p className="py-6 text-center text-slate-400 font-normal">No recent system activity logged.</p>
          )}
        </div>
      </Card>
    </div>
  );
};
