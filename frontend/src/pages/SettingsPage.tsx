import React, { useState, useEffect } from 'react';
import { Save, Phone, Mail, Server, Key, RefreshCw, Globe, CheckCircle, Copy, ExternalLink } from 'lucide-react';
import api from '../services/api';
import { Card } from '../components/ui/Card';
import { useToast } from '../contexts/ToastContext';
import { SEOHead } from '../components/SEOHead';

export const SettingsPage: React.FC = () => {
  // System Settings
  const [companyName, setCompanyName] = useState('DeRoyal Hotspot');
  const [supportPhone, setSupportPhone] = useState('+234 701 774 1881');
  const [supportEmail, setSupportEmail] = useState('support@deroyalhotspot.name.ng');
  const [sessionTimeout, setSessionTimeout] = useState('3600');
  const [voucherLength, setVoucherLength] = useState('10');

  // Custom Domain State
  const [customDomain, setCustomDomain] = useState('deroyalhotspot.name.ng');

  // MikroTik Router Settings
  const [routerHost, setRouterHost] = useState('192.168.88.1');
  const [routerPort, setRouterPort] = useState('8728');
  const [routerUsername, setRouterUsername] = useState('admin');
  const [routerPassword, setRouterPassword] = useState('');

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [testingConnection, setTestingConnection] = useState(false);

  const { showToast } = useToast();

  const fetchSettings = async () => {
    setLoading(true);
    try {
      const res = await api.get('/settings');
      if (res.data && res.data.success) {
        const settingsMap = res.data.data;
        if (settingsMap.company_name) setCompanyName(settingsMap.company_name);
        if (settingsMap.support_phone) setSupportPhone(settingsMap.support_phone);
        if (settingsMap.support_email) setSupportEmail(settingsMap.support_email);
        if (settingsMap.session_timeout) setSessionTimeout(String(settingsMap.session_timeout));
        if (settingsMap.voucher_length) setVoucherLength(String(settingsMap.voucher_length));

        if (settingsMap.router_host) setRouterHost(settingsMap.router_host);
        if (settingsMap.router_port) setRouterPort(String(settingsMap.router_port));
        if (settingsMap.router_username) setRouterUsername(settingsMap.router_username);
      }
    } catch (err) {
      console.error(err);
      showToast('Error Loading Settings', 'Could not load system settings.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const handleTestConnection = async () => {
    setTestingConnection(true);
    try {
      const res = await api.post('/router/test', {
        host: routerHost,
        port: parseInt(routerPort, 10),
        username: routerUsername,
        password: routerPassword
      });

      if (res.data && res.data.success) {
        showToast('Connection Successful', `Connected to MikroTik RouterOS (${res.data.data.identity || 'Router'}).`, 'success');
      } else {
        showToast('Connection Failed', res.data.message || 'Unable to connect to router.', 'error');
      }
    } catch (err: any) {
      console.error(err);
      showToast('Connection Failed', err.response?.data?.message || 'Router unreachable.', 'error');
    } finally {
      setTestingConnection(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = {
        company_name: companyName,
        support_phone: supportPhone,
        support_email: supportEmail,
        session_timeout: parseInt(sessionTimeout, 10),
        voucher_length: parseInt(voucherLength, 10),
        router_host: routerHost,
        router_port: parseInt(routerPort, 10),
        router_username: routerUsername,
        ...(routerPassword ? { router_password: routerPassword } : {})
      };

      const res = await api.put('/settings', payload);
      if (res.data && res.data.success) {
        showToast('Settings Saved', 'System & router configuration updated.', 'success');
        setRouterPassword('');
      }
    } catch (err: any) {
      console.error(err);
      showToast('Save Failed', err.response?.data?.message || 'Failed to update settings.', 'error');
    } finally {
      setSaving(false);
    }
  };

  const copyDomainUrl = (url: string) => {
    navigator.clipboard.writeText(url);
    showToast('Copied to Clipboard', url, 'info');
  };

  return (
    <div className="space-y-6 animate-fade-in max-w-4xl">
      <SEOHead 
        title="Network & Custom Domain Settings | DeRoyal Hotspot OS"
        description="Configure MikroTik RouterOS API parameters, custom domain binding, branding, and system defaults."
        canonicalPath="/admin/settings"
      />

      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            System & Network Settings
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Configure custom domain binding, MikroTik RouterOS connection & system defaults
          </p>
        </div>
      </div>

      {loading ? (
        <Card className="py-12 text-center text-slate-400">Loading settings...</Card>
      ) : (
        <form onSubmit={handleSave} className="space-y-6">
          {/* Custom Domain Binding Section */}
          <Card className="p-6 space-y-4 border border-blue-500/30 dark:border-blue-500/20 bg-blue-500/5">
            <div className="flex items-center justify-between pb-3 border-b border-blue-200 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-blue-600 text-white shadow-md shadow-blue-600/20">
                  <Globe size={20} />
                </div>
                <div>
                  <h3 className="font-bold text-base text-slate-900 dark:text-white flex items-center gap-2">
                    <span>Custom Domain Binding</span>
                    <span className="text-[10px] uppercase font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20 flex items-center gap-1">
                      <CheckCircle size={10} /> Active SSL
                    </span>
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Primary domain route & SEO canonical URL structure</p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                  Bound Custom Domain
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={customDomain}
                    onChange={(e) => setCustomDomain(e.target.value)}
                    className="w-full bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-xl py-2.5 px-3.5 text-sm font-mono font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <button
                    type="button"
                    onClick={() => copyDomainUrl(`https://${customDomain}/`)}
                    title="Copy Domain URL"
                    className="p-2.5 rounded-xl bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:text-white hover:bg-blue-600 transition-colors"
                  >
                    <Copy size={16} />
                  </button>
                </div>
              </div>

              <div className="space-y-2 text-xs text-slate-500 dark:text-slate-400 pt-1">
                <p className="font-bold text-slate-700 dark:text-slate-300">SEO & Crawler Endpoints:</p>
                <div className="flex items-center justify-between bg-slate-900/40 p-2 rounded-lg border border-slate-800 font-mono text-[11px]">
                  <span>Sitemap: https://deroyalhotspot.name.ng/sitemap.xml</span>
                  <a href="https://deroyalhotspot.name.ng/sitemap.xml" target="_blank" rel="noreferrer" className="text-blue-400 hover:text-blue-300">
                    <ExternalLink size={12} />
                  </a>
                </div>
                <div className="flex items-center justify-between bg-slate-900/40 p-2 rounded-lg border border-slate-800 font-mono text-[11px]">
                  <span>LLMs: https://deroyalhotspot.name.ng/llms.txt</span>
                  <a href="https://deroyalhotspot.name.ng/llms.txt" target="_blank" rel="noreferrer" className="text-blue-400 hover:text-blue-300">
                    <ExternalLink size={12} />
                  </a>
                </div>
              </div>
            </div>
          </Card>

          {/* MikroTik RouterOS Connection Section */}
          <Card className="p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-blue-500/10 text-blue-500">
                  <Server size={20} />
                </div>
                <div>
                  <h3 className="font-bold text-base text-slate-900 dark:text-white">
                    MikroTik RouterOS API Credentials
                  </h3>
                  <p className="text-xs text-slate-500">Target router IP & socket API connection details</p>
                </div>
              </div>

              <button
                type="button"
                onClick={handleTestConnection}
                disabled={testingConnection}
                className="min-h-[44px] px-3.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold text-xs rounded-xl flex items-center gap-2 transition-colors"
              >
                <RefreshCw size={14} className={testingConnection ? 'animate-spin' : ''} />
                <span>Test Connection</span>
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                  Router IP / Host
                </label>
                <input
                  type="text"
                  required
                  value={routerHost}
                  onChange={(e) => setRouterHost(e.target.value)}
                  placeholder="192.168.88.1"
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl py-3 px-3.5 text-sm text-slate-900 dark:text-white font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                  API Port
                </label>
                <input
                  type="number"
                  required
                  value={routerPort}
                  onChange={(e) => setRouterPort(e.target.value)}
                  placeholder="8728"
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl py-3 px-3.5 text-sm text-slate-900 dark:text-white font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                  API Username
                </label>
                <input
                  type="text"
                  required
                  value={routerUsername}
                  onChange={(e) => setRouterUsername(e.target.value)}
                  placeholder="admin"
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl py-3 px-3.5 text-sm text-slate-900 dark:text-white font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                  API Password (Leave blank to keep existing)
                </label>
                <div className="relative">
                  <input
                    type="password"
                    value={routerPassword}
                    onChange={(e) => setRouterPassword(e.target.value)}
                    placeholder="••••••••••••"
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl py-3 pl-10 pr-3.5 text-sm text-slate-900 dark:text-white font-mono"
                  />
                  <Key size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                </div>
              </div>
            </div>
          </Card>

          {/* System & Portal Branding Section */}
          <Card className="p-6 space-y-4">
            <h3 className="font-bold text-base text-slate-900 dark:text-white pb-3 border-b border-slate-100 dark:border-slate-800">
              Captive Portal Branding & System Parameters
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                  Company / Hotspot Title
                </label>
                <input
                  type="text"
                  required
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl py-3 px-3.5 text-sm text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                  Support Phone Number
                </label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    value={supportPhone}
                    onChange={(e) => setSupportPhone(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl py-3 pl-10 pr-3.5 text-sm text-slate-900 dark:text-white"
                  />
                  <Phone size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                  Support Email Address
                </label>
                <div className="relative">
                  <input
                    type="email"
                    required
                    value={supportEmail}
                    onChange={(e) => setSupportEmail(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl py-3 pl-10 pr-3.5 text-sm text-slate-900 dark:text-white"
                  />
                  <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                  Default Voucher Length
                </label>
                <input
                  type="number"
                  required
                  min="6"
                  max="16"
                  value={voucherLength}
                  onChange={(e) => setVoucherLength(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl py-3 px-3.5 text-sm text-slate-900 dark:text-white"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                Inactive Session Timeout (Seconds)
              </label>
              <input
                type="number"
                required
                min="60"
                value={sessionTimeout}
                onChange={(e) => setSessionTimeout(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl py-3 px-3.5 text-sm text-slate-900 dark:text-white"
              />
            </div>
          </Card>

          <div className="pt-2 flex justify-end">
            <button
              type="submit"
              disabled={saving}
              className="min-h-[48px] px-6 bg-blue-600 hover:bg-blue-500 text-white font-bold text-sm rounded-xl shadow-lg shadow-blue-600/20 flex items-center gap-2 transition-all"
            >
              <Save size={16} />
              <span>{saving ? 'Saving Configurations...' : 'Save All Configurations'}</span>
            </button>
          </div>
        </form>
      )}
    </div>
  );
};
