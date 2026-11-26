import { useState, useEffect, useCallback } from 'react';
import { Plus, Zap, Edit2, Trash2, AlertCircle, Loader2 } from 'lucide-react';
import ispApi from '../../services/ispApi';

interface Profile {
  id: string;
  name: string;
  downloadSpeed: string;
  uploadSpeed: string;
  mikrotikQueueName: string;
  status: string;
  createdAt: string;
}

export function IspBandwidthProfilesPage() {
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingProfile, setEditingProfile] = useState<Profile | null>(null);
  const [form, setForm] = useState({ name: '', downloadSpeed: '10M', uploadSpeed: '10M', mikrotikQueueName: '', status: 'ACTIVE' });
  const [saving, setSaving] = useState(false);

  const load = useCallback(() => {
    setLoading(true);
    ispApi.get('/isp/profiles')
      .then(r => setProfiles(r.data.data || []))
      .catch(() => setError('Failed to load bandwidth profiles.'))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { load(); }, [load]);

  const resetForm = () => {
    setForm({ name: '', downloadSpeed: '10M', uploadSpeed: '10M', mikrotikQueueName: '', status: 'ACTIVE' });
    setEditingProfile(null);
    setShowForm(false);
  };

  const openEdit = (p: Profile) => {
    setEditingProfile(p);
    setForm({ name: p.name, downloadSpeed: p.downloadSpeed, uploadSpeed: p.uploadSpeed, mikrotikQueueName: p.mikrotikQueueName, status: p.status });
    setShowForm(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (editingProfile) {
        await ispApi.put(`/isp/profiles/${editingProfile.id}`, form);
      } else {
        await ispApi.post('/isp/profiles', form);
      }
      resetForm();
      load();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to save profile.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Delete bandwidth profile '${name}'?`)) return;
    try {
      await ispApi.delete(`/isp/profiles/${id}`);
      load();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to delete profile.');
    }
  };

  const formFields = [
    { name: 'name', label: 'Profile Name *', placeholder: 'Standard 10Mbps', required: true },
    { name: 'downloadSpeed', label: 'Download Speed *', placeholder: '10M', required: true },
    { name: 'uploadSpeed', label: 'Upload Speed *', placeholder: '5M', required: true },
    { name: 'mikrotikQueueName', label: 'MikroTik Queue Name *', placeholder: 'hotspot-10m', required: true },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-navy-900">Bandwidth Profiles</h1>
          <p className="text-sm text-slate-500 mt-1">Configure speed profiles linked to MikroTik queues</p>
        </div>
        <button onClick={() => setShowForm(true)}
          className="flex items-center gap-2 bg-wire-orange text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-wire-orange/90 transition-colors">
          <Plus className="w-4 h-4" /> New Profile
        </button>
      </div>

      {error && (
        <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-3 text-sm">
          <AlertCircle className="w-4 h-4 shrink-0" />{error}
          <button onClick={() => setError('')} className="ml-auto">✕</button>
        </div>
      )}

      {showForm && (
        <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-slate-200 p-6 space-y-4">
          <h2 className="font-semibold text-navy-900">{editingProfile ? 'Edit Bandwidth Profile' : 'Create Bandwidth Profile'}</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {formFields.map(f => (
              <div key={f.name}>
                <label className="block text-xs font-medium text-slate-600 mb-1">{f.label}</label>
                <input required={f.required} value={(form as any)[f.name]}
                  onChange={e => setForm(p => ({ ...p, [f.name]: e.target.value }))}
                  placeholder={f.placeholder}
                  className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-wire-blue/30 focus:border-wire-blue" />
              </div>
            ))}
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Status</label>
              <select value={form.status} onChange={e => setForm(p => ({ ...p, status: e.target.value }))}
                className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-wire-blue/30 focus:border-wire-blue">
                <option value="ACTIVE">Active</option>
                <option value="INACTIVE">Inactive</option>
              </select>
            </div>
          </div>
          <div className="flex gap-3 pt-2">
            <button type="submit" disabled={saving}
              className="flex items-center gap-2 bg-navy-900 text-white px-5 py-2 rounded-lg text-sm font-medium hover:bg-navy-800 disabled:opacity-50 transition-colors">
              {saving && <Loader2 className="w-4 h-4 animate-spin" />}
              {editingProfile ? 'Update Profile' : 'Create Profile'}
            </button>
            <button type="button" onClick={resetForm}
              className="px-5 py-2 rounded-lg text-sm font-medium border border-slate-200 hover:bg-slate-50 transition-colors">Cancel</button>
          </div>
        </form>
      )}

      {loading ? (
        <div className="text-center py-16 text-slate-400"><Loader2 className="w-8 h-8 animate-spin mx-auto" /></div>
      ) : profiles.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-xl border border-dashed border-slate-200">
          <Zap className="w-10 h-10 text-slate-300 mx-auto mb-3" />
          <p className="text-sm font-medium text-slate-600">No bandwidth profiles configured</p>
          <button onClick={() => setShowForm(true)}
            className="mt-4 inline-flex items-center gap-2 bg-wire-orange text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-wire-orange/90 transition-colors">
            <Plus className="w-4 h-4" /> Create First Profile
          </button>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-slate-100 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 border-b border-slate-100">
              <tr>
                {['Name', 'Download', 'Upload', 'Queue Name', 'Status', 'Actions'].map(h => (
                  <th key={h} className="text-left text-xs font-medium text-slate-500 uppercase tracking-wide px-4 py-3">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {profiles.map(p => (
                <tr key={p.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-4 py-3 font-medium text-navy-900">{p.name}</td>
                  <td className="px-4 py-3 text-wire-green font-mono text-xs font-semibold">{p.downloadSpeed} ↓</td>
                  <td className="px-4 py-3 text-wire-orange font-mono text-xs font-semibold">{p.uploadSpeed} ↑</td>
                  <td className="px-4 py-3 text-slate-500 font-mono text-xs">{p.mikrotikQueueName}</td>
                  <td className="px-4 py-3">
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${p.status === 'ACTIVE' ? 'bg-green-50 text-wire-green' : 'bg-slate-100 text-slate-500'}`}>
                      {p.status}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      <button onClick={() => openEdit(p)}
                        className="text-slate-400 hover:text-wire-blue transition-colors"><Edit2 className="w-4 h-4" /></button>
                      <button onClick={() => handleDelete(p.id, p.name)}
                        className="text-slate-400 hover:text-red-500 transition-colors"><Trash2 className="w-4 h-4" /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
