import { useState, useEffect, useCallback } from 'react';
import { Plus, Users, Shield, Trash2, AlertCircle, Loader2 } from 'lucide-react';
import ispApi from '../../services/ispApi';
import { useIspAuth } from '../../contexts/isp/IspAuthContext';

interface StaffMember {
  id: string;
  fullName: string;
  email: string;
  role: string;
  createdAt: string;
  user?: { email: string };
}

const ROLES = ['ADMIN', 'NETWORK_MANAGER', 'FINANCE_MANAGER', 'SUPPORT_AGENT'];

export function IspStaffPage() {
  useIspAuth();
  const [staff, setStaff] = useState<StaffMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ fullName: '', email: '', password: '', role: 'SUPPORT_AGENT' });
  const [saving, setSaving] = useState(false);

  const load = useCallback(() => {
    setLoading(true);
    ispApi.get('/tenants/me/staff')
      .then(r => setStaff(r.data.data || []))
      .catch(() => setError('Failed to load staff.'))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await ispApi.post('/tenants/me/staff', form);
      setForm({ fullName: '', email: '', password: '', role: 'SUPPORT_AGENT' });
      setShowForm(false);
      load();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to add staff member.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Remove staff member '${name}'?`)) return;
    try {
      await ispApi.delete(`/tenants/me/staff/${id}`);
      load();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to remove staff member.');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-navy-900">Staff Management</h1>
          <p className="text-sm text-slate-500 mt-1">Manage your team members and their roles</p>
        </div>
        <button onClick={() => setShowForm(true)}
          className="flex items-center gap-2 bg-wire-orange text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-wire-orange/90 transition-colors">
          <Plus className="w-4 h-4" /> Add Staff
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
          <h2 className="font-semibold text-navy-900">Add Staff Member</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Full Name *</label>
              <input required value={form.fullName} onChange={e => setForm(p => ({ ...p, fullName: e.target.value }))}
                placeholder="Jane Smith"
                className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-wire-blue/30 focus:border-wire-blue" />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Email Address *</label>
              <input required type="email" value={form.email} onChange={e => setForm(p => ({ ...p, email: e.target.value }))}
                placeholder="jane@example.com"
                className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-wire-blue/30 focus:border-wire-blue" />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Password *</label>
              <input required type="password" value={form.password} onChange={e => setForm(p => ({ ...p, password: e.target.value }))}
                placeholder="Minimum 8 characters"
                className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-wire-blue/30 focus:border-wire-blue" />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Role *</label>
              <select value={form.role} onChange={e => setForm(p => ({ ...p, role: e.target.value }))}
                className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-wire-blue/30 focus:border-wire-blue">
                {ROLES.map(r => <option key={r} value={r}>{r.replace(/_/g, ' ')}</option>)}
              </select>
            </div>
          </div>
          <div className="flex gap-3 pt-2">
            <button type="submit" disabled={saving}
              className="flex items-center gap-2 bg-navy-900 text-white px-5 py-2 rounded-lg text-sm font-medium hover:bg-navy-800 disabled:opacity-50 transition-colors">
              {saving && <Loader2 className="w-4 h-4 animate-spin" />} Add Staff Member
            </button>
            <button type="button" onClick={() => setShowForm(false)}
              className="px-5 py-2 rounded-lg text-sm font-medium border border-slate-200 hover:bg-slate-50 transition-colors">Cancel</button>
          </div>
        </form>
      )}

      {loading ? (
        <div className="text-center py-16 text-slate-400"><Loader2 className="w-8 h-8 animate-spin mx-auto" /></div>
      ) : staff.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-xl border border-dashed border-slate-200">
          <Users className="w-10 h-10 text-slate-300 mx-auto mb-3" />
          <p className="text-sm font-medium text-slate-600">No staff members yet</p>
          <p className="text-xs text-slate-400 mt-1">Add team members to help manage your hotspot business.</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-slate-100 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 border-b border-slate-100">
              <tr>
                {['Name', 'Email', 'Role', 'Added', 'Actions'].map(h => (
                  <th key={h} className="text-left text-xs font-medium text-slate-500 uppercase tracking-wide px-4 py-3">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {staff.map(s => (
                <tr key={s.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-full bg-wire-blue/10 flex items-center justify-center text-wire-blue text-xs font-bold">
                        {s.fullName.charAt(0).toUpperCase()}
                      </div>
                      <span className="font-medium text-navy-900">{s.fullName}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-slate-600">{s.email}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1">
                      <Shield className="w-3 h-3 text-wire-blue" />
                      <span className="text-xs bg-blue-50 text-wire-blue px-2 py-0.5 rounded-full font-medium">
                        {s.role.replace(/_/g, ' ')}
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-slate-500 text-xs">{new Date(s.createdAt).toLocaleDateString()}</td>
                  <td className="px-4 py-3">
                    <button onClick={() => handleDelete(s.id, s.fullName)}
                      className="text-slate-400 hover:text-red-500 transition-colors" title="Remove">
                      <Trash2 className="w-4 h-4" />
                    </button>
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
