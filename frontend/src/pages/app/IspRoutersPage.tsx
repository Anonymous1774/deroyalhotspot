import { useState, useEffect, useCallback } from 'react';
import {
  Plus, Server, Edit2, Trash2, Power,
  PowerOff, TestTube, AlertCircle, Loader2
} from 'lucide-react';
import ispApi from '../../services/ispApi';

interface Router {
  id: string;
  name: string;
  host: string;
  apiPort: number;
  username: string;
  status: string;
  enabled: boolean;
  routerIdentity?: string;
  latencyMs?: number;
  lastConnected?: string;
  _count?: { vouchers: number; hotspotSessions: number };
}

const STATUS_COLORS: Record<string, string> = {
  ONLINE: 'bg-wire-green text-white',
  OFFLINE: 'bg-red-500 text-white',
  DEGRADED: 'bg-amber-500 text-white',
  UNKNOWN: 'bg-slate-400 text-white',
};

export function IspRoutersPage() {
  const [routers, setRouters] = useState<Router[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingRouter, setEditingRouter] = useState<Router | null>(null);
  const [form, setForm] = useState({ name: '', host: '', apiPort: 8728, apiSsl: false, username: 'admin', password: '', description: '', enabled: true });
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState<string | null>(null);

  const load = useCallback(() => {
    setLoading(true);
    ispApi.get('/isp/routers')
      .then(r => setRouters(r.data.data || []))
      .catch(() => setError('Failed to load routers.'))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { load(); }, [load]);

  const resetForm = () => {
    setForm({ name: '', host: '', apiPort: 8728, apiSsl: false, username: 'admin', password: '', description: '', enabled: true });
    setEditingRouter(null);
    setShowForm(false);
  };

  const openEdit = (r: Router) => {
    setEditingRouter(r);
    setForm({ name: r.name, host: r.host, apiPort: r.apiPort, apiSsl: false, username: r.username, password: '', description: '', enabled: r.enabled });
    setShowForm(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (editingRouter) {
        await ispApi.patch(`/isp/routers/${editingRouter.id}`, form);
      } else {
        await ispApi.post('/isp/routers', form);
      }
      resetForm();
      load();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to save router.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Delete router '${name}'? This cannot be undone.`)) return;
    try {
      await ispApi.delete(`/isp/routers/${id}`);
      load();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to delete router.');
    }
  };

  const handleToggle = async (id: string, enabled: boolean) => {
    try {
      await ispApi.post(`/isp/routers/${id}/${enabled ? 'disable' : 'enable'}`);
      load();
    } catch {
      setError('Failed to toggle router status.');
    }
  };

  const handleTest = async (id: string) => {
    setTesting(id);
    try {
      const r = await ispApi.post(`/isp/routers/${id}/test-connection`);
      alert(`Connection test: ${r.data.success ? `✅ Online (${r.data.data?.latencyMs}ms)` : '❌ Failed'}`);
    } catch {
      alert('❌ Connection test failed.');
    } finally {
      setTesting(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-navy-900">Routers</h1>
          <p className="text-sm text-slate-500 mt-1">Manage your MikroTik RouterOS devices</p>
        </div>
        <button onClick={() => setShowForm(true)}
          className="flex items-center gap-2 bg-wire-orange text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-wire-orange/90 transition-colors">
          <Plus className="w-4 h-4" /> Add Router
        </button>
      </div>

      {error && (
        <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-3 text-sm">
          <AlertCircle className="w-4 h-4 shrink-0" />
          {error}
          <button onClick={() => setError('')} className="ml-auto text-red-500 hover:text-red-700">✕</button>
        </div>
      )}

      {/* Add/Edit Form */}
      {showForm && (
        <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-slate-200 p-6 space-y-4">
          <h2 className="font-semibold text-navy-900">{editingRouter ? 'Edit Router' : 'Add New Router'}</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              { name: 'name', label: 'Router Name', placeholder: 'Main Router', required: true },
              { name: 'host', label: 'IP Address / Hostname', placeholder: '192.168.88.1', required: true },
              { name: 'username', label: 'API Username', placeholder: 'admin', required: true },
              { name: 'password', label: editingRouter ? 'New Password (leave blank to keep)' : 'Password', placeholder: '••••••', required: !editingRouter },
              { name: 'apiPort', label: 'API Port', placeholder: '8728', required: true, type: 'number' },
              { name: 'description', label: 'Description', placeholder: 'Optional notes' },
            ].map(f => (
              <div key={f.name}>
                <label className="block text-xs font-medium text-slate-600 mb-1">{f.label}</label>
                <input type={f.type || 'text'} required={f.required} placeholder={f.placeholder}
                  value={(form as any)[f.name]} onChange={e => setForm(p => ({ ...p, [f.name]: f.type === 'number' ? Number(e.target.value) : e.target.value }))}
                  className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-wire-blue/30 focus:border-wire-blue" />
              </div>
            ))}
          </div>
          <div className="flex items-center gap-2">
            <input type="checkbox" id="enabled" checked={form.enabled} onChange={e => setForm(p => ({ ...p, enabled: e.target.checked }))} className="rounded" />
            <label htmlFor="enabled" className="text-sm text-slate-600">Enable router immediately</label>
          </div>
          <div className="flex gap-3 pt-2">
            <button type="submit" disabled={saving}
              className="flex items-center gap-2 bg-navy-900 text-white px-5 py-2 rounded-lg text-sm font-medium hover:bg-navy-800 disabled:opacity-50 transition-colors">
              {saving && <Loader2 className="w-4 h-4 animate-spin" />}
              {editingRouter ? 'Update Router' : 'Create Router'}
            </button>
            <button type="button" onClick={resetForm}
              className="px-5 py-2 rounded-lg text-sm font-medium border border-slate-200 hover:bg-slate-50 transition-colors">Cancel</button>
          </div>
        </form>
      )}

      {/* Router List */}
      {loading ? (
        <div className="text-center py-16 text-slate-400">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-2" />
          <p className="text-sm">Loading routers…</p>
        </div>
      ) : routers.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-xl border border-dashed border-slate-200">
          <Server className="w-10 h-10 text-slate-300 mx-auto mb-3" />
          <p className="text-sm font-medium text-slate-600">No routers configured</p>
          <p className="text-xs text-slate-400 mt-1">Add your first MikroTik router to get started.</p>
          <button onClick={() => setShowForm(true)}
            className="mt-4 inline-flex items-center gap-2 bg-wire-orange text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-wire-orange/90 transition-colors">
            <Plus className="w-4 h-4" /> Add Router
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {routers.map(r => (
            <div key={r.id} className="bg-white rounded-xl border border-slate-100 p-5">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-center gap-3 min-w-0">
                  <div className={`w-2 h-2 rounded-full shrink-0 ${r.status === 'ONLINE' ? 'bg-wire-green' : r.status === 'OFFLINE' ? 'bg-red-400' : 'bg-amber-400'}`} />
                  <div className="min-w-0">
                    <p className="font-semibold text-navy-900 truncate">{r.name}</p>
                    <p className="text-xs text-slate-400">{r.host}:{r.apiPort} · {r.username}</p>
                    {r.routerIdentity && <p className="text-xs text-slate-400">{r.routerIdentity}</p>}
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${STATUS_COLORS[r.status] || 'bg-slate-100 text-slate-600'}`}>
                    {r.status}
                  </span>
                  <button onClick={() => handleTest(r.id)} disabled={testing === r.id}
                    className="p-1.5 text-slate-400 hover:text-wire-blue rounded transition-colors" title="Test connection">
                    {testing === r.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <TestTube className="w-4 h-4" />}
                  </button>
                  <button onClick={() => handleToggle(r.id, r.enabled)}
                    className="p-1.5 text-slate-400 hover:text-navy-800 rounded transition-colors" title={r.enabled ? 'Disable' : 'Enable'}>
                    {r.enabled ? <PowerOff className="w-4 h-4" /> : <Power className="w-4 h-4" />}
                  </button>
                  <button onClick={() => openEdit(r)}
                    className="p-1.5 text-slate-400 hover:text-wire-blue rounded transition-colors" title="Edit">
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button onClick={() => handleDelete(r.id, r.name)}
                    className="p-1.5 text-slate-400 hover:text-red-500 rounded transition-colors" title="Delete">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
              <div className="mt-3 flex gap-4 text-xs text-slate-500">
                <span>{r._count?.vouchers ?? 0} vouchers</span>
                <span>{r._count?.hotspotSessions ?? 0} active sessions</span>
                {r.latencyMs && <span>{r.latencyMs}ms latency</span>}
                {r.lastConnected && <span>Last seen {new Date(r.lastConnected).toLocaleDateString()}</span>}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
