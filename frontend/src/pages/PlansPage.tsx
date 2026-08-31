import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Clock, Zap, AlertCircle } from 'lucide-react';
import api from '../services/api';
import { Plan, BandwidthProfile } from '../types';
import { Card } from '../components/ui/Card';
import { Modal } from '../components/ui/Modal';
import { useToast } from '../contexts/ToastContext';
import { SEOHead } from '../components/SEOHead';

export const PlansPage: React.FC = () => {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [profiles, setProfiles] = useState<BandwidthProfile[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal states
  const [createOpen, setCreateOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null);

  // Form states
  const [formName, setFormName] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [formDuration, setFormDuration] = useState('60');
  const [formDurationUnit, setFormDurationUnit] = useState('minutes');
  const [formPrice, setFormPrice] = useState('100');
  const [formProfileId, setFormProfileId] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const { showToast } = useToast();

  const fetchPlansAndProfiles = async () => {
    setLoading(true);
    try {
      const [plansRes, profilesRes] = await Promise.all([
        api.get('/plans'),
        api.get('/bandwidth-profiles')
      ]);

      if (plansRes.data && plansRes.data.success) {
        const fetchedPlans = Array.isArray(plansRes.data.data)
          ? plansRes.data.data
          : plansRes.data.data?.plans || [];
        setPlans(fetchedPlans);
      }
      if (profilesRes.data && profilesRes.data.success) {
        const profs = Array.isArray(profilesRes.data.data)
          ? profilesRes.data.data
          : profilesRes.data.data?.profiles || [];
        setProfiles(profs);
        if (profs.length > 0 && !formProfileId) {
          setFormProfileId(profs[0].id);
        }
      }
    } catch (err) {
      console.error('Error fetching plans/profiles:', err);
      showToast('Error Loading Plans', 'Could not retrieve plans data.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPlansAndProfiles();
  }, []);

  const openCreateModal = () => {
    setFormName('');
    setFormDescription('');
    setFormDuration('60');
    setFormDurationUnit('minutes');
    setFormPrice('100');
    if (profiles.length > 0) setFormProfileId(profiles[0].id);
    setCreateOpen(true);
  };

  const openEditModal = (plan: Plan) => {
    setSelectedPlan(plan);
    setFormName(plan.name);
    setFormDescription(plan.description || '');
    setFormDuration(String(plan.duration));
    setFormDurationUnit(plan.durationUnit);
    setFormPrice(String(plan.price));
    setFormProfileId(plan.bandwidthProfileId);
    setEditOpen(true);
  };

  const openDeleteModal = (plan: Plan) => {
    setSelectedPlan(plan);
    setDeleteOpen(true);
  };

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const payload = {
        name: formName,
        description: formDescription || undefined,
        duration: parseInt(formDuration, 10),
        durationUnit: formDurationUnit,
        price: parseFloat(formPrice),
        bandwidthProfileId: formProfileId
      };

      const res = await api.post('/plans', payload);
      if (res.data && res.data.success) {
        showToast('Plan Created', `Internet plan '${formName}' created successfully.`, 'success');
        setCreateOpen(false);
        fetchPlansAndProfiles();
      }
    } catch (err: any) {
      console.error(err);
      showToast('Create Failed', err.response?.data?.message || 'Failed to create plan.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPlan) return;
    setSubmitting(true);
    try {
      const payload = {
        name: formName,
        description: formDescription || undefined,
        duration: parseInt(formDuration, 10),
        durationUnit: formDurationUnit,
        price: parseFloat(formPrice),
        bandwidthProfileId: formProfileId
      };

      const res = await api.put(`/plans/${selectedPlan.id}`, payload);
      if (res.data && res.data.success) {
        showToast('Plan Updated', `Plan '${formName}' updated successfully.`, 'success');
        setEditOpen(false);
        fetchPlansAndProfiles();
      }
    } catch (err: any) {
      console.error(err);
      showToast('Update Failed', err.response?.data?.message || 'Failed to update plan.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteSubmit = async () => {
    if (!selectedPlan) return;
    setSubmitting(true);
    try {
      const res = await api.delete(`/plans/${selectedPlan.id}`);
      if (res.data && res.data.success) {
        showToast('Plan Deleted', `Plan '${selectedPlan.name}' removed.`, 'success');
        setDeleteOpen(false);
        fetchPlansAndProfiles();
      }
    } catch (err: any) {
      console.error(err);
      showToast('Delete Failed', err.response?.data?.message || 'Failed to delete plan.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <SEOHead 
        title="Bandwidth & Access Plans | DeRoyal Hotspot OS"
        description="Configure hotspot duration, speed limits, and pricing for DeRoyal Hotspot OS."
        canonicalPath="/admin/plans"
      />

      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Internet Pricing Plans
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Configure hotspot duration, speed limits & pricing
          </p>
        </div>

        <button
          onClick={openCreateModal}
          className="min-h-[44px] px-4 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-blue-600/20 flex items-center gap-2 transition-all"
        >
          <Plus size={16} />
          <span>Create New Plan</span>
        </button>
      </div>

      {/* Plans Card Grid */}
      {loading ? (
        <div className="py-12 text-center text-slate-400 font-medium">Loading plans...</div>
      ) : plans.length === 0 ? (
        <Card className="py-12 text-center space-y-3">
          <AlertCircle size={40} className="mx-auto text-slate-400" />
          <h3 className="text-lg font-bold text-slate-800 dark:text-slate-200">No Plans Configured</h3>
          <p className="text-xs text-slate-500">Create your first hotspot internet plan to start selling vouchers.</p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {plans.map((plan) => (
            <Card key={plan.id} hoverEffect className="space-y-4 flex flex-col justify-between">
              <div className="space-y-3">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-bold text-base text-slate-900 dark:text-white">{plan.name}</h3>
                    {plan.description && (
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{plan.description}</p>
                    )}
                  </div>
                  <span className="text-base font-extrabold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-xl border border-emerald-500/20">
                    ₦{plan.price.toLocaleString()}
                  </span>
                </div>

                <div className="pt-2 border-t border-slate-100 dark:border-slate-800/80 space-y-2 text-xs">
                  <div className="flex justify-between items-center text-slate-600 dark:text-slate-300">
                    <span className="flex items-center gap-1.5 text-slate-400">
                      <Clock size={14} /> Duration:
                    </span>
                    <span className="font-semibold">{plan.duration} {plan.durationUnit}</span>
                  </div>

                  <div className="flex justify-between items-center text-slate-600 dark:text-slate-300">
                    <span className="flex items-center gap-1.5 text-slate-400">
                      <Zap size={14} /> Speed Profile:
                    </span>
                    <span className="font-bold text-blue-500">
                      {plan.bandwidthProfile?.name || 'Default'}
                    </span>
                  </div>

                  {plan.bandwidthProfile && (
                    <div className="text-[11px] text-slate-400 flex justify-between bg-slate-50 dark:bg-slate-800/50 p-2 rounded-lg">
                      <span>↓ {plan.bandwidthProfile.downloadSpeed}</span>
                      <span>↑ {plan.bandwidthProfile.uploadSpeed}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Card Action Buttons (min 44px touch targets) */}
              <div className="flex gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  onClick={() => openEditModal(plan)}
                  aria-label={`Edit ${plan.name}`}
                  className="flex-1 min-h-[44px] flex items-center justify-center gap-1.5 text-xs font-semibold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl transition-colors"
                >
                  <Edit2 size={14} />
                  <span>Edit</span>
                </button>
                <button
                  onClick={() => openDeleteModal(plan)}
                  aria-label={`Delete ${plan.name}`}
                  className="min-h-[44px] min-w-[44px] px-3 flex items-center justify-center text-xs font-semibold text-red-500 bg-red-500/10 hover:bg-red-500/20 rounded-xl transition-colors"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Create Modal */}
      <Modal isOpen={createOpen} onClose={() => setCreateOpen(false)} title="Create Internet Plan">
        <form onSubmit={handleCreateSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Plan Name</label>
            <input
              type="text"
              required
              value={formName}
              onChange={(e) => setFormName(e.target.value)}
              placeholder="e.g. 1 Hour Regular"
              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl py-2.5 px-3 text-sm"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Description (Optional)</label>
            <input
              type="text"
              value={formDescription}
              onChange={(e) => setFormDescription(e.target.value)}
              placeholder="e.g. High speed browsing pass"
              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl py-2.5 px-3 text-sm"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Duration Value</label>
              <input
                type="number"
                required
                min="1"
                value={formDuration}
                onChange={(e) => setFormDuration(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl py-2.5 px-3 text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Unit</label>
              <select
                value={formDurationUnit}
                onChange={(e) => setFormDurationUnit(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl py-2.5 px-3 text-sm"
              >
                <option value="minutes">Minutes</option>
                <option value="hours">Hours</option>
                <option value="days">Days</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Price (₦)</label>
              <input
                type="number"
                required
                min="0"
                value={formPrice}
                onChange={(e) => setFormPrice(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl py-2.5 px-3 text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Speed Profile</label>
              <select
                value={formProfileId}
                onChange={(e) => setFormProfileId(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl py-2.5 px-3 text-sm"
              >
                {profiles.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} ({p.downloadSpeed} ↓ / {p.uploadSpeed} ↑)
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="pt-3 flex gap-3">
            <button
              type="button"
              onClick={() => setCreateOpen(false)}
              className="flex-1 min-h-[44px] bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold rounded-xl text-xs"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="flex-1 min-h-[44px] bg-blue-600 text-white font-bold rounded-xl text-xs shadow-md"
            >
              {submitting ? 'Creating...' : 'Save Plan'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Edit Modal */}
      <Modal isOpen={editOpen} onClose={() => setEditOpen(false)} title="Edit Internet Plan">
        <form onSubmit={handleEditSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Plan Name</label>
            <input
              type="text"
              required
              value={formName}
              onChange={(e) => setFormName(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl py-2.5 px-3 text-sm"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Price (₦)</label>
              <input
                type="number"
                required
                min="0"
                value={formPrice}
                onChange={(e) => setFormPrice(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl py-2.5 px-3 text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Speed Profile</label>
              <select
                value={formProfileId}
                onChange={(e) => setFormProfileId(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl py-2.5 px-3 text-sm"
              >
                {profiles.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} ({p.downloadSpeed} ↓ / {p.uploadSpeed} ↑)
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="pt-3 flex gap-3">
            <button
              type="button"
              onClick={() => setEditOpen(false)}
              className="flex-1 min-h-[44px] bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold rounded-xl text-xs"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="flex-1 min-h-[44px] bg-blue-600 text-white font-bold rounded-xl text-xs shadow-md"
            >
              {submitting ? 'Updating...' : 'Update Plan'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal isOpen={deleteOpen} onClose={() => setDeleteOpen(false)} title="Confirm Plan Deletion">
        <div className="space-y-4 text-center">
          <AlertCircle size={44} className="mx-auto text-red-500" />
          <p className="text-sm text-slate-600 dark:text-slate-300">
            Are you sure you want to delete the plan <strong className="text-slate-900 dark:text-white">{selectedPlan?.name}</strong>?
          </p>
          <div className="pt-2 flex gap-3">
            <button
              onClick={() => setDeleteOpen(false)}
              className="flex-1 min-h-[44px] bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold rounded-xl text-xs"
            >
              Cancel
            </button>
            <button
              onClick={handleDeleteSubmit}
              disabled={submitting}
              className="flex-1 min-h-[44px] bg-red-600 text-white font-bold rounded-xl text-xs shadow-md"
            >
              {submitting ? 'Deleting...' : 'Yes, Delete Plan'}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
