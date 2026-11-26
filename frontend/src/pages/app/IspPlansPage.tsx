import { useState, useEffect, useCallback } from 'react';
import { Plus, Package, Edit2, Trash2, AlertCircle, Loader2 } from 'lucide-react';
import ispApi from '../../services/ispApi';

interface Plan {
  id: string;
  name: string;
  price: number;
  duration: number;
  durationUnit: string;
  status: string;
  bandwidthProfile?: { name: string; downloadSpeed: string; uploadSpeed: string };
}

interface Profile { id: string; name: string; downloadSpeed: string; uploadSpeed: string; status: string; }

export function IspPlansPage() {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingPlan, setEditingPlan] = useState<Plan | null>(null);
  const [form, setForm] = useState({ name: '', price: 0, duration: 1, durationUnit: 'hours', bandwidthProfile: '', status: 'ACTIVE', description: '' });
  const [saving, setSaving] = useState(false);

  const load = useCallback(() => {
    setLoading(true);
    Promise.all([
      ispApi.get('/isp/plans'),
      ispApi.get('/isp/profiles')
    ]).then(([p, pr]) => {
      setPlans(p.data.data || []);
      setProfiles(pr.data.data || []);
    }).catch(() => setError('Failed to load plans.')).finally(() => setLoading(false));
  }, []);

  useEffect(() => { load(); }, [load]);

  const resetForm = () => {
    setForm({ name: '', price: 0, duration: 1, durationUnit: 'hours', bandwidthProfile: '', status: 'ACTIVE', description: '' });
    setEditingPlan(null);
    setShowForm(false);
  };

  const openEdit = (p: Plan) => {
    setEditingPlan(p);
    setForm({ name: p.name, price: p.price, duration: p.duration, durationUnit: p.durationUnit, bandwidthProfile: p.bandwidthProfile?.name || '', status: p.status, description: '' });
    setShowForm(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (editingPlan) {
        await ispApi.put(`/isp/plans/${editingPlan.id}`, form);
      } else {
        await ispApi.post('/isp/plans', form);
      }
      resetForm();
      load();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to save plan.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Delete plan '${name}'?`)) return;
    try {
      await ispApi.delete(`/isp/plans/${id}`);
      load();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to delete plan.');
    }
  };

  const durationLabel = (d: number, u: string) => `${d} ${u}`;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-navy-900">Internet Plans</h1>
          <p className="text-sm text-slate-500 mt-1">Define packages your customers can purchase</p>
        </div>
        <button onClick={() => setShowForm(true)}
          className="flex items-center gap-2 bg-wire-orange text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-wire-orange/90 transition-colors">
          <Plus className="w-4 h-4" /> New Plan
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
          <h2 className="font-semibold text-navy-900">{editingPlan ? 'Edit Plan' : 'Create New Plan'}</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Plan Name *</label>
              <input required value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
                placeholder="e.g. 1 Hour Browsing"
                className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-wire-blue/30 focus:border-wire-blue" />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Price (₦) *</label>
              <input required type="number" min="0" value={form.price} onChange={e => setForm(p => ({ ...p, price: Number(e.target.value) }))}
                className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-wire-blue/30 focus:border-wire-blue" />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Duration *</label>
              <div className="flex gap-2">
                <input required type="number" min="1" value={form.duration} onChange={e => setForm(p => ({ ...p, duration: Number(e.target.value) }))}
                  className="w-24 border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-wire-blue/30 focus:border-wire-blue" />
                <select value={form.durationUnit} onChange={e => setForm(p => ({ ...p, durationUnit: e.target.value }))}
                  className="flex-1 border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-wire-blue/30 focus:border-wire-blue">
                  <option value="minutes">Minutes</option>
                  <option value="hours">Hours</option>
                  <option value="days">Days</option>
                </select>
              </div>
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Bandwidth Profile *</label>
              <select required value={form.bandwidthProfile} onChange={e => setForm(p => ({ ...p, bandwidthProfile: e.target.value }))}
                className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-wire-blue/30 focus:border-wire-blue">
                <option value="">Select a profile…</option>
                {profiles.filter(p => p.status === 'ACTIVE').map(p => (
                  <option key={p.id} value={p.name}>{p.name} ({p.downloadSpeed} ↓ / {p.uploadSpeed} ↑)</option>
                ))}
              </select>
            </div>
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
              {editingPlan ? 'Update Plan' : 'Create Plan'}
            </button>
            <button type="button" onClick={resetForm}
              className="px-5 py-2 rounded-lg text-sm font-medium border border-slate-200 hover:bg-slate-50 transition-colors">Cancel</button>
          </div>
        </form>
      )}

      {loading ? (
        <div className="text-center py-16 text-slate-400">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-2" />
        </div>
      ) : plans.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-xl border border-dashed border-slate-200">
          <Package className="w-10 h-10 text-slate-300 mx-auto mb-3" />
          <p className="text-sm font-medium text-slate-600">No plans created yet</p>
          <button onClick={() => setShowForm(true)}
            className="mt-4 inline-flex items-center gap-2 bg-wire-orange text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-wire-orange/90 transition-colors">
            <Plus className="w-4 h-4" /> Create First Plan
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {plans.map(plan => (
            <div key={plan.id} className="bg-white rounded-xl border border-slate-100 p-5 relative overflow-hidden">
              <div className="absolute top-0 left-0 w-1 h-full bg-wire-orange" />
              <div className="pl-2">
                <div className="flex items-start justify-between mb-2">
                  <h3 className="font-semibold text-navy-900">{plan.name}</h3>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${plan.status === 'ACTIVE' ? 'bg-green-50 text-wire-green' : 'bg-slate-100 text-slate-500'}`}>
                    {plan.status}
                  </span>
                </div>
                <p className="text-2xl font-bold text-wire-orange">₦{plan.price.toLocaleString()}</p>
                <p className="text-xs text-slate-500 mt-1">Valid for {durationLabel(plan.duration, plan.durationUnit)}</p>
                {plan.bandwidthProfile && (
                  <p className="text-xs text-slate-400 mt-1">
                    {plan.bandwidthProfile.downloadSpeed} ↓ / {plan.bandwidthProfile.uploadSpeed} ↑
                  </p>
                )}
                <div className="flex gap-2 mt-4">
                  <button onClick={() => openEdit(plan)}
                    className="flex items-center gap-1 text-xs text-slate-500 hover:text-wire-blue transition-colors">
                    <Edit2 className="w-3 h-3" /> Edit
                  </button>
                  <button onClick={() => handleDelete(plan.id, plan.name)}
                    className="flex items-center gap-1 text-xs text-slate-500 hover:text-red-500 transition-colors">
                    <Trash2 className="w-3 h-3" /> Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
