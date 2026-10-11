import React, { useState, useEffect, useRef } from 'react';
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
  History,
  ArrowDownUp,
  Radio,
  Globe,
  Smartphone,
  LogOut,
  Search
} from 'lucide-react';
import api from '../services/api';
import { DashboardStats, RouterTelemetry, ActiveDeviceItem } from '../types';
import { Badge } from '../components/ui/Badge';
import { Card } from '../components/ui/Card';
import { useToast } from '../contexts/ToastContext';
import { SEOHead } from '../components/SEOHead';

export const AdminDashboardPage: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loadingStats, setLoadingStats] = useState(true);
  const [routerStatus, setRouterStatus] = useState<RouterTelemetry | null>(null);
  const [loadingRouter, setLoadingRouter] = useState(true);
  const [selectedRouterId, setSelectedRouterId] = useState<string>('');
  
  // Chart view mode: 'all' (both), 'traffic' (data usage MB), or 'users' (active devices)
  const [chartMode, setChartMode] = useState<'all' | 'traffic' | 'users'>('all');
  
  // Search query for live active devices table
  const [deviceSearch, setDeviceSearch] = useState('');
  
  // Auto-refresh state (every 15s)
  const [autoRefresh, setAutoRefresh] = useState(true);
  const autoRefreshTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Disconnect loading tracking
  const [disconnectingUser, setDisconnectingUser] = useState<string | null>(null);

  const { showToast } = useToast();

  const fetchDashboardData = async (silent = false) => {
    if (!silent) setLoadingStats(true);
    try {
      const params: any = {};
      if (selectedRouterId) params.routerId = selectedRouterId;

      const res = await api.get('/dashboard/stats', { params });
      if (res.data && res.data.success) {
        setStats(res.data.data);
      }
    } catch (err) {
      console.error('Failed to load dashboard stats:', err);
    } finally {
      if (!silent) setLoadingStats(false);
    }
  };

  const fetchRouterStatus = async (silent = false) => {
    if (!silent) setLoadingRouter(true);
    try {
      const res = await api.get('/router/status');
      if (res.data && res.data.success) {
        setRouterStatus(res.data.data);
      }
    } catch (err) {
      console.error('Failed to fetch router status:', err);
    } finally {
      if (!silent) setLoadingRouter(false);
    }
  };

  const handleRefresh = async () => {
    await Promise.all([fetchDashboardData(), fetchRouterStatus()]);
    showToast('Telemetry Updated', 'Dashboard analytics, active devices & router status refreshed.', 'info');
  };

  const handleDisconnectDevice = async (username: string) => {
    setDisconnectingUser(username);
    try {
      const res = await api.post('/hotspot/disconnect', { username });
      if (res.data && res.data.success) {
        showToast('Device Disconnected', `Active session for '${username}' terminated.`, 'success');
        await Promise.all([fetchDashboardData(true), fetchRouterStatus(true)]);
      }
    } catch (err: any) {
      console.error(err);
      showToast('Disconnect Failed', err.response?.data?.message || 'Failed to disconnect user.', 'error');
    } finally {
      setDisconnectingUser(null);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, [selectedRouterId]);

  useEffect(() => {
    fetchRouterStatus();
  }, []);

  // Set up auto-refresh timer (15 seconds)
  useEffect(() => {
    if (autoRefresh) {
      autoRefreshTimerRef.current = setInterval(() => {
        fetchDashboardData(true);
        fetchRouterStatus(true);
      }, 15000);
    } else if (autoRefreshTimerRef.current) {
      clearInterval(autoRefreshTimerRef.current);
      autoRefreshTimerRef.current = null;
    }

    return () => {
      if (autoRefreshTimerRef.current) {
        clearInterval(autoRefreshTimerRef.current);
      }
    };
  }, [autoRefresh, selectedRouterId]);

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

  // Trend data points from backend
  const trendData = stats?.hourlyTrend || [
    { hour: '00:00', users: 0, traffic: 0, downloadMB: 0, uploadMB: 0 },
    { hour: '04:00', users: 0, traffic: 0, downloadMB: 0, uploadMB: 0 },
    { hour: '08:00', users: 0, traffic: 0, downloadMB: 0, uploadMB: 0 },
    { hour: '12:00', users: 0, traffic: 0, downloadMB: 0, uploadMB: 0 },
    { hour: '16:00', users: 0, traffic: 0, downloadMB: 0, uploadMB: 0 },
    { hour: '20:00', users: 0, traffic: 0, downloadMB: 0, uploadMB: 0 },
    { hour: 'Now', users: 0, traffic: 0, downloadMB: 0, uploadMB: 0 }
  ];

  // Active connected devices list
  const activeDevicesList: ActiveDeviceItem[] = stats?.activeDevices || routerStatus?.activeDevices || [];

  // Filter active devices by search query
  const filteredActiveDevices = activeDevicesList.filter((d) => {
    if (!deviceSearch.trim()) return true;
    const q = deviceSearch.toLowerCase().trim();
    return (
      d.user.toLowerCase().includes(q) ||
      d.ipAddress.toLowerCase().includes(q) ||
      d.macAddress.toLowerCase().includes(q)
    );
  });

  // Calculate summary aggregates from trend data
  const peakUsers = Math.max(0, ...trendData.map((d) => d.users));
  const peakTrafficMB = Math.max(0, ...trendData.map((d) => d.traffic));
  const totalMeasuredMB = trendData.reduce((sum, d) => sum + d.traffic, 0);

  // Maximum scales for SVG chart
  const maxTrafficVal = Math.max(10, ...trendData.map((d) => d.traffic));
  const maxUsersVal = Math.max(1, ...trendData.map((d) => d.users));

  return (
    <div className="space-y-6 animate-fade-in">
      <SEOHead 
        title="Dashboard Overview | DeRoyal Hotspot OS"
        description="Real-time network telemetry, router status, connected users, and revenue monitoring for DeRoyal Hotspot OS."
        canonicalPath="/admin"
      />

      {/* Top Banner Bar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              System Telemetry Overview
            </h1>
            <span className="flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              LIVE
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Real-time Active Devices, Bandwidth Usage & Gateway Monitoring
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
          {stats?.routersSummary && stats.routersSummary.length > 0 && (
            <select
              value={selectedRouterId}
              onChange={(e) => setSelectedRouterId(e.target.value)}
              className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl py-2 px-3 text-xs text-slate-700 dark:text-slate-300 font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Router Gateways</option>
              {stats.routersSummary.map((r) => (
                <option key={r.id} value={r.id}>{r.name}</option>
              ))}
            </select>
          )}

          {/* Auto Refresh Toggle */}
          <button
            onClick={() => setAutoRefresh(!autoRefresh)}
            title={autoRefresh ? 'Auto-refresh active (every 15s)' : 'Auto-refresh paused'}
            className={`min-h-[44px] px-3 flex items-center gap-1.5 rounded-xl text-xs font-bold transition-all border ${
              autoRefresh 
                ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30' 
                : 'bg-slate-100 dark:bg-slate-800 text-slate-500 border-slate-200 dark:border-slate-700'
            }`}
          >
            <span className={`w-2 h-2 rounded-full ${autoRefresh ? 'bg-emerald-500 animate-ping' : 'bg-slate-400'}`} />
            <span className="hidden sm:inline">Auto-Sync {autoRefresh ? '15s' : 'Off'}</span>
          </button>

          {getStatusBadge()}

          <button
            onClick={handleRefresh}
            aria-label="Refresh dashboard data"
            className="min-h-[44px] min-w-[44px] px-3.5 flex items-center justify-center gap-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700 text-xs font-bold transition-colors shadow-sm"
          >
            <RefreshCw size={14} className={loadingStats || loadingRouter ? 'animate-spin' : ''} />
            <span className="hidden sm:inline">Refresh</span>
          </button>
        </div>
      </div>

      {/* Primary Metrics Grid (6 Focused Stat Cards) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {/* Metric 1: Currently Active Connected Devices */}
        <Card hoverEffect className="space-y-3 border-emerald-500/20 bg-gradient-to-br from-emerald-500/[0.03] to-transparent">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">
              Active Devices
            </span>
            <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-500">
              <Radio size={18} className="animate-pulse" />
            </div>
          </div>
          <div>
            <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
              {loadingStats ? '...' : (stats?.activeDevicesCount ?? stats?.onlineUsersCount ?? 0)}
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 flex items-center gap-1">
              <span>Using internet now</span>
              <span className="text-[10px] text-emerald-500 font-semibold">({stats?.activeVouchersCount ?? 0} paid)</span>
            </p>
          </div>
        </Card>

        {/* Metric 2: Network Data Usage */}
        <Card hoverEffect className="space-y-3 border-blue-500/20 bg-gradient-to-br from-blue-500/[0.03] to-transparent">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider">
              Data Usage
            </span>
            <div className="p-2.5 rounded-xl bg-blue-500/10 text-blue-500">
              <ArrowDownUp size={18} />
            </div>
          </div>
          <div>
            <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
              {loadingStats ? '...' : (stats?.dataUsage?.formatted || '0 MB')}
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 font-mono text-[11px]">
              ↓ {stats?.dataUsage?.downloadMB?.toLocaleString() ?? 0}M · ↑ {stats?.dataUsage?.uploadMB?.toLocaleString() ?? 0}M
            </p>
          </div>
        </Card>

        {/* Metric 3: Total Income */}
        <Card hoverEffect className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Total Revenue
            </span>
            <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-500">
              <DollarSign size={18} />
            </div>
          </div>
          <div>
            <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
              {loadingStats ? '...' : `₦${(stats?.totalIncome || 0).toLocaleString()}`}
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">From active & expired plans</p>
          </div>
        </Card>

        {/* Metric 4: Active Vouchers */}
        <Card hoverEffect className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Active Vouchers
            </span>
            <div className="p-2.5 rounded-xl bg-indigo-500/10 text-indigo-500">
              <FileSpreadsheet size={18} />
            </div>
          </div>
          <div>
            <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
              {loadingStats ? '...' : (stats?.activeVouchersCount ?? 0)}
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Paid vouchers valid</p>
          </div>
        </Card>

        {/* Metric 5: Unused Vouchers */}
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
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Ready for sale / print</p>
          </div>
        </Card>

        {/* Metric 6: Total Plans */}
        <Card hoverEffect className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Plans Available
            </span>
            <div className="p-2.5 rounded-xl bg-rose-500/10 text-rose-500">
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
        {/* Real-time SVG Trend Chart */}
        <Card className="lg:col-span-2 space-y-4">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Activity size={18} className="text-blue-500" />
                <span>Live Active Devices & Data Usage Trends (24h)</span>
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Real network data usage (MB) and active connected devices
              </p>
            </div>

            {/* Filter buttons */}
            <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl text-xs font-semibold">
              <button
                onClick={() => setChartMode('all')}
                className={`px-2.5 py-1 rounded-lg transition-colors ${
                  chartMode === 'all' 
                    ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm' 
                    : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                All Metrics
              </button>
              <button
                onClick={() => setChartMode('traffic')}
                className={`px-2.5 py-1 rounded-lg transition-colors flex items-center gap-1 ${
                  chartMode === 'traffic' 
                    ? 'bg-blue-600 text-white shadow-sm' 
                    : 'text-slate-500 hover:text-blue-500'
                }`}
              >
                <span className="w-2 h-2 rounded-full bg-blue-400" />
                <span>Data Usage (MB)</span>
              </button>
              <button
                onClick={() => setChartMode('users')}
                className={`px-2.5 py-1 rounded-lg transition-colors flex items-center gap-1 ${
                  chartMode === 'users' 
                    ? 'bg-emerald-600 text-white shadow-sm' 
                    : 'text-slate-500 hover:text-emerald-500'
                }`}
              >
                <span className="w-2 h-2 rounded-full bg-emerald-400" />
                <span>Active Devices</span>
              </button>
            </div>
          </div>

          {/* SVG Visual Graphic Chart */}
          <div className="pt-4">
            <div className="h-56 w-full relative flex items-end justify-between gap-1 sm:gap-2 border-b border-slate-200 dark:border-slate-800 pb-3">
              {trendData.map((d, i) => {
                // Compute heights based on mode
                let trafficHeightPercent = 4;
                if (maxTrafficVal > 0 && d.traffic > 0) {
                  trafficHeightPercent = Math.min(100, Math.max(12, (d.traffic / maxTrafficVal) * 95));
                }

                let userHeightPercent = 4;
                if (maxUsersVal > 0 && d.users > 0) {
                  userHeightPercent = Math.min(100, Math.max(15, (d.users / maxUsersVal) * 90));
                }

                const showTraffic = chartMode === 'all' || chartMode === 'traffic';
                const showUsers = chartMode === 'all' || chartMode === 'users';

                return (
                  <div key={i} className="flex-1 flex flex-col items-center gap-2 h-full justify-end group relative">
                    {/* Rich Tooltip on hover */}
                    <div className="absolute -top-16 hidden group-hover:flex flex-col items-center bg-slate-900 border border-slate-700 text-white text-[11px] font-semibold py-1.5 px-3 rounded-xl shadow-2xl z-30 whitespace-nowrap pointer-events-none transition-all">
                      <span className="text-slate-300 font-mono text-[10px]">{d.hour}</span>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-emerald-400 flex items-center gap-1">
                          <Users size={11} /> {d.users} Active Devices
                        </span>
                        <span className="text-blue-400 font-mono">
                          {d.traffic.toLocaleString()} MB Data
                        </span>
                      </div>
                      <span className="text-[9px] text-slate-400 font-mono">
                        ↓ {d.downloadMB || 0}M dl · ↑ {d.uploadMB || 0}M ul
                      </span>
                    </div>

                    {/* Chart Columns / Bars */}
                    <div className="w-full max-w-[34px] bg-slate-100 dark:bg-slate-800/60 rounded-t-xl relative overflow-hidden flex items-end justify-center h-full">
                      {/* Traffic Bar */}
                      {showTraffic && (
                        <div
                          style={{ height: `${trafficHeightPercent}%` }}
                          className={`w-full rounded-t-lg transition-all duration-500 ${
                            d.traffic > 0
                              ? 'bg-gradient-to-t from-blue-700 via-blue-500 to-cyan-400 group-hover:brightness-110'
                              : 'bg-slate-300 dark:bg-slate-700/50'
                          }`}
                        />
                      )}

                      {/* Active Devices Indicator Marker (When in 'all' or 'users' mode) */}
                      {showUsers && (
                        <div
                          style={{ bottom: `${userHeightPercent}%` }}
                          className={`absolute w-3 h-3 rounded-full border-2 border-slate-900 dark:border-slate-950 transition-all duration-500 shadow-md ${
                            d.users > 0 
                              ? 'bg-emerald-400 group-hover:scale-125' 
                              : 'bg-slate-400/40'
                          }`}
                          title={`${d.users} active devices`}
                        />
                      )}
                    </div>

                    <span className="text-[10px] text-slate-500 dark:text-slate-400 font-mono text-center">
                      {d.hour}
                    </span>
                  </div>
                );
              })}
            </div>

            {/* Bottom Summary Strip */}
            <div className="grid grid-cols-3 gap-2 pt-3 text-center text-xs">
              <div className="p-2 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800">
                <span className="text-slate-400 text-[10px] block">Peak Active Devices</span>
                <span className="font-bold text-slate-900 dark:text-white font-mono text-sm text-emerald-500">
                  {peakUsers} devices
                </span>
              </div>
              <div className="p-2 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800">
                <span className="text-slate-400 text-[10px] block">Peak Hourly Bandwidth</span>
                <span className="font-bold text-slate-900 dark:text-white font-mono text-sm text-blue-500">
                  {peakTrafficMB.toLocaleString()} MB
                </span>
              </div>
              <div className="p-2 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800">
                <span className="text-slate-400 text-[10px] block">Total Measured (24h)</span>
                <span className="font-bold text-slate-900 dark:text-white font-mono text-sm text-purple-500">
                  {(totalMeasuredMB / 1024).toFixed(2)} GB
                </span>
              </div>
            </div>
          </div>
        </Card>

        {/* Hardware Resource Telemetry & Quick Ops */}
        <div className="space-y-6">
          <Card className="space-y-4">
            <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Cpu size={18} className="text-purple-500" />
              <span>RouterOS Gateway Telemetry</span>
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
                <span className="text-slate-500">RouterOS Version:</span>
                <span className="font-mono text-slate-800 dark:text-slate-200">{routerStatus?.version || 'v7'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">System Uptime:</span>
                <span className="font-bold text-slate-800 dark:text-slate-200">{routerStatus?.uptime || '-'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Active Hotspot Users:</span>
                <span className="font-bold text-emerald-500 font-mono">
                  {routerStatus?.connectedUsers ?? stats?.activeDevicesCount ?? 0} online
                </span>
              </div>
            </div>
          </Card>

          {/* Quick Operations Links */}
          <Card className="space-y-3">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">Quick Management</h3>
            <div className="space-y-2">
              <Link
                to="/admin/vouchers"
                className="w-full bg-blue-600 hover:bg-blue-500 text-white py-2.5 px-3.5 rounded-xl text-xs font-bold transition-all flex items-center justify-between min-h-[44px]"
              >
                <span>Generate & Print Vouchers</span>
                <ChevronRight size={16} />
              </Link>
              <Link
                to="/admin/sessions"
                className="w-full bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 py-2.5 px-3.5 rounded-xl text-xs font-bold transition-all flex items-center justify-between min-h-[44px]"
              >
                <span>All Customer Sessions</span>
                <ChevronRight size={16} />
              </Link>
            </div>
          </Card>
        </div>
      </div>

      {/* LIVE ACTIVE DEVICES CURRENTLY USING THE NETWORK */}
      <Card className="p-0 overflow-hidden space-y-0">
        <div className="p-5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40">
          <div>
            <div className="flex items-center gap-2">
              <Radio size={18} className="text-emerald-500 animate-pulse" />
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Devices Currently Using the Network
              </h3>
              <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
                {activeDevicesList.length} Connected Now
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Live devices authenticated on MikroTik gateway actively using internet bandwidth
            </p>
          </div>

          {/* Search filter for active devices */}
          <div className="relative w-full sm:w-64">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Filter by IP, MAC, or Code..."
              value={deviceSearch}
              onChange={(e) => setDeviceSearch(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-700 dark:text-slate-300 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Active Devices Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-800/70 text-slate-500 uppercase font-bold tracking-wider border-b border-slate-200 dark:border-slate-800">
              <tr>
                <th className="p-4">Voucher / Device</th>
                <th className="p-4">IP Address</th>
                <th className="p-4">MAC Address</th>
                <th className="p-4">Time Online</th>
                <th className="p-4">Download</th>
                <th className="p-4">Upload</th>
                <th className="p-4">Total Data Used</th>
                <th className="p-4 text-right">Disconnect</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-medium">
              {loadingStats && activeDevicesList.length === 0 ? (
                <tr>
                  <td colSpan={8} className="p-8 text-center text-slate-400">
                    <div className="flex items-center justify-center gap-2">
                      <RefreshCw size={16} className="animate-spin text-blue-500" />
                      <span>Scanning active devices on router...</span>
                    </div>
                  </td>
                </tr>
              ) : filteredActiveDevices.length === 0 ? (
                <tr>
                  <td colSpan={8} className="p-8 text-center text-slate-400">
                    {deviceSearch ? (
                      <span>No active connected devices match "{deviceSearch}".</span>
                    ) : (
                      <div className="space-y-1">
                        <p className="font-semibold text-slate-300">No devices are actively using the network right now.</p>
                        <p className="text-[11px] text-slate-500">
                          When users connect and authenticate with vouchers, their real-time bandwidth and IP/MAC will appear here instantly.
                        </p>
                      </div>
                    )}
                  </td>
                </tr>
              ) : (
                filteredActiveDevices.map((device, idx) => (
                  <tr key={device.id || idx} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40 transition-colors">
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                        <span className="font-mono font-bold text-slate-900 dark:text-white text-sm">
                          {device.user}
                        </span>
                      </div>
                    </td>
                    <td className="p-4 font-mono text-slate-700 dark:text-slate-300">
                      <div className="flex items-center gap-1.5">
                        <Globe size={13} className="text-blue-500" />
                        <span>{device.ipAddress}</span>
                      </div>
                    </td>
                    <td className="p-4 font-mono text-slate-700 dark:text-slate-300">
                      <div className="flex items-center gap-1.5">
                        <Smartphone size={13} className="text-slate-400" />
                        <span>{device.macAddress}</span>
                      </div>
                    </td>
                    <td className="p-4 font-mono text-slate-600 dark:text-slate-300">
                      {device.uptime || 'Active'}
                    </td>
                    <td className="p-4 font-mono text-blue-500 font-semibold">
                      ↓ {device.downloadMB?.toLocaleString() ?? 0} MB
                    </td>
                    <td className="p-4 font-mono text-emerald-500 font-semibold">
                      ↑ {device.uploadMB?.toLocaleString() ?? 0} MB
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-slate-900 dark:text-white">
                          {device.totalMB?.toLocaleString() ?? 0} MB
                        </span>
                        <div className="w-16 h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                          <div 
                            style={{ width: `${Math.min(100, Math.max(10, (device.totalMB / 200) * 100))}%` }}
                            className="h-full bg-gradient-to-r from-blue-500 to-emerald-400 rounded-full"
                          />
                        </div>
                      </div>
                    </td>
                    <td className="p-4 text-right">
                      <button
                        onClick={() => handleDisconnectDevice(device.user)}
                        disabled={disconnectingUser === device.user}
                        title={`Disconnect ${device.user}`}
                        className="min-h-[36px] min-w-[36px] px-2.5 py-1 text-xs font-bold text-red-500 hover:text-red-400 hover:bg-red-500/10 rounded-xl transition-all inline-flex items-center gap-1 border border-red-500/20"
                      >
                        {disconnectingUser === device.user ? (
                          <RefreshCw size={13} className="animate-spin" />
                        ) : (
                          <LogOut size={13} />
                        )}
                        <span>Drop</span>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>

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
