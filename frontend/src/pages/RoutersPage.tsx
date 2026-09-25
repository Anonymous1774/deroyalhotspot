import React, { useState, useEffect } from 'react';
import { 
  Server, 
  Plus, 
  Search, 
  RefreshCw, 
  Activity, 
  CheckCircle2, 
  XCircle, 
  AlertTriangle, 
  ShieldCheck, 
  Radio, 
  Edit3, 
  Trash2, 
  Power, 
  Cpu, 
  HardDrive, 
  Clock, 
  Users, 
  Globe, 
  KeyRound,
  Zap
} from 'lucide-react';
import api from '../services/api';
import { RouterItem, RouterTelemetry } from '../types';
import { useToast } from '../contexts/ToastContext';
import { SEOHead } from '../components/SEOHead';
import { Modal } from '../components/ui/Modal';
import { Badge } from '../components/ui/Badge';

export const RoutersPage: React.FC = () => {
  const [routers, setRouters] = useState<RouterItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  
  // Modal states
  const [modalOpen, setModalOpen] = useState(false);
  const [editingRouter, setEditingRouter] = useState<RouterItem | null>(null);
  
  // Form fields
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [host, setHost] = useState('');
  const [apiPort, setApiPort] = useState<number>(8728);
  const [apiSsl, setApiSsl] = useState(false);
  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('');
  const [enabled, setEnabled] = useState(true);
  
  // Testing & Submit loading
  const [testingId, setTestingId] = useState<string | null>(null);
  const [modalTesting, setModalTesting] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Telemetry modal
  const [telemetryModalOpen, setTelemetryModalOpen] = useState(false);
  const [selectedTelemetry, setSelectedTelemetry] = useState<RouterTelemetry | null>(null);
  const [telemetryLoading, setTelemetryLoading] = useState(false);

  // Delete modal
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deletingRouter, setDeletingRouter] = useState<RouterItem | null>(null);
  const [deleting, setDeleting] = useState(false);

  const { showToast } = useToast();

  const fetchRouters = async () => {
    try {
      setLoading(true);
      const res = await api.get('/routers');
      if (res.data && res.data.success) {
        setRouters(res.data.data || []);
      }
    } catch (err: any) {
      showToast('Error', err.response?.data?.message || 'Failed to load router gateways.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRouters();
  }, []);

  const resetForm = () => {
    setEditingRouter(null);
    setName('');
    setDescription('');
    setHost('');
    setApiPort(8728);
    setApiSsl(false);
    setUsername('admin');
    setPassword('');
    setEnabled(true);
  };

  const handleOpenCreateModal = () => {
    resetForm();
    setModalOpen(true);
  };

  const handleOpenEditModal = (router: RouterItem) => {
    setEditingRouter(router);
    setName(router.name);
    setDescription(router.description || '');
    setHost(router.host);
    setApiPort(router.apiPort);
    setApiSsl(router.apiSsl);
    setUsername(router.username);
    setPassword(''); // Leave password blank by default when editing
    setEnabled(router.enabled);
    setModalOpen(true);
  };

  const handleTestConnection = async (id?: string) => {
    const targetId = id || editingRouter?.id;
    if (targetId) {
      setTestingId(targetId);
      try {
        const res = await api.post(`/routers/${targetId}/test-connection`);
        if (res.data && res.data.success) {
          const info = res.data.data;
          showToast(
            'Connection Successful',
            `Connected to ${info.identity || 'RouterOS'} in ${info.latencyMs}ms. Status: ONLINE`,
            'success'
          );
          fetchRouters();
        }
      } catch (err: any) {
        showToast('Connection Failed', err.response?.data?.message || 'Unable to connect to router.', 'error');
      } finally {
        setTestingId(null);
      }
    } else {
      // Testing unsaved modal form
      if (!host || !username) {
        showToast('Validation Error', 'Host and Username are required to test connection.', 'error');
        return;
      }
      setModalTesting(true);
      try {
        const res = await api.post('/routers/test-connection', {
          host,
          apiPort: Number(apiPort),
          apiSsl,
          username,
          password
        });
        if (res.data && res.data.success) {
          const info = res.data.data;
          showToast(
            'Connection Test Passed',
            `Successfully connected to ${info.identity || host} (${info.latencyMs}ms latency).`,
            'success'
          );
        }
      } catch (err: any) {
        showToast('Connection Test Failed', err.response?.data?.message || 'Failed to connect to MikroTik.', 'error');
      } finally {
        setModalTesting(false);
      }
    }
  };

  const handleSubmitForm = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !host.trim() || !username.trim()) {
      showToast('Validation Error', 'Router Name, Host, and Username are required.', 'error');
      return;
    }

    if (!editingRouter && !password.trim()) {
      showToast('Validation Error', 'Password is required when adding a new router.', 'error');
      return;
    }

    setSubmitting(true);
    try {
      if (editingRouter) {
        const payload: any = {
          name,
          description: description || undefined,
          host,
          apiPort: Number(apiPort),
          apiSsl,
          username,
          enabled
        };
        if (password.trim()) {
          payload.password = password.trim();
        }
        await api.patch(`/routers/${editingRouter.id}`, payload);
        showToast('Router Updated', `Router '${name}' was updated successfully.`, 'success');
      } else {
        await api.post('/routers', {
          name,
          description: description || undefined,
          host,
          apiPort: Number(apiPort),
          apiSsl,
          username,
          password: password.trim(),
          enabled
        });
        showToast('Router Created', `Router '${name}' was added successfully.`, 'success');
      }
      setModalOpen(false);
      fetchRouters();
    } catch (err: any) {
      showToast('Error', err.response?.data?.message || 'Failed to save router.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleEnable = async (router: RouterItem) => {
    try {
      const endpoint = router.enabled ? `/routers/${router.id}/disable` : `/routers/${router.id}/enable`;
      await api.post(endpoint);
      showToast(
        router.enabled ? 'Router Disabled' : 'Router Enabled',
        `Router '${router.name}' is now ${router.enabled ? 'disabled' : 'enabled'}.`,
        'info'
      );
      fetchRouters();
    } catch (err: any) {
      showToast('Error', err.response?.data?.message || 'Failed to update router state.', 'error');
    }
  };

  const handleFetchTelemetry = async (router: RouterItem) => {
    setTelemetryLoading(true);
    setSelectedTelemetry(null);
    setTelemetryModalOpen(true);
    try {
      const res = await api.get(`/routers/${router.id}/health`);
      if (res.data && res.data.success) {
        setSelectedTelemetry(res.data.data);
      }
    } catch (err: any) {
      showToast('Telemetry Error', err.response?.data?.message || 'Failed to retrieve router telemetry.', 'error');
    } finally {
      setTelemetryLoading(false);
    }
  };

  const handleDeleteClick = (router: RouterItem) => {
    setDeletingRouter(router);
    setDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!deletingRouter) return;
    setDeleting(true);
    try {
      await api.delete(`/routers/${deletingRouter.id}`);
      showToast('Router Removed', `Router '${deletingRouter.name}' was archived successfully.`, 'success');
      setDeleteModalOpen(false);
      fetchRouters();
    } catch (err: any) {
      showToast('Deletion Failed', err.response?.data?.message || 'Failed to delete router.', 'error');
    } finally {
      setDeleting(false);
    }
  };

  const filteredRouters = routers.filter((r) => {
    const matchesSearch =
      r.name.toLowerCase().includes(search.toLowerCase()) ||
      r.host.toLowerCase().includes(search.toLowerCase()) ||
      (r.routerIdentity && r.routerIdentity.toLowerCase().includes(search.toLowerCase()));

    const matchesStatus =
      statusFilter === 'ALL' ||
      (statusFilter === 'ONLINE' && r.status === 'ONLINE') ||
      (statusFilter === 'OFFLINE' && r.status !== 'ONLINE');

    return matchesSearch && matchesStatus;
  });

  const onlineCount = routers.filter((r) => r.status === 'ONLINE').length;
  const offlineCount = routers.filter((r) => r.status !== 'ONLINE').length;
  const totalSessions = routers.reduce((sum, r) => sum + (r._count?.hotspotSessions || 0), 0);

  return (
    <>
      <SEOHead title="Routers & Multi-Gateway Management | DeRoyal OS" />

      <div className="space-y-6">
        {/* Page Title & Action Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2.5">
              <Server className="text-blue-500" size={26} />
              MikroTik Router Gateways
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
              Manage multi-router deployments, socket health telemetry, and customer hotspot authentication.
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={fetchRouters}
              disabled={loading}
              className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
              title="Refresh Router List"
            >
              <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
            </button>

            <button
              onClick={handleOpenCreateModal}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl font-semibold text-sm bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-500/25 transition-all"
            >
              <Plus size={18} />
              <span>Add New Router</span>
            </button>
          </div>
        </div>

        {/* Status Metrics Banner */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Gateways</span>
              <div className="p-2 bg-blue-500/10 text-blue-500 rounded-xl">
                <Server size={20} />
              </div>
            </div>
            <p className="text-2xl font-black text-slate-900 dark:text-white mt-2">{routers.length}</p>
          </div>

          <div className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-emerald-500 uppercase tracking-wider">Online Gateways</span>
              <div className="p-2 bg-emerald-500/10 text-emerald-500 rounded-xl">
                <CheckCircle2 size={20} />
              </div>
            </div>
            <p className="text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-2">{onlineCount}</p>
          </div>

          <div className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-rose-500 uppercase tracking-wider">Offline / Degraded</span>
              <div className="p-2 bg-rose-500/10 text-rose-500 rounded-xl">
                <XCircle size={20} />
              </div>
            </div>
            <p className="text-2xl font-black text-rose-600 dark:text-rose-400 mt-2">{offlineCount}</p>
          </div>

          <div className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-purple-500 uppercase tracking-wider">Active Customer Sessions</span>
              <div className="p-2 bg-purple-500/10 text-purple-500 rounded-xl">
                <Users size={20} />
              </div>
            </div>
            <p className="text-2xl font-black text-purple-600 dark:text-purple-400 mt-2">{totalSessions}</p>
          </div>
        </div>

        {/* Filter and Search Controls */}
        <div className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="relative w-full sm:w-80">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input
              type="text"
              placeholder="Search router name, host IP, identity..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-900 dark:text-slate-100"
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <span className="text-xs font-semibold text-slate-400">Filter Status:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-semibold text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="ALL">All Statuses</option>
              <option value="ONLINE">Online Only</option>
              <option value="OFFLINE">Offline / Degraded</option>
            </select>
          </div>
        </div>

        {/* Router List Cards Grid */}
        {loading ? (
          <div className="py-16 text-center">
            <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
            <p className="text-slate-400 font-semibold text-sm">Loading RouterOS Gateways...</p>
          </div>
        ) : filteredRouters.length === 0 ? (
          <div className="p-12 text-center bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl">
            <Server className="w-12 h-12 text-slate-400 mx-auto mb-3 opacity-50" />
            <h3 className="text-lg font-bold text-slate-800 dark:text-slate-200">No Routers Found</h3>
            <p className="text-sm text-slate-400 mt-1 max-w-md mx-auto">
              No MikroTik routers match your current search criteria. Click "Add New Router" to configure your gateway.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredRouters.map((router) => {
              const isOnline = router.status === 'ONLINE';
              const isTesting = testingId === router.id;

              return (
                <div
                  key={router.id}
                  className={`bg-white dark:bg-slate-900 border rounded-2xl p-5 shadow-sm transition-all flex flex-col justify-between ${
                    isOnline 
                      ? 'border-slate-200 dark:border-slate-800 hover:border-blue-500/50' 
                      : 'border-rose-500/30 dark:border-rose-500/30'
                  }`}
                >
                  <div>
                    {/* Card Header: Identity & Status Badge */}
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <div>
                        <h2 className="text-base font-extrabold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
                          {router.name}
                        </h2>
                        {router.routerIdentity && (
                          <span className="text-xs text-blue-600 dark:text-blue-400 font-semibold block mt-0.5">
                            ID: {router.routerIdentity}
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-2">
                        <Badge
                          variant={isOnline ? 'success' : 'danger'}
                          className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-bold uppercase tracking-wider"
                        >
                          <span className={`w-2 h-2 rounded-full ${isOnline ? 'bg-emerald-400 animate-pulse' : 'bg-rose-400'}`} />
                          {router.status}
                        </Badge>
                      </div>
                    </div>

                    {router.description && (
                      <p className="text-xs text-slate-500 dark:text-slate-400 mb-4 line-clamp-2">
                        {router.description}
                      </p>
                    )}

                    {/* Router Connection Details */}
                    <div className="space-y-2 bg-slate-50 dark:bg-slate-800/40 p-3.5 rounded-xl border border-slate-100 dark:border-slate-800/80 text-xs mb-4">
                      <div className="flex items-center justify-between">
                        <span className="text-slate-400 flex items-center gap-1.5">
                          <Globe size={14} className="text-slate-400" /> Host / IP:
                        </span>
                        <span className="font-mono font-bold text-slate-800 dark:text-slate-200">
                          {router.host}:{router.apiPort}
                          {router.apiSsl && (
                            <span className="ml-1 px-1.5 py-0.5 text-[9px] bg-blue-500/20 text-blue-400 rounded font-semibold">
                              SSL
                            </span>
                          )}
                        </span>
                      </div>

                      <div className="flex items-center justify-between">
                        <span className="text-slate-400 flex items-center gap-1.5">
                          <KeyRound size={14} className="text-slate-400" /> Username:
                        </span>
                        <span className="font-semibold text-slate-700 dark:text-slate-300">{router.username}</span>
                      </div>

                      <div className="flex items-center justify-between">
                        <span className="text-slate-400 flex items-center gap-1.5">
                          <Zap size={14} className="text-amber-400" /> Latency:
                        </span>
                        <span className="font-bold text-slate-800 dark:text-slate-200">
                          {router.latencyMs !== null && router.latencyMs !== undefined ? `${router.latencyMs} ms` : 'N/A'}
                        </span>
                      </div>

                      <div className="flex items-center justify-between">
                        <span className="text-slate-400 flex items-center gap-1.5">
                          <Users size={14} className="text-purple-400" /> Active Sessions:
                        </span>
                        <span className="font-extrabold text-purple-600 dark:text-purple-400">
                          {router._count?.hotspotSessions || 0} users
                        </span>
                      </div>
                    </div>

                    {/* Error Banner if Offline */}
                    {!isOnline && router.lastError && (
                      <div className="mb-4 p-2.5 bg-rose-500/10 border border-rose-500/20 rounded-xl flex items-start gap-2 text-xs text-rose-400">
                        <AlertTriangle size={16} className="flex-shrink-0 mt-0.5" />
                        <span className="line-clamp-2">{router.lastError}</span>
                      </div>
                    )}
                  </div>

                  {/* Actions Toolbar */}
                  <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2">
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => handleTestConnection(router.id)}
                        disabled={isTesting}
                        className="px-2.5 py-1.5 rounded-lg bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/50 text-xs font-bold flex items-center gap-1 transition-colors"
                        title="Test Socket Connection"
                      >
                        <Radio size={13} className={isTesting ? 'animate-pulse' : ''} />
                        <span>{isTesting ? 'Testing...' : 'Test'}</span>
                      </button>

                      <button
                        onClick={() => handleFetchTelemetry(router)}
                        className="px-2.5 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 text-xs font-bold flex items-center gap-1 transition-colors"
                        title="View Router Telemetry"
                      >
                        <Activity size={13} />
                        <span>Stats</span>
                      </button>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleToggleEnable(router)}
                        className={`p-1.5 rounded-lg transition-colors ${
                          router.enabled
                            ? 'text-emerald-500 hover:bg-emerald-500/10'
                            : 'text-slate-400 hover:bg-slate-800'
                        }`}
                        title={router.enabled ? 'Disable Router' : 'Enable Router'}
                      >
                        <Power size={15} />
                      </button>

                      <button
                        onClick={() => handleOpenEditModal(router)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                        title="Edit Configuration"
                      >
                        <Edit3 size={15} />
                      </button>

                      <button
                        onClick={() => handleDeleteClick(router)}
                        className="p-1.5 rounded-lg text-rose-400 hover:bg-rose-500/10 transition-colors"
                        title="Archive Router"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Add / Edit Router Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingRouter ? `Edit Router '${editingRouter.name}'` : 'Add New MikroTik Router'}
      >
        <form onSubmit={handleSubmitForm} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">
              Router Name *
            </label>
            <input
              type="text"
              required
              placeholder="e.g. hAP ax3 Branch Gateway"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3.5 py-2 bg-slate-800 border border-slate-700 rounded-xl text-sm font-semibold text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">
              Description (Optional)
            </label>
            <input
              type="text"
              placeholder="e.g. Main entrance outdoor access point router"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3.5 py-2 bg-slate-800 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">
                Host / IP Address *
              </label>
              <input
                type="text"
                required
                placeholder="10.10.10.2 or router.vpn.domain"
                value={host}
                onChange={(e) => setHost(e.target.value)}
                className="w-full px-3.5 py-2 bg-slate-800 border border-slate-700 rounded-xl text-sm font-mono text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">
                API Port *
              </label>
              <input
                type="number"
                required
                min={1}
                max={65535}
                value={apiPort}
                onChange={(e) => setApiPort(Number(e.target.value))}
                className="w-full px-3.5 py-2 bg-slate-800 border border-slate-700 rounded-xl text-sm font-mono text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">
                Username *
              </label>
              <input
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full px-3.5 py-2 bg-slate-800 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">
                Password {editingRouter ? '(Leave blank to keep unchanged)' : '*'}
              </label>
              <input
                type="password"
                required={!editingRouter}
                placeholder={editingRouter ? '••••••••' : 'Enter RouterOS API password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-3.5 py-2 bg-slate-800 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="flex items-center justify-between pt-2">
            <label className="flex items-center gap-2 cursor-pointer text-sm font-semibold text-slate-300">
              <input
                type="checkbox"
                checked={apiSsl}
                onChange={(e) => setApiSsl(e.target.checked)}
                className="w-4 h-4 rounded bg-slate-800 border-slate-700 text-blue-600 focus:ring-blue-500"
              />
              <span>Use SSL/TLS Connection (Port 8729)</span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer text-sm font-semibold text-slate-300">
              <input
                type="checkbox"
                checked={enabled}
                onChange={(e) => setEnabled(e.target.checked)}
                className="w-4 h-4 rounded bg-slate-800 border-slate-700 text-blue-600 focus:ring-blue-500"
              />
              <span>Enable Gateway</span>
            </label>
          </div>

          <div className="pt-4 border-t border-slate-800 flex items-center justify-between gap-3">
            <button
              type="button"
              onClick={() => handleTestConnection()}
              disabled={modalTesting}
              className="px-4 py-2 rounded-xl border border-slate-700 text-slate-300 hover:bg-slate-800 text-xs font-bold flex items-center gap-1.5 transition-colors"
            >
              <Radio size={14} className={modalTesting ? 'animate-spin' : ''} />
              <span>{modalTesting ? 'Testing Socket...' : 'Test Connection'}</span>
            </button>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 hover:bg-slate-700 text-sm font-semibold transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm shadow-md shadow-blue-600/30 transition-all flex items-center gap-2"
              >
                {submitting && <RefreshCw size={14} className="animate-spin" />}
                <span>{editingRouter ? 'Save Changes' : 'Create Router'}</span>
              </button>
            </div>
          </div>
        </form>
      </Modal>

      {/* Telemetry Drawer Modal */}
      <Modal
        isOpen={telemetryModalOpen}
        onClose={() => setTelemetryModalOpen(false)}
        title="Router Health & Live Telemetry"
      >
        {telemetryLoading ? (
          <div className="py-12 text-center">
            <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
            <p className="text-slate-400 text-xs font-semibold">Polling RouterOS Telemetry...</p>
          </div>
        ) : selectedTelemetry ? (
          <div className="space-y-4 text-xs">
            <div className="p-3 bg-slate-800/60 rounded-xl border border-slate-700/80 flex items-center justify-between">
              <div>
                <span className="text-slate-400 font-bold block uppercase tracking-wider">Router Identity</span>
                <span className="text-base font-extrabold text-white">{selectedTelemetry.identity}</span>
              </div>
              <Badge variant={selectedTelemetry.status === 'ONLINE' ? 'success' : 'danger'}>
                {selectedTelemetry.status}
              </Badge>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 bg-slate-800/40 rounded-xl border border-slate-800">
                <span className="text-slate-400 font-semibold block mb-1 flex items-center gap-1">
                  <Clock size={14} className="text-blue-400" /> Uptime
                </span>
                <span className="font-mono text-sm font-bold text-white">{selectedTelemetry.uptime || 'N/A'}</span>
              </div>

              <div className="p-3 bg-slate-800/40 rounded-xl border border-slate-800">
                <span className="text-slate-400 font-semibold block mb-1 flex items-center gap-1">
                  <ShieldCheck size={14} className="text-emerald-400" /> Version
                </span>
                <span className="font-mono text-sm font-bold text-white">{selectedTelemetry.version || 'N/A'}</span>
              </div>
            </div>

            {/* CPU Load Meter */}
            <div className="p-3 bg-slate-800/40 rounded-xl border border-slate-800 space-y-1.5">
              <div className="flex justify-between items-center text-xs">
                <span className="font-semibold text-slate-300 flex items-center gap-1">
                  <Cpu size={14} className="text-amber-400" /> CPU Load
                </span>
                <span className="font-mono font-bold text-white">{selectedTelemetry.cpuUsage || 0}%</span>
              </div>
              <div className="w-full bg-slate-700 rounded-full h-2 overflow-hidden">
                <div
                  className="bg-amber-400 h-2 rounded-full transition-all"
                  style={{ width: `${Math.min(100, selectedTelemetry.cpuUsage || 0)}%` }}
                />
              </div>
            </div>

            {/* Memory Usage Meter */}
            <div className="p-3 bg-slate-800/40 rounded-xl border border-slate-800 space-y-1.5">
              <div className="flex justify-between items-center text-xs">
                <span className="font-semibold text-slate-300 flex items-center gap-1">
                  <HardDrive size={14} className="text-purple-400" /> RAM Memory
                </span>
                <span className="font-mono font-bold text-white">
                  {selectedTelemetry.memoryUsage || 0}% ({selectedTelemetry.memoryFree || 0}MB Free)
                </span>
              </div>
              <div className="w-full bg-slate-700 rounded-full h-2 overflow-hidden">
                <div
                  className="bg-purple-500 h-2 rounded-full transition-all"
                  style={{ width: `${Math.min(100, selectedTelemetry.memoryUsage || 0)}%` }}
                />
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setTelemetryModalOpen(false)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl font-bold text-xs"
              >
                Close
              </button>
            </div>
          </div>
        ) : null}
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        title="Archive Router Gateway"
      >
        <div className="space-y-4 text-sm text-slate-300">
          <p>
            Are you sure you want to archive router{' '}
            <strong className="text-white">{deletingRouter?.name}</strong>?
          </p>

          {deletingRouter && deletingRouter._count?.hotspotSessions && deletingRouter._count.hotspotSessions > 0 ? (
            <div className="p-3 bg-rose-500/10 border border-rose-500/20 rounded-xl text-xs text-rose-400 flex items-start gap-2">
              <AlertTriangle size={16} className="flex-shrink-0 mt-0.5" />
              <span>
                Warning: This router currently has <strong>{deletingRouter._count.hotspotSessions} active online user session(s)</strong>.
                Disconnect users before archiving.
              </span>
            </div>
          ) : (
            <p className="text-xs text-slate-400">
              Archiving soft-deletes the gateway definition. Historical sales and session audit logs will remain intact.
            </p>
          )}

          <div className="pt-3 border-t border-slate-800 flex justify-end gap-2">
            <button
              onClick={() => setDeleteModalOpen(false)}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold rounded-xl text-xs"
            >
              Cancel
            </button>
            <button
              onClick={handleConfirmDelete}
              disabled={deleting}
              className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl text-xs shadow-md shadow-rose-600/30 flex items-center gap-1.5"
            >
              {deleting && <RefreshCw size={14} className="animate-spin" />}
              <span>{deleting ? 'Archiving...' : 'Archive Router'}</span>
            </button>
          </div>
        </div>
      </Modal>
    </>
  );
};
