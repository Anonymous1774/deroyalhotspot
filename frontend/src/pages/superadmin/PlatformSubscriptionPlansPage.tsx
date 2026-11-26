import { useState, useEffect, useCallback } from 'react';
import { Plus, CreditCard, Edit2, Trash2, AlertCircle, Loader2 } from 'lucide-react';
import platformApi from '../../services/platformApi';

interface SubPlan {
  id: string;
  name: string;
  price: number;
  billingCycle: string;
  routerLimit: number;
  staffLimit: number;
  trialDays: number;
  isActive: boolean;
  description?: string;
}

export function PlatformSubscriptionPlansPage() {
  const [plans, setPlans] = useState<SubPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingPlan, setEditingPlan] = useState<SubPlan | null>(null);
  const [form, setForm] = useState({ name: '', price: 0, billingCycle: 'MONTHLY', routerLimit: 5, staffLimit: 3, trialDays: 14, description: '', isActive: true });
  const [saving, setSaving] = useState(false);

  const load = useCallback(() => {
    setLoading(true);
    platformApi.get('/platform/subscription-plans')
      .then(r => setPlans(r.data.data || []))
      .catch(() => setError('Failed to load subscription plans.'))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { load(); }, [load]);

  const resetForm = () => { setForm({ name: '', price: 0, billingCycle: 'MONTHLY', routerLimit: 5, staffLimit: 3, trialDays: 14, description: '', isActive: true }); setEditingPlan(null); setShowForm(false); };
  const openEdit = (p: SubPlan) => { setEditingPlan(p); setForm({ name: p.name, price: p.price, billingCycle: p.billingCycle, routerLimit: p.routerLimit, staffLimit: p.staffLimit, trialDays: p.trialDays, description: p.description || '', isActive: p.isActive }); setShowForm(true); };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (editingPlan) {
        await platformApi.put(`/platform/subscription-plans/${editingPlan.id}`, form);
      } else {
        await platformApi.post('/platform/subscription-plans', form);
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
    if (!confirm(`Delete subscription plan '${name}'?`)) return;
    try {
      await platformApi.delete(`/platform/subscription-plans/${id}`);
      load();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to delete plan.');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-navy-900">Subscription Plans</h1>
          <p className="text-sm text-slate-500 mt-1">Manage DHOS SaaS subscription tiers for ISP operators</p>
        </div>
        <button onClick={() => setShowForm(true)}
          className="flex items-center gap-2 bg-wire-blue text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-wire-blue/90 transition-colors">
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
          <h2 className="font-semibold text-navy-900">{editingPlan ? 'Edit Plan' : 'Create Subscription Plan'}</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              { name: 'name', label: 'Plan Name *', placeholder: 'Starter Plan', required: true },
              { name: 'price', label: 'Monthly Price (₦) *', placeholder: '5000', required: true, type: 'number' },
              { name: 'routerLimit', label: 'Router Limit (-1 = unlimited)', placeholder: '5', type: 'number' },
              { name: 'staffLimit', label: 'Staff Limit (-1 = unlimited)', placeholder: '3', type: 'number' },
              { name: 'trialDays', label: 'Trial Days', placeholder: '14', type: 'number' },
            ].map(f => (
              <div key={f.name}>
                <label className="block text-xs font-medium text-slate-600 mb-1">{f.label}</label>
                <input type={f.type || 'text'} required={f.required} placeholder={f.placeholder}
                  value={(form as any)[f.name]} onChange={e => setForm(p => ({ ...p, [f.name]: f.type === 'number' ? Number(e.target.value) : e.target.value }))}
                  className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-wire-blue/30 focus:border-wire-blue" />
              </div>
            ))}
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Billing Cycle</label>
              <select value={form.billingCycle} onChange={e => setForm(p => ({ ...p, billingCycle: e.target.value }))}
                className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-wire-blue/30 focus:border-wire-blue">
                <option value="MONTHLY">Monthly</option>
                <option value="QUARTERLY">Quarterly</option>
                <option value="ANNUAL">Annual</option>
              </select>
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">Description</label>
            <textarea value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))}
              rows={2} placeholder="Plan description for ISPs…"
              className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-wire-blue/30 focus:border-wire-blue resize-none" />
          </div>
          <div className="flex items-center gap-2">
            <input type="checkbox" id="isActive" checked={form.isActive} onChange={e => setForm(p => ({ ...p, isActive: e.target.checked }))} className="rounded" />
            <label htmlFor="isActive" className="text-sm text-slate-600">Plan is publicly available</label>
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
        <div className="text-center py-16"><Loader2 className="w-8 h-8 animate-spin text-slate-400 mx-auto" /></div>
      ) : plans.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-xl border border-dashed border-slate-200">
          <CreditCard className="w-10 h-10 text-slate-300 mx-auto mb-3" />
          <p className="text-sm font-medium text-slate-600">No subscription plans created</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {plans.map(plan => (
            <div key={plan.id} className="bg-white rounded-xl border border-slate-100 p-5 relative overflow-hidden">
              <div className="absolute top-0 left-0 w-1 h-full bg-wire-blue" />
              <div className="pl-2">
                <div className="flex items-start justify-between mb-2">
                  <h3 className="font-semibold text-navy-900">{plan.name}</h3>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${plan.isActive ? 'bg-green-50 text-green-700' : 'bg-slate-100 text-slate-500'}`}>
                    {plan.isActive ? 'Active' : 'Inactive'}
                  </span>
                </div>
                <p className="text-2xl font-bold text-wire-blue">₦{plan.price.toLocaleString()}<span className="text-sm font-normal text-slate-400">/{plan.billingCycle.toLowerCase()}</span></p>
                {plan.description && <p className="text-xs text-slate-400 mt-1">{plan.description}</p>}
                <div className="mt-3 space-y-1 text-xs text-slate-500">
                  <p>Routers: {plan.routerLimit === -1 ? 'Unlimited' : plan.routerLimit}</p>
                  <p>Staff: {plan.staffLimit === -1 ? 'Unlimited' : plan.staffLimit}</p>
                  <p>Trial: {plan.trialDays} days</p>
                </div>
                <div className="flex gap-2 mt-4">
                  <button onClick={() => openEdit(plan)} className="flex items-center gap-1 text-xs text-slate-500 hover:text-wire-blue transition-colors">
                    <Edit2 className="w-3 h-3" /> Edit
                  </button>
                  <button onClick={() => handleDelete(plan.id, plan.name)} className="flex items-center gap-1 text-xs text-slate-500 hover:text-red-500 transition-colors">
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
