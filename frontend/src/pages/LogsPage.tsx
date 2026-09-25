import React, { useState, useEffect } from 'react';
import { Search, Trash2, AlertTriangle, RefreshCw } from 'lucide-react';
import api from '../services/api';
import { ActivityLog } from '../types';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Modal } from '../components/ui/Modal';
import { useToast } from '../contexts/ToastContext';

import { SEOHead } from '../components/SEOHead';

export const LogsPage: React.FC = () => {
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [moduleFilter, setModuleFilter] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  // Clear modal states
  const [clearModalOpen, setClearModalOpen] = useState(false);
  const [clearMode, setClearMode] = useState<'ALL' | 'OLDER_THAN'>('OLDER_THAN');
  const [olderThanDays, setOlderThanDays] = useState<number>(30);
  const [clearing, setClearing] = useState(false);

  const { showToast } = useToast();

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const params: any = {};
      if (moduleFilter) params.module = moduleFilter;
      if (searchQuery) params.search = searchQuery;

      const res = await api.get('/logs', { params });
      if (res.data && res.data.success) {
        setLogs(res.data.data.logs || []);
      }
    } catch (err) {
      console.error(err);
      showToast('Error Loading Logs', 'Failed to fetch audit logs.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, [moduleFilter, searchQuery]);

  const handleConfirmClearLogs = async () => {
    setClearing(true);
    try {
      const payload: any = {};
      if (clearMode === 'OLDER_THAN') {
        payload.olderThanDays = Number(olderThanDays);
      }
      if (moduleFilter) {
        payload.module = moduleFilter;
      }

      const res = await api.delete('/logs', { data: payload });

      if (res.data && res.data.success) {
        const deletedCount = res.data.data?.count ?? 0;
        showToast('Logs Cleared', `Successfully cleared ${deletedCount} activity log(s).`, 'success');
        setClearModalOpen(false);
        fetchLogs();
      }
    } catch (err: any) {
      console.error(err);
      showToast('Clear Failed', err.response?.data?.message || 'Failed to clear activity logs.', 'error');
    } finally {
      setClearing(false);
    }
  };

  const getModuleBadge = (moduleName: string) => {
    switch (moduleName) {
      case 'ROUTER': return <Badge variant="warning">ROUTER</Badge>;
      case 'VOUCHER': return <Badge variant="info">VOUCHER</Badge>;
      case 'SYSTEM': return <Badge variant="danger">SYSTEM</Badge>;
      default: return <Badge variant="neutral">{moduleName}</Badge>;
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <SEOHead 
        title="Audit System Logs | DeRoyal Hotspot OS"
        description="Security event audit trail, admin logins, and router log monitoring for DeRoyal Hotspot OS."
        canonicalPath="/admin/logs"
      />

      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            System Audit Logs
          </h1>

          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Security & operational event trail for all admin and router actions
          </p>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <button
            onClick={() => setClearModalOpen(true)}
            className="min-h-[44px] px-3.5 bg-red-500/10 hover:bg-red-500/20 text-red-500 font-bold text-xs rounded-xl flex items-center gap-1.5 transition-colors"
          >
            <Trash2 size={16} />
            <span>Clear Logs</span>
          </button>
        </div>
      </div>

      {/* Filter Controls */}
      <Card className="p-4 flex flex-col md:flex-row gap-3 items-center justify-between">
        <div className="relative w-full md:w-72">
          <input
            type="text"
            placeholder="Search action or description..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl py-2.5 pl-9 pr-3 text-xs text-slate-900 dark:text-white"
          />
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
        </div>

        <div className="w-full md:w-auto">
          <select
            value={moduleFilter}
            onChange={(e) => setModuleFilter(e.target.value)}
            className="w-full md:w-auto bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl py-2 px-3 text-xs text-slate-700 dark:text-slate-300"
          >
            <option value="">All Modules</option>
            <option value="ROUTER">ROUTER</option>
            <option value="VOUCHER">VOUCHER</option>
            <option value="SYSTEM">SYSTEM</option>
            <option value="AUTH">AUTH</option>
          </select>
        </div>
      </Card>

      {/* Logs Table */}
      <Card className="p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-800/80 text-slate-500 uppercase font-bold tracking-wider border-b border-slate-200 dark:border-slate-800">
              <tr>
                <th className="p-4">Timestamp</th>
                <th className="p-4">Module</th>
                <th className="p-4">Action</th>
                <th className="p-4">Description</th>
                <th className="p-4">IP Address</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-medium">
              {loading ? (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-slate-400">Loading activity logs...</td>
                </tr>
              ) : logs.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-slate-400">No activity logs recorded.</td>
                </tr>
              ) : (
                logs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40 transition-colors">
                    <td className="p-4 text-slate-500 font-mono whitespace-nowrap">
                      {new Date(log.createdAt).toLocaleString()}
                    </td>
                    <td className="p-4">{getModuleBadge(log.module)}</td>
                    <td className="p-4 font-bold text-slate-900 dark:text-white">{log.action}</td>
                    <td className="p-4 text-slate-600 dark:text-slate-300 max-w-md break-words">
                      {log.description}
                    </td>
                    <td className="p-4 text-slate-400 font-mono">{log.ipAddress || 'System'}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Clear Logs Confirmation Modal */}
      <Modal
        isOpen={clearModalOpen}
        onClose={() => setClearModalOpen(false)}
        title="Clear Activity Logs"
      >
        <div className="space-y-4 text-sm text-slate-300">
          <div className="p-3.5 bg-amber-500/10 border border-amber-500/20 rounded-xl text-xs text-amber-400 flex items-start gap-2.5">
            <AlertTriangle size={18} className="flex-shrink-0 mt-0.5" />
            <div>
              <span className="font-bold block">Caution</span>
              Deleting audit logs removes historical operational and security activity records. This action cannot be undone.
            </div>
          </div>

          <div className="space-y-3 pt-1">
            <label className="flex items-center gap-3 cursor-pointer p-3 rounded-xl bg-slate-800/40 border border-slate-800 hover:border-slate-700 transition-colors">
              <input
                type="radio"
                name="clearMode"
                value="OLDER_THAN"
                checked={clearMode === 'OLDER_THAN'}
                onChange={() => setClearMode('OLDER_THAN')}
                className="w-4 h-4 text-blue-600 bg-slate-900 border-slate-700 focus:ring-blue-500"
              />
              <div className="flex-1 flex items-center justify-between gap-2">
                <span className="font-semibold text-white">Clear logs older than:</span>
                <select
                  value={olderThanDays}
                  onChange={(e) => setOlderThanDays(Number(e.target.value))}
                  disabled={clearMode !== 'OLDER_THAN'}
                  className="bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1 text-xs font-bold text-white focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
                >
                  <option value={7}>7 Days</option>
                  <option value={14}>14 Days</option>
                  <option value={30}>30 Days</option>
                  <option value={60}>60 Days</option>
                  <option value={90}>90 Days</option>
                </select>
              </div>
            </label>

            <label className="flex items-center gap-3 cursor-pointer p-3 rounded-xl bg-slate-800/40 border border-slate-800 hover:border-slate-700 transition-colors">
              <input
                type="radio"
                name="clearMode"
                value="ALL"
                checked={clearMode === 'ALL'}
                onChange={() => setClearMode('ALL')}
                className="w-4 h-4 text-rose-600 bg-slate-900 border-slate-700 focus:ring-rose-500"
              />
              <div>
                <span className="font-bold text-rose-400 block">Clear ALL Logs</span>
                <span className="text-xs text-slate-400">Permanently delete every activity log entry in the system</span>
              </div>
            </label>
          </div>

          <div className="pt-3 border-t border-slate-800 flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setClearModalOpen(false)}
              className="min-h-[44px] px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold rounded-xl text-xs transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleConfirmClearLogs}
              disabled={clearing}
              className="min-h-[44px] px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl text-xs shadow-lg shadow-rose-600/30 flex items-center gap-1.5 transition-all"
            >
              {clearing && <RefreshCw size={14} className="animate-spin" />}
              <span>{clearing ? 'Clearing...' : 'Confirm Clear Logs'}</span>
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
