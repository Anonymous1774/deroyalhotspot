import React, { useState, useEffect } from 'react';
import {
  CheckCircle, AlertCircle, Phone, Mail, ChevronRight,
  ClipboardCheck, Sparkles, Clock, Zap, Wifi
} from 'lucide-react';
import api from '../services/api';
import { Plan } from '../types';
import { SEOHead } from '../components/SEOHead';

export const CaptivePortalPage: React.FC = () => {
  const [voucherCode, setVoucherCode]       = useState('');
  const [activationStatus, setActivationStatus] = useState<'idle' | 'loading' | 'success' | 'failure'>('idle');
  const [errorMessage, setErrorMessage]     = useState('');
  const [activatedVoucher, setActivatedVoucher] = useState<any>(null);

  // Auto-reauthentication states
  const [checkingDevice, setCheckingDevice]   = useState(true);
  const [reauthenticating, setReauthenticating] = useState(false);

  // RouterOS captive portal query parameters
  const [macAddress, setMacAddress] = useState('');
  const [ipAddress, setIpAddress]   = useState('');
  const [linkLogin, setLinkLogin]   = useState('');
  const [linkOrig, setLinkOrig]     = useState('');
  const [isRedirection, setIsRedirection] = useState(false);

  // Available public plans for display grid
  const [publicPlans, setPublicPlans] = useState<Plan[]>([]);

  useEffect(() => {
    const params     = new URLSearchParams(window.location.search);
    const paramMac   = params.get('mac') || params.get('mac-address') || '';
    const paramIp    = params.get('ip') || '';
    const paramLink  = params.get('link-login') || '';
    const paramOrig  = params.get('link-orig') || '';

    setMacAddress(paramMac);
    setIpAddress(paramIp);
    setLinkLogin(paramLink);
    setLinkOrig(paramOrig);
    if (paramLink) setIsRedirection(true);

    if (paramMac) {
      checkRegisteredDevice(paramMac);
    } else {
      setCheckingDevice(false);
    }

    fetchPublicPlans();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchPublicPlans = async () => {
    try {
      const res = await api.get('/plans');
      if (res.data?.success) setPublicPlans(res.data.data.plans || []);
    } catch {
      // Fallback plans when API not reachable before auth
      setPublicPlans([
        { id: '1', name: '1 Hour', price: 100, duration: 60, durationUnit: 'minutes', bandwidthProfileId: '1', bandwidthProfile: { name: 'Bronze', downloadSpeed: '5M', uploadSpeed: '2M', id: '1', mikrotikQueueName: 'b', status: 'A', createdAt: '', updatedAt: '' } },
        { id: '2', name: '3 Hours', price: 250, duration: 180, durationUnit: 'minutes', bandwidthProfileId: '2', bandwidthProfile: { name: 'Silver', downloadSpeed: '10M', uploadSpeed: '5M', id: '2', mikrotikQueueName: 's', status: 'A', createdAt: '', updatedAt: '' } },
        { id: '3', name: '24 Hours', price: 500, duration: 1, durationUnit: 'days', bandwidthProfileId: '2', bandwidthProfile: { name: 'Silver', downloadSpeed: '10M', uploadSpeed: '5M', id: '3', mikrotikQueueName: 's', status: 'A', createdAt: '', updatedAt: '' } },
        { id: '4', name: '7 Days', price: 2500, duration: 7, durationUnit: 'days', bandwidthProfileId: '3', bandwidthProfile: { name: 'Gold', downloadSpeed: '20M', uploadSpeed: '10M', id: '4', mikrotikQueueName: 'g', status: 'A', createdAt: '', updatedAt: '' } },
      ]);
    }
  };

  const checkRegisteredDevice = async (mac: string) => {
    setCheckingDevice(true);
    try {
      const res = await api.get(`/device/check?mac=${encodeURIComponent(mac)}`);
      if (res.data?.success && res.data.data.isRegistered) {
        handleAutoReauthenticate(mac);
      } else {
        setCheckingDevice(false);
      }
    } catch {
      setCheckingDevice(false);
    }
  };

  const handleAutoReauthenticate = async (mac: string) => {
    setReauthenticating(true);
    try {
      const res = await api.post('/device/reauthenticate', { mac, ip: ipAddress });
      if (res.data?.success) {
        setActivatedVoucher(res.data.data);
        setActivationStatus('success');
      } else {
        setCheckingDevice(false);
      }
    } catch {
      setCheckingDevice(false);
    } finally {
      setReauthenticating(false);
    }
  };

  const handleActivate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!voucherCode.trim()) return;
    setActivationStatus('loading');
    setErrorMessage('');
    try {
      const response = await api.post('/vouchers/activate', {
        code: voucherCode.trim().toUpperCase(),
        macAddress,
        ipAddress,
      });
      if (response.data?.success) {
        setActivatedVoucher(response.data.data);
        setActivationStatus('success');
        if (linkLogin) {
          setTimeout(() => {
            const form = document.createElement('form');
            form.method = 'POST';
            form.action = linkLogin;
            const u = document.createElement('input'); u.type = 'hidden'; u.name = 'username'; u.value = voucherCode.trim().toUpperCase(); form.appendChild(u);
            const d = document.createElement('input'); d.type = 'hidden'; d.name = 'dst';      d.value = linkOrig || 'http://google.com';          form.appendChild(d);
            document.body.appendChild(form);
            form.submit();
          }, 1500);
        }
      } else {
        setErrorMessage(response.data?.message || 'Invalid or expired voucher code.');
        setActivationStatus('failure');
      }
    } catch (err: any) {
      setErrorMessage(err.response?.data?.message || 'Connection error. Please try again.');
      setActivationStatus('failure');
    }
  };

  const handlePasteClipboard = async () => {
    const inputEl = document.getElementById('voucher') as HTMLInputElement;
    try {
      if (navigator.clipboard?.readText) {
        const text = await navigator.clipboard.readText();
        if (text?.trim()) { setVoucherCode(text.trim().toUpperCase()); return; }
      }
      inputEl?.focus(); inputEl?.select();
    } catch {
      inputEl?.focus(); inputEl?.select();
    }
  };

  return (
    <div className="min-h-screen bg-navy-950 text-slate-100 font-sans flex flex-col justify-between relative overflow-hidden selection:bg-wire-orange selection:text-white">
      <SEOHead
        title="De Royal Hotspot | Connect to Wi-Fi"
        description="Activate your voucher and connect to De Royal Hotspot high-speed internet instantly."
        canonicalPath="/connect"
      />

      {/* Ethernet-wire ambient glows */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-3xl h-72 bg-wire-orange/8 blur-3xl rounded-full pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-72 h-72 bg-wire-green/8 blur-3xl rounded-full pointer-events-none" />
      <div className="absolute top-1/3 left-0 w-48 h-48 bg-wire-blue/6 blur-3xl rounded-full pointer-events-none" />

      {/* Wire-colour accent bar at top */}
      <div className="wire-bar h-1 w-full shrink-0" />

      {/* Header */}
      <header className="relative z-10 max-w-lg mx-auto w-full px-4 pt-8 text-center">
        <div className="flex justify-center items-center gap-3 mb-6">
          <div className="w-11 h-11 rounded-2xl bg-wire-orange/15 border border-wire-orange/30 flex items-center justify-center shadow-lg shadow-wire-orange/10">
            <Wifi className="w-6 h-6 text-wire-orange" />
          </div>
          <div className="text-left">
            <p className="text-white font-extrabold text-sm leading-tight">De Royal Hotspot</p>
            <p className="text-slate-500 text-[11px]">deroyalhotspot.name.ng</p>
          </div>
        </div>

        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-wire-green/10 border border-wire-green/20 text-wire-green text-xs font-semibold mb-5">
          <span className="w-2 h-2 rounded-full bg-wire-green animate-pulse" />
          <span>Network Active</span>
        </div>

        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white">
          Connect to Internet
        </h1>
        <p className="text-slate-400 text-sm font-medium mt-2">
          Enter your voucher code for instant high-speed Wi-Fi access
        </p>
      </header>

      {/* Main card */}
      <div className="relative z-10 max-w-lg mx-auto w-full px-4 my-8">
        <div className="bg-navy-900/90 backdrop-blur-xl border border-navy-700/60 rounded-3xl p-6 sm:p-8 shadow-2xl shadow-black/40 space-y-6">

          {/* Loading / re-auth state */}
          {checkingDevice || reauthenticating ? (
            <div className="py-10 text-center space-y-5">
              <div className="relative w-16 h-16 mx-auto">
                <div className="w-16 h-16 rounded-full border-4 border-wire-orange/20 border-t-wire-orange animate-spin" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <Wifi className="w-6 h-6 text-wire-orange" />
                </div>
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">Welcome Back!</h3>
                <p className="text-slate-400 text-xs mt-1">Reconnecting your device to the internet…</p>
              </div>
            </div>

          ) : activationStatus === 'idle' || activationStatus === 'loading' ? (
            <form onSubmit={handleActivate} className="space-y-5">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label htmlFor="voucher" className="block text-xs font-bold text-slate-400 uppercase tracking-wider">
                    Voucher Access Code
                  </label>
                  <span className="text-xs font-mono text-slate-600">{voucherCode.length} / 10</span>
                </div>
                <div className="relative">
                  <input
                    id="voucher"
                    type="text"
                    required
                    maxLength={14}
                    placeholder="e.g. SLV19AKLD2"
                    value={voucherCode}
                    onChange={e => setVoucherCode(e.target.value.toUpperCase())}
                    disabled={activationStatus === 'loading'}
                    className="w-full text-center font-mono text-xl sm:text-2xl font-bold tracking-widest bg-navy-950/80 border border-navy-700 rounded-2xl py-4 px-4 text-white focus:outline-none focus:ring-2 focus:ring-wire-orange/50 focus:border-wire-orange/50 transition-all uppercase placeholder:normal-case placeholder:font-sans placeholder:text-slate-700 placeholder:tracking-normal"
                  />
                  {navigator.clipboard && (
                    <button
                      type="button"
                      onClick={handlePasteClipboard}
                      title="Paste code from clipboard"
                      className="absolute right-3 top-1/2 -translate-y-1/2 min-h-[44px] px-3 flex items-center gap-1 text-xs font-bold text-wire-orange hover:text-orange-300 bg-wire-orange/10 hover:bg-wire-orange/20 rounded-xl transition-colors"
                    >
                      <ClipboardCheck size={14} />
                      <span>Paste</span>
                    </button>
                  )}
                </div>
              </div>

              <button
                type="submit"
                disabled={activationStatus === 'loading' || voucherCode.trim().length === 0}
                className="w-full bg-wire-orange hover:bg-orange-500 disabled:bg-navy-800 disabled:text-slate-600 text-white font-extrabold py-4 px-4 rounded-2xl shadow-lg shadow-wire-orange/25 hover:shadow-orange-500/30 transition-all duration-150 flex items-center justify-center gap-2 text-base min-h-[48px]"
              >
                {activationStatus === 'loading' ? (
                  <>
                    <div className="w-5 h-5 rounded-full border-2 border-white border-t-transparent animate-spin" />
                    <span>Activating…</span>
                  </>
                ) : (
                  <>
                    <Zap size={18} />
                    <span>Connect Now</span>
                  </>
                )}
              </button>
            </form>

          ) : activationStatus === 'success' ? (
            <div className="py-4 text-center space-y-6">
              <div className="w-16 h-16 bg-wire-green/10 rounded-full flex items-center justify-center mx-auto border border-wire-green/30 text-wire-green">
                <CheckCircle size={36} />
              </div>
              <div>
                <h3 className="text-xl font-extrabold text-white">Connected!</h3>
                <p className="text-slate-400 text-xs mt-1">You are now connected to the internet.</p>
              </div>

              <div className="bg-navy-950/80 p-4 rounded-2xl border border-navy-700/60 space-y-2 text-left text-xs font-medium text-slate-300">
                <div className="flex justify-between">
                  <span className="text-slate-500">Voucher Code:</span>
                  <span className="font-mono font-bold text-white">{activatedVoucher?.code || voucherCode.toUpperCase()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Active Plan:</span>
                  <span className="font-bold text-white">{activatedVoucher?.plan?.name || 'Hotspot Access'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Expires At:</span>
                  <span className="text-wire-green font-bold">
                    {activatedVoucher?.expiresAt ? new Date(activatedVoucher.expiresAt).toLocaleString() : '—'}
                  </span>
                </div>
              </div>

              <div className="space-y-3 pt-2">
                {isRedirection && (
                  <form id="hotspot-login-form" action={linkLogin} method="POST" className="hidden">
                    <input type="hidden" name="username" value={voucherCode.trim().toUpperCase()} />
                    <input type="hidden" name="password" value={voucherCode.trim().toUpperCase()} />
                    <input type="hidden" name="dst"      value={linkOrig} />
                  </form>
                )}
                <a
                  href={isRedirection ? '#' : 'https://google.com'}
                  onClick={e => {
                    if (isRedirection) {
                      e.preventDefault();
                      (document.getElementById('hotspot-login-form') as HTMLFormElement)?.submit();
                    }
                  }}
                  className="w-full inline-flex items-center justify-center gap-2 bg-wire-green hover:bg-green-500 text-white font-bold py-4 px-4 rounded-2xl shadow-lg shadow-wire-green/20 transition-all text-sm min-h-[48px]"
                >
                  <span>{isRedirection ? 'Connecting device…' : 'Start Browsing'}</span>
                  <ChevronRight size={18} />
                </a>
                <button
                  onClick={() => { setActivationStatus('idle'); setVoucherCode(''); }}
                  className="text-slate-400 hover:text-white text-xs font-semibold transition-colors min-h-[44px]"
                >
                  Activate Another Voucher
                </button>
              </div>
            </div>

          ) : (
            <div className="py-4 text-center space-y-6">
              <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mx-auto border border-red-500/30 text-red-400">
                <AlertCircle size={36} />
              </div>
              <div>
                <h3 className="text-xl font-bold text-white">Activation Failed</h3>
                <p className="text-red-400 text-xs font-medium mt-1">{errorMessage}</p>
              </div>

              <div className="bg-navy-950/80 p-4 rounded-2xl border border-navy-700/60 text-left text-xs text-slate-400 space-y-1.5">
                <p className="font-semibold text-slate-300 mb-1">Troubleshooting Tips:</p>
                <p>• Verify the code is typed exactly as shown on your receipt.</p>
                <p>• Ensure your device is connected to the De Royal Hotspot Wi-Fi signal.</p>
                <p>• Contact support if the problem continues.</p>
              </div>

              <button
                onClick={() => setActivationStatus('idle')}
                className="w-full bg-wire-orange hover:bg-orange-500 text-white font-bold py-3.5 px-4 rounded-2xl shadow-lg shadow-wire-orange/20 text-sm min-h-[48px]"
              >
                Try Again
              </button>
            </div>
          )}
        </div>

        {/* Available plans */}
        <div className="mt-8 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
              <Sparkles size={16} className="text-wire-orange" />
              <span>Available Internet Rates</span>
            </h3>
            <span className="text-xs text-slate-600 font-medium">Purchase a voucher to connect</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {publicPlans.map(plan => (
              <div
                key={plan.id}
                className="bg-navy-900/60 backdrop-blur-md border border-navy-700/50 hover:border-wire-orange/30 rounded-2xl p-4 transition-all space-y-2"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-bold text-white text-sm">{plan.name}</h4>
                    <span className="text-[11px] text-slate-400 flex items-center gap-1 mt-0.5">
                      <Clock size={12} />
                      {plan.duration} {plan.durationUnit}
                    </span>
                  </div>
                  <span className="text-sm font-extrabold text-wire-green bg-wire-green/10 px-2.5 py-1 rounded-xl border border-wire-green/20">
                    ₦{plan.price.toLocaleString()}
                  </span>
                </div>
                {plan.bandwidthProfile && (
                  <div className="text-[11px] text-slate-500 flex items-center gap-2 pt-1 border-t border-navy-700/40">
                    <span>⚡ {plan.bandwidthProfile.downloadSpeed} Down</span>
                    <span>•</span>
                    <span>{plan.bandwidthProfile.uploadSpeed} Up</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="relative z-10 max-w-lg mx-auto w-full px-4 text-center pb-6 space-y-3">
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 text-xs font-medium text-slate-500">
          <div className="flex items-center gap-1.5">
            <Phone size={14} className="text-wire-orange" />
            <span>+234 701 774 1881</span>
          </div>
          <span className="hidden sm:inline text-navy-700">•</span>
          <div className="flex items-center gap-1.5">
            <Mail size={14} className="text-wire-orange" />
            <span>support@deroyalhotspot.name.ng</span>
          </div>
        </div>
        <p className="text-navy-700 text-[11px]">
          &copy; {new Date().getFullYear()} De Royal Hotspot. All Rights Reserved.
        </p>
      </footer>

      {/* Bottom wire bar */}
      <div className="wire-bar h-1 w-full shrink-0" />
    </div>
  );
};
