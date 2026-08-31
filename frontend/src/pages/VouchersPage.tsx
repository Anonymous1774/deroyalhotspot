import React, { useState, useEffect } from 'react';
import { Plus, Search, Trash2, Ban, AlertCircle } from 'lucide-react';
import api from '../services/api';
import { Voucher, Plan } from '../types';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Modal } from '../components/ui/Modal';
import { useToast } from '../contexts/ToastContext';
import { SEOHead } from '../components/SEOHead';

export const VouchersPage: React.FC = () => {
  const [vouchers, setVouchers] = useState<Voucher[]>([]);
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [statusFilter, setStatusFilter] = useState('');
  const [planFilter, setPlanFilter] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Modals
  const [generateOpen, setGenerateOpen] = useState(false);
  const [deleteAllOpen, setDeleteAllOpen] = useState(false);

  // Generator form
  const [genPlanId, setGenPlanId] = useState('');
  const [genCount, setGenCount] = useState('10');
  const [submitting, setSubmitting] = useState(false);

  const { showToast } = useToast();

  const fetchVouchers = async () => {
    setLoading(true);
    try {
      const params: any = { page, limit: 15 };
      if (statusFilter) params.status = statusFilter;
      if (planFilter) params.planId = planFilter;
      if (searchQuery) params.search = searchQuery;

      const res = await api.get('/vouchers', { params });
      if (res.data && res.data.success) {
        setVouchers(res.data.data.vouchers || []);
        setTotalPages(res.data.data.pagination?.totalPages || 1);
      }
    } catch (err) {
      console.error(err);
      showToast('Error Loading Vouchers', 'Failed to fetch voucher list.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const fetchPlans = async () => {
    try {
      const res = await api.get('/plans');
      if (res.data && res.data.success) {
        const fetchedPlans = Array.isArray(res.data.data)
          ? res.data.data
          : res.data.data?.plans || [];
        setPlans(fetchedPlans);
        if (fetchedPlans.length > 0 && !genPlanId) {
          setGenPlanId(fetchedPlans[0].id);
        }
      }
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchPlans();
  }, []);

  useEffect(() => {
    fetchVouchers();
  }, [page, statusFilter, planFilter, searchQuery]);

  const handleGenerateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await api.post('/vouchers/generate', {
        planId: genPlanId,
        count: parseInt(genCount, 10)
      });

      if (res.data && res.data.success) {
        showToast('Vouchers Generated', `Successfully generated ${genCount} vouchers.`, 'success');
        setGenerateOpen(false);
        fetchVouchers();
      }
    } catch (err: any) {
      console.error(err);
      showToast('Generation Failed', err.response?.data?.message || 'Failed to generate vouchers.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDisableVoucher = async (voucher: Voucher) => {
    try {
      const res = await api.put(`/vouchers/${voucher.id}/disable`);
      if (res.data && res.data.success) {
        showToast('Voucher Disabled', `Code '${voucher.code}' has been disabled.`, 'warning');
        fetchVouchers();
      }
    } catch (err: any) {
      showToast('Action Failed', err.response?.data?.message || 'Failed to disable voucher.', 'error');
    }
  };

  const handleDeleteVoucher = async (voucher: Voucher) => {
    try {
      const res = await api.delete(`/vouchers/${voucher.id}`);
      if (res.data && res.data.success) {
        showToast('Voucher Deleted', `Code '${voucher.code}' deleted.`, 'success');
        fetchVouchers();
      }
    } catch (err: any) {
      showToast('Delete Failed', err.response?.data?.message || 'Failed to delete voucher.', 'error');
    }
  };

  const handleDeleteAllSubmit = async () => {
    setSubmitting(true);
    try {
      const res = await api.delete('/vouchers/delete-all');
      if (res.data && res.data.success) {
        showToast('All Vouchers Cleared', `Deleted all vouchers (${res.data.data.count} items).`, 'success');
        setDeleteAllOpen(false);
        fetchVouchers();
      }
    } catch (err: any) {
      showToast('Action Failed', err.response?.data?.message || 'Failed to delete all vouchers.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const getVoucherBadge = (status: string) => {
    switch (status) {
      case 'ACTIVE': return <Badge variant="success">ACTIVE</Badge>;
      case 'UNUSED': return <Badge variant="info">UNUSED</Badge>;
      case 'EXPIRED': return <Badge variant="warning">EXPIRED</Badge>;
      case 'DISABLED': default: return <Badge variant="danger">DISABLED</Badge>;
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <SEOHead 
        title="Voucher Management | DeRoyal Hotspot OS"
        description="Bulk generate, search, export, and manage access voucher codes for DeRoyal Hotspot OS."
        canonicalPath="/admin/vouchers"
      />
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Hotspot Voucher Inventory
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Bulk generate, monitor & manage access voucher codes
          </p>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <button
            onClick={() => setDeleteAllOpen(true)}
            className="min-h-[44px] px-3.5 bg-red-500/10 hover:bg-red-500/20 text-red-500 font-bold text-xs rounded-xl flex items-center gap-1.5 transition-colors"
          >
            <Trash2 size={14} />
            <span>Clear All</span>
          </button>
          <button
            onClick={() => setGenerateOpen(true)}
            className="min-h-[44px] px-4 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-blue-600/20 flex items-center gap-2 transition-all"
          >
            <Plus size={16} />
            <span>Generate Vouchers</span>
          </button>
        </div>
      </div>

      {/* Filter Controls */}
      <Card className="p-4 flex flex-col md:flex-row gap-3 items-center justify-between">
        <div className="relative w-full md:w-72">
          <input
            type="text"
            placeholder="Search code or MAC..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl py-2.5 pl-9 pr-3 text-xs text-slate-900 dark:text-white"
          />
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
        </div>

        <div className="flex flex-wrap gap-2 w-full md:w-auto">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl py-2 px-3 text-xs text-slate-700 dark:text-slate-300"
          >
            <option value="">All Statuses</option>
            <option value="UNUSED">UNUSED</option>
            <option value="ACTIVE">ACTIVE</option>
            <option value="EXPIRED">EXPIRED</option>
            <option value="DISABLED">DISABLED</option>
          </select>

          <select
            value={planFilter}
            onChange={(e) => setPlanFilter(e.target.value)}
            className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl py-2 px-3 text-xs text-slate-700 dark:text-slate-300"
          >
            <option value="">All Plans</option>
            {plans.map((p) => (
              <option key={p.id} value={p.id}>{p.name}</option>
            ))}
          </select>
        </div>
      </Card>

      {/* Vouchers Table */}
      <Card className="p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-800/80 text-slate-500 uppercase font-bold tracking-wider border-b border-slate-200 dark:border-slate-800">
              <tr>
                <th className="p-4">Voucher Code</th>
                <th className="p-4">Plan Name</th>
                <th className="p-4">Status</th>
                <th className="p-4">Activated At</th>
                <th className="p-4">Expires At</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-medium">
              {loading ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-slate-400">Loading vouchers...</td>
                </tr>
              ) : vouchers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-slate-400">No vouchers found.</td>
                </tr>
              ) : (
                vouchers.map((v) => (
                  <tr key={v.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40 transition-colors">
                    <td className="p-4 font-mono font-bold text-slate-900 dark:text-white text-sm">{v.code}</td>
                    <td className="p-4 font-semibold text-slate-700 dark:text-slate-300">{v.plan?.name || '-'}</td>
                    <td className="p-4">{getVoucherBadge(v.status)}</td>
                    <td className="p-4 text-slate-500">
                      {v.activatedAt ? new Date(v.activatedAt).toLocaleString() : '-'}
                    </td>
                    <td className="p-4 text-slate-500">
                      {v.expiresAt ? new Date(v.expiresAt).toLocaleString() : '-'}
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        {v.status !== 'DISABLED' && v.status !== 'EXPIRED' && (
                          <button
                            onClick={() => handleDisableVoucher(v)}
                            aria-label={`Disable voucher ${v.code}`}
                            title="Disable Voucher"
                            className="min-h-[44px] min-w-[44px] flex items-center justify-center text-amber-500 hover:bg-amber-500/10 rounded-xl transition-colors"
                          >
                            <Ban size={16} />
                          </button>
                        )}
                        <button
                          onClick={() => handleDeleteVoucher(v)}
                          aria-label={`Delete voucher ${v.code}`}
                          title="Delete Voucher"
                          className="min-h-[44px] min-w-[44px] flex items-center justify-center text-red-500 hover:bg-red-500/10 rounded-xl transition-colors"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        {totalPages > 1 && (
          <div className="p-4 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500">
            <span>Page {page} of {totalPages}</span>
            <div className="flex gap-2">
              <button
                disabled={page <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                className="min-h-[44px] px-3.5 bg-slate-100 dark:bg-slate-800 disabled:opacity-50 text-slate-700 dark:text-slate-300 font-semibold rounded-xl"
              >
                Previous
              </button>
              <button
                disabled={page >= totalPages}
                onClick={() => setPage((p) => p + 1)}
                className="min-h-[44px] px-3.5 bg-slate-100 dark:bg-slate-800 disabled:opacity-50 text-slate-700 dark:text-slate-300 font-semibold rounded-xl"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </Card>

      {/* Generate Vouchers Modal */}
      <Modal isOpen={generateOpen} onClose={() => setGenerateOpen(false)} title="Bulk Generate Vouchers">
        <form onSubmit={handleGenerateSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Target Plan</label>
            <select
              value={genPlanId}
              onChange={(e) => setGenPlanId(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl py-2.5 px-3 text-sm"
            >
              {plans.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} (₦{p.price} - {p.duration} {p.durationUnit})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Number of Vouchers</label>
            <input
              type="number"
              required
              min="1"
              max="500"
              value={genCount}
              onChange={(e) => setGenCount(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl py-2.5 px-3 text-sm"
            />
          </div>

          <div className="pt-3 flex gap-3">
            <button
              type="button"
              onClick={() => setGenerateOpen(false)}
              className="flex-1 min-h-[44px] bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold rounded-xl text-xs"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="flex-1 min-h-[44px] bg-blue-600 text-white font-bold rounded-xl text-xs shadow-md"
            >
              {submitting ? 'Generating...' : 'Generate Now'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete All Modal */}
      <Modal isOpen={deleteAllOpen} onClose={() => setDeleteAllOpen(false)} title="Clear All Vouchers">
        <div className="space-y-4 text-center">
          <AlertCircle size={44} className="mx-auto text-red-500" />
          <p className="text-sm text-slate-600 dark:text-slate-300">
            Warning: This action will permanently remove all voucher records from the database.
          </p>
          <div className="pt-2 flex gap-3">
            <button
              onClick={() => setDeleteAllOpen(false)}
              className="flex-1 min-h-[44px] bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold rounded-xl text-xs"
            >
              Cancel
            </button>
            <button
              onClick={handleDeleteAllSubmit}
              disabled={submitting}
              className="flex-1 min-h-[44px] bg-red-600 text-white font-bold rounded-xl text-xs shadow-md"
            >
              {submitting ? 'Deleting...' : 'Yes, Clear All'}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
