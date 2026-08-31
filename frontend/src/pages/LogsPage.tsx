import React, { useState, useEffect } from 'react';
import { Search } from 'lucide-react';
import api from '../services/api';
import { ActivityLog } from '../types';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { useToast } from '../contexts/ToastContext';

import { SEOHead } from '../components/SEOHead';

export const LogsPage: React.FC = () => {
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [moduleFilter, setModuleFilter] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

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
    </div>
  );
};
