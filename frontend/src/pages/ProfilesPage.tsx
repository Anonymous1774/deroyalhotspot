import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Network, ArrowDown, ArrowUp } from 'lucide-react';
import api from '../services/api';
import { BandwidthProfile } from '../types';
import { Card } from '../components/ui/Card';
import { Modal } from '../components/ui/Modal';
import { useToast } from '../contexts/ToastContext';
import { SEOHead } from '../components/SEOHead';

export const ProfilesPage: React.FC = () => {
  const [profiles, setProfiles] = useState<BandwidthProfile[]>([]);
  const [loading, setLoading] = useState(true);

  // Modals
  const [createOpen, setCreateOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [selectedProfile, setSelectedProfile] = useState<BandwidthProfile | null>(null);

  // Form states
  const [name, setName] = useState('');
  const [downloadSpeed, setDownloadSpeed] = useState('5M');
  const [uploadSpeed, setUploadSpeed] = useState('2M');
  const [mikrotikQueueName, setMikrotikQueueName] = useState('bronze_queue');
  const [submitting, setSubmitting] = useState(false);

  const { showToast } = useToast();

  const fetchProfiles = async () => {
    setLoading(true);
    try {
      const res = await api.get('/bandwidth-profiles');
      if (res.data && res.data.success) {
        const fetchedProfiles = Array.isArray(res.data.data)
          ? res.data.data
          : res.data.data?.profiles || [];
        setProfiles(fetchedProfiles);
      }
    } catch (err) {
      console.error(err);
      showToast('Error Loading Profiles', 'Failed to retrieve bandwidth profiles.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfiles();
  }, []);

  const openCreateModal = () => {
    setName('');
    setDownloadSpeed('5M');
    setUploadSpeed('2M');
    setMikrotikQueueName('bronze_queue');
    setCreateOpen(true);
  };

  const openEditModal = (profile: BandwidthProfile) => {
    setSelectedProfile(profile);
    setName(profile.name);
    setDownloadSpeed(profile.downloadSpeed);
    setUploadSpeed(profile.uploadSpeed);
    setMikrotikQueueName(profile.mikrotikQueueName || '');
    setEditOpen(true);
  };

  const openDeleteModal = (profile: BandwidthProfile) => {
    setSelectedProfile(profile);
    setDeleteOpen(true);
  };

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const payload = { name, downloadSpeed, uploadSpeed, mikrotikQueueName };
      const res = await api.post('/bandwidth-profiles', payload);

      if (res.data && res.data.success) {
        showToast('Profile Created', `Bandwidth profile '${name}' created.`, 'success');
        setCreateOpen(false);
        fetchProfiles();
      }
    } catch (err: any) {
      console.error(err);
      showToast('Creation Failed', err.response?.data?.message || 'Failed to create profile.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProfile) return;
    setSubmitting(true);
    try {
      const payload = { name, downloadSpeed, uploadSpeed, mikrotikQueueName };
      const res = await api.put(`/bandwidth-profiles/${selectedProfile.id}`, payload);

      if (res.data && res.data.success) {
        showToast('Profile Updated', `Profile '${name}' updated successfully.`, 'success');
        setEditOpen(false);
        fetchProfiles();
      }
    } catch (err: any) {
      console.error(err);
      showToast('Update Failed', err.response?.data?.message || 'Failed to update profile.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteSubmit = async () => {
    if (!selectedProfile) return;
    setSubmitting(true);
    try {
      const res = await api.delete(`/bandwidth-profiles/${selectedProfile.id}`);
      if (res.data && res.data.success) {
        showToast('Profile Deleted', `Profile '${selectedProfile.name}' deleted.`, 'success');
        setDeleteOpen(false);
        fetchProfiles();
      }
    } catch (err: any) {
      console.error(err);
      showToast('Delete Failed', err.response?.data?.message || 'Failed to delete profile.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <SEOHead 
        title="Bandwidth Profiles & Queues | DeRoyal Hotspot OS"
        description="Configure MikroTik user speed rate limits, download/upload queues, and QoS profiles."
        canonicalPath="/admin/profiles"
      />

      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Bandwidth Profiles
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Configure MikroTik user speed rate limits & queues
          </p>
        </div>

        <button
          onClick={openCreateModal}
          className="min-h-[44px] px-4 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-blue-600/20 flex items-center gap-2 transition-all"
        >
          <Plus size={16} />
          <span>Create Speed Profile</span>
        </button>
      </div>

      {/* Profiles Card Grid */}
      {loading ? (
        <div className="py-12 text-center text-slate-400 font-medium">Loading bandwidth profiles...</div>
      ) : profiles.length === 0 ? (
        <Card className="py-12 text-center text-slate-500">No bandwidth profiles found.</Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {profiles.map((prof) => (
            <Card key={prof.id} hoverEffect className="space-y-4 flex flex-col justify-between">
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="p-3 rounded-xl bg-blue-500/10 text-blue-500">
                    <Network size={22} />
                  </div>
                  <div>
                    <h3 className="font-bold text-base text-slate-900 dark:text-white">{prof.name}</h3>
                    <span className="text-[11px] font-mono text-slate-400">Queue: {prof.mikrotikQueueName}</span>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-100 dark:border-slate-800 space-y-2">
                  <div className="flex items-center justify-between text-xs p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/50">
                    <span className="flex items-center gap-1 text-emerald-500 font-semibold">
                      <ArrowDown size={14} /> Download Limit
                    </span>
                    <span className="font-extrabold text-slate-900 dark:text-white font-mono">{prof.downloadSpeed}</span>
                  </div>
                  <div className="flex items-center justify-between text-xs p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/50">
                    <span className="flex items-center gap-1 text-blue-500 font-semibold">
                      <ArrowUp size={14} /> Upload Limit
                    </span>
                    <span className="font-extrabold text-slate-900 dark:text-white font-mono">{prof.uploadSpeed}</span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  onClick={() => openEditModal(prof)}
                  aria-label={`Edit ${prof.name}`}
                  className="flex-1 min-h-[44px] flex items-center justify-center gap-1.5 text-xs font-semibold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl transition-colors"
                >
                  <Edit2 size={14} />
                  <span>Edit Profile</span>
                </button>
                <button
                  onClick={() => openDeleteModal(prof)}
                  aria-label={`Delete ${prof.name}`}
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
      <Modal isOpen={createOpen} onClose={() => setCreateOpen(false)} title="Create Bandwidth Profile">
        <form onSubmit={handleCreateSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Profile Name</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Gold Profile"
              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl py-2.5 px-3 text-sm"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Download Speed</label>
              <input
                type="text"
                required
                value={downloadSpeed}
                onChange={(e) => setDownloadSpeed(e.target.value)}
                placeholder="e.g. 20M"
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl py-2.5 px-3 text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Upload Speed</label>
              <input
                type="text"
                required
                value={uploadSpeed}
                onChange={(e) => setUploadSpeed(e.target.value)}
                placeholder="e.g. 10M"
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl py-2.5 px-3 text-sm"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">MikroTik Queue Name</label>
            <input
              type="text"
              required
              value={mikrotikQueueName}
              onChange={(e) => setMikrotikQueueName(e.target.value)}
              placeholder="e.g. gold_queue"
              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl py-2.5 px-3 text-sm"
            />
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
              {submitting ? 'Creating...' : 'Save Profile'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Edit Modal */}
      <Modal isOpen={editOpen} onClose={() => setEditOpen(false)} title="Edit Bandwidth Profile">
        <form onSubmit={handleEditSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Profile Name</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl py-2.5 px-3 text-sm"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Download Speed</label>
              <input
                type="text"
                required
                value={downloadSpeed}
                onChange={(e) => setDownloadSpeed(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl py-2.5 px-3 text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Upload Speed</label>
              <input
                type="text"
                required
                value={uploadSpeed}
                onChange={(e) => setUploadSpeed(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl py-2.5 px-3 text-sm"
              />
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
              {submitting ? 'Updating...' : 'Update Profile'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation */}
      <Modal isOpen={deleteOpen} onClose={() => setDeleteOpen(false)} title="Confirm Profile Deletion">
        <div className="space-y-4 text-center">
          <p className="text-sm text-slate-600 dark:text-slate-300">
            Are you sure you want to delete profile <strong className="text-slate-900 dark:text-white">{selectedProfile?.name}</strong>?
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
              {submitting ? 'Deleting...' : 'Delete Profile'}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
