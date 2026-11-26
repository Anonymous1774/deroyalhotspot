import { useState, useEffect } from 'react';
import { Settings, Save, Loader2, AlertCircle } from 'lucide-react';
import ispApi from '../../services/ispApi';
import { useIspAuth } from '../../contexts/isp/IspAuthContext';

export function IspSettingsPage() {
  const { tenant, fetchProfile } = useIspAuth();
  const [form, setForm] = useState({
    businessName: '',
    businessEmail: '',
    businessPhone: '',
    businessAddress: '',
    website: '',
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    if (tenant) {
      setForm({
        businessName: tenant.businessName || '',
        businessEmail: tenant.businessEmail || '',
        businessPhone: tenant.businessPhone || '',
        businessAddress: tenant.businessAddress || '',
        website: tenant.website || '',
      });
    }
  }, [tenant]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    setSuccess('');
    try {
      await ispApi.put('/tenants/me', form);
      await fetchProfile();
      setSuccess('Business settings updated successfully.');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to update settings.');
    } finally {
      setSaving(false);
    }
  };

  const fields = [
    { name: 'businessName', label: 'Business Name', placeholder: 'De Royal Hotspot', required: true },
    { name: 'businessEmail', label: 'Business Email', placeholder: 'info@example.com', type: 'email' },
    { name: 'businessPhone', label: 'Business Phone', placeholder: '+234 700 000 0000' },
    { name: 'businessAddress', label: 'Business Address', placeholder: 'Your location' },
    { name: 'website', label: 'Website', placeholder: 'https://yourwebsite.com' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Settings className="w-6 h-6 text-wire-blue" />
        <div>
          <h1 className="text-2xl font-bold text-navy-900">Business Settings</h1>
          <p className="text-sm text-slate-500 mt-0.5">Update your business profile information</p>
        </div>
      </div>

      <div className="max-w-2xl">
        <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-slate-100 p-6 space-y-5">
          {error && (
            <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-3 text-sm">
              <AlertCircle className="w-4 h-4 shrink-0" />{error}
            </div>
          )}
          {success && (
            <div className="bg-green-50 border border-green-200 text-green-700 rounded-lg px-4 py-3 text-sm">{success}</div>
          )}

          {fields.map(f => (
            <div key={f.name}>
              <label className="block text-xs font-medium text-slate-600 mb-1">{f.label}{f.required && ' *'}</label>
              <input
                type={f.type || 'text'}
                required={f.required}
                value={(form as any)[f.name]}
                onChange={e => setForm(p => ({ ...p, [f.name]: e.target.value }))}
                placeholder={f.placeholder}
                className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-wire-blue/30 focus:border-wire-blue"
              />
            </div>
          ))}

          <div className="pt-2">
            <button type="submit" disabled={saving}
              className="flex items-center gap-2 bg-navy-900 text-white px-5 py-2.5 rounded-lg text-sm font-medium hover:bg-navy-800 disabled:opacity-50 transition-colors">
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
