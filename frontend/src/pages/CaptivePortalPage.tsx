import React, { useState, useEffect } from 'react';
import { CheckCircle, AlertCircle, Phone, Mail, ChevronRight, ClipboardCheck, Sparkles, Clock, Zap } from 'lucide-react';
import api from '../services/api';
import { Plan } from '../types';
import { SEOHead } from '../components/SEOHead';



export const CaptivePortalPage: React.FC = () => {
  const [voucherCode, setVoucherCode] = useState('');
  const [activationStatus, setActivationStatus] = useState<'idle' | 'loading' | 'success' | 'failure'>('idle');
  const [errorMessage, setErrorMessage] = useState('');
  const [activatedVoucher, setActivatedVoucher] = useState<any>(null);

  // Auto-reauthentication states
  const [checkingDevice, setCheckingDevice] = useState(true);
  const [reauthenticating, setReauthenticating] = useState(false);

  // RouterOS captive portal query parameters
  const [macAddress, setMacAddress] = useState('');
  const [ipAddress, setIpAddress] = useState('');
  const [linkLogin, setLinkLogin] = useState('');
  const [linkOrig, setLinkOrig] = useState('');
  const [isRedirection, setIsRedirection] = useState(false);

  // Available public plans for display grid
  const [publicPlans, setPublicPlans] = useState<Plan[]>([]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const paramMac = params.get('mac') || params.get('mac-address') || '';
    const paramIp = params.get('ip') || '';
    const paramLinkLogin = params.get('link-login') || '';
    const paramLinkOrig = params.get('link-orig') || '';

    setMacAddress(paramMac);
    setIpAddress(paramIp);
    setLinkLogin(paramLinkLogin);
    setLinkOrig(paramLinkOrig);

    if (paramLinkLogin) {
      setIsRedirection(true);
    }

    if (paramMac) {
      checkRegisteredDevice(paramMac);
    } else {
      setCheckingDevice(false);
    }

    fetchPublicPlans();
  }, []);

  const fetchPublicPlans = async () => {
    try {
      const res = await api.get('/plans');
      if (res.data && res.data.success) {
        setPublicPlans(res.data.data.plans || []);
      }
    } catch (e) {
      // Fallback default sample plans if API fails before login
      setPublicPlans([
        { id: '1', name: '1 Hour Regular', price: 100, duration: 60, durationUnit: 'minutes', bandwidthProfileId: '1', bandwidthProfile: { name: 'Bronze', downloadSpeed: '5M', uploadSpeed: '2M', id: '1', mikrotikQueueName: 'b', status: 'A', createdAt: '', updatedAt: '' } },
        { id: '2', name: '3 Hours Premium', price: 250, duration: 180, durationUnit: 'minutes', bandwidthProfileId: '2', bandwidthProfile: { name: 'Silver', downloadSpeed: '10M', uploadSpeed: '5M', id: '2', mikrotikQueueName: 's', status: 'A', createdAt: '', updatedAt: '' } },
        { id: '3', name: '24 Hours Day Pass', price: 500, duration: 1, durationUnit: 'days', bandwidthProfileId: '2', bandwidthProfile: { name: 'Silver', downloadSpeed: '10M', uploadSpeed: '5M', id: '3', mikrotikQueueName: 's', status: 'A', createdAt: '', updatedAt: '' } },
        { id: '4', name: '7 Days Mega', price: 2500, duration: 7, durationUnit: 'days', bandwidthProfileId: '3', bandwidthProfile: { name: 'Gold', downloadSpeed: '20M', uploadSpeed: '10M', id: '4', mikrotikQueueName: 'g', status: 'A', createdAt: '', updatedAt: '' } }
      ]);
    }
  };

  const checkRegisteredDevice = async (mac: string) => {
    setCheckingDevice(true);
    try {
      const res = await api.get(`/device/check?mac=${encodeURIComponent(mac)}`);
      if (res.data && res.data.success && res.data.data.isRegistered) {
        handleAutoReauthenticate(mac);
      } else {
        setCheckingDevice(false);
      }
    } catch (err) {
      console.warn('Device check failed:', err);
      setCheckingDevice(false);
    }
  };

  const handleAutoReauthenticate = async (mac: string) => {
    setReauthenticating(true);
    try {
      const res = await api.post('/device/reauthenticate', { mac, ip: ipAddress });
      if (res.data && res.data.success) {
        setActivatedVoucher(res.data.data);
        setActivationStatus('success');
      } else {
        setCheckingDevice(false);
      }
    } catch (err) {
      console.warn('Auto re-auth error:', err);
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

      if (response.data && response.data.success) {
        setActivatedVoucher(response.data.data);
        setActivationStatus('success');
        if (linkLogin) {
          setTimeout(() => {
            const form = document.createElement('form');
            form.method = 'POST';
            form.action = linkLogin;

            const userField = document.createElement('input');
            userField.type = 'hidden';
            userField.name = 'username';
            userField.value = voucherCode.trim().toUpperCase();
            form.appendChild(userField);

            const dstField = document.createElement('input');
            dstField.type = 'hidden';
            dstField.name = 'dst';
            dstField.value = linkOrig || 'http://google.com';
            form.appendChild(dstField);

            document.body.appendChild(form);
            form.submit();
          }, 1500);
        }
      } else {
        setErrorMessage(response.data?.message || 'Invalid or expired voucher code.');
        setActivationStatus('failure');
      }
    } catch (err: any) {
      console.error(err);
      setErrorMessage(err.response?.data?.message || 'Connection error. Please try again.');
      setActivationStatus('failure');
    }
  };

  const handlePasteClipboard = async () => {
    const inputEl = document.getElementById('voucher') as HTMLInputElement;
    try {
      if (navigator.clipboard && navigator.clipboard.readText) {
        const text = await navigator.clipboard.readText();
        if (text && text.trim()) {
          setVoucherCode(text.trim().toUpperCase());
          return;
        }
      }
      if (inputEl) {
        inputEl.focus();
        inputEl.select();
      }
    } catch (err) {
      console.warn('Clipboard access failed:', err);
      if (inputEl) {
        inputEl.focus();
        inputEl.select();
      }
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans flex flex-col justify-between p-4 sm:p-6 lg:p-8 relative overflow-hidden selection:bg-blue-600 selection:text-white">
      <SEOHead 
        title="DeRoyal Hotspot | Premium High-Speed Wi-Fi Access"
        description="DeRoyal Hotspot OS offers high-speed Wi-Fi internet access, voucher activation, and bandwidth plan selection for guests and users."
        canonicalPath="/"
      />

      {/* Ambient Glows */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-5xl h-96 bg-blue-600/15 blur-3xl rounded-full pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-emerald-500/10 blur-3xl rounded-full pointer-events-none" />

      {/* Top Header */}
      <header className="relative z-10 max-w-xl mx-auto w-full pt-4 text-center">
        <div className="flex justify-center items-center mb-6">
          <div className="flex items-center gap-2.5">
            <img 
              src="/favicon.svg" 
              alt="DeRoyal Hotspot OS Emblem - Enterprise Wi-Fi Authentication Gateway" 
              className="w-11 h-11 rounded-xl shadow-lg shadow-blue-500/20"
            />
            <span className="font-extrabold text-white text-base tracking-tight">
              deroyalhotspot.name.ng
            </span>
          </div>
        </div>


        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-semibold mb-4">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span>Enterprise High Speed Wi-Fi Active</span>
        </div>

        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white font-sans">
          DeRoyal Hotspot OS
        </h1>
        <p className="text-slate-400 text-sm font-medium mt-1">
          Instant Premium High-Speed Wi-Fi Access
        </p>
      </header>

      {/* Main Container Card */}
      <div className="relative z-10 max-w-xl mx-auto w-full my-8">
        <div className="bg-slate-900/90 backdrop-blur-xl border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6">
          {checkingDevice || reauthenticating ? (
            <div className="py-8 text-center space-y-4">
              <div className="w-12 h-12 rounded-full border-4 border-blue-500 border-t-transparent animate-spin mx-auto" />
              <div>
                <h3 className="text-lg font-bold text-white">Welcome Back!</h3>
                <p className="text-slate-400 text-xs mt-1">Reconnecting your device to the internet...</p>
              </div>
            </div>
          ) : activationStatus === 'idle' || activationStatus === 'loading' ? (
            <form onSubmit={handleActivate} className="space-y-6">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label htmlFor="voucher" className="block text-xs font-bold text-slate-400 uppercase tracking-wider">
                    Voucher Access Code
                  </label>
                  <span className="text-xs font-mono font-semibold text-slate-500">
                    {voucherCode.length} / 10
                  </span>
                </div>

                <div className="relative">
                  <input
                    id="voucher"
                    type="text"
                    required
                    maxLength={14}
                    placeholder="e.g. SLV19AKLD2"
                    value={voucherCode}
                    onChange={(e) => setVoucherCode(e.target.value.toUpperCase())}
                    disabled={activationStatus === 'loading'}
                    className="w-full text-center font-mono text-xl sm:text-2xl font-bold tracking-widest bg-slate-950/80 border border-slate-800 rounded-2xl py-4 px-4 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all uppercase placeholder:normal-case placeholder:font-sans placeholder:text-slate-600 placeholder:tracking-normal"
                  />
                  {navigator.clipboard && (
                    <button
                      type="button"
                      onClick={handlePasteClipboard}
                      title="Paste code from clipboard"
                      className="absolute right-3 top-1/2 -translate-y-1/2 min-h-[44px] px-3 flex items-center gap-1 text-xs font-bold text-blue-400 hover:text-blue-300 bg-blue-500/10 hover:bg-blue-500/20 rounded-xl transition-colors"
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
                className="w-full bg-blue-600 hover:bg-blue-500 disabled:bg-slate-800 disabled:text-slate-500 text-white font-extrabold py-4 px-4 rounded-2xl shadow-lg shadow-blue-600/30 hover:shadow-blue-500/40 transition-all duration-150 flex items-center justify-center gap-2 text-base min-h-[48px]"
              >
                {activationStatus === 'loading' ? (
                  <>
                    <div className="w-5 h-5 rounded-full border-2 border-white border-t-transparent animate-spin" />
                    <span>Activating Access...</span>
                  </>
                ) : (
                  <>
                    <Zap size={18} />
                    <span>Connect to Internet</span>
                  </>
                )}
              </button>
            </form>
          ) : activationStatus === 'success' ? (
            <div className="py-4 text-center space-y-6 animate-scale-in">
              <div className="w-16 h-16 bg-emerald-500/10 rounded-full flex items-center justify-center mx-auto border border-emerald-500/30 text-emerald-400">
                <CheckCircle size={36} />
              </div>
              <div>
                <h3 className="text-xl font-extrabold text-white">Activation Successful!</h3>
                <p className="text-slate-400 text-xs mt-1">You are now successfully connected to the internet.</p>
              </div>

              <div className="bg-slate-950/80 p-4 rounded-2xl border border-slate-800 space-y-2 text-left text-xs font-medium text-slate-300">
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
                  <span className="text-blue-400 font-bold">
                    {activatedVoucher?.expiresAt ? new Date(activatedVoucher.expiresAt).toLocaleString() : '-'}
                  </span>
                </div>
              </div>

              <div className="space-y-3 pt-2">
                {isRedirection && (
                  <form id="hotspot-login-form" action={linkLogin} method="POST" className="hidden">
                    <input type="hidden" name="username" value={voucherCode.trim().toUpperCase()} />
                    <input type="hidden" name="password" value={voucherCode.trim().toUpperCase()} />
                    <input type="hidden" name="dst" value={linkOrig} />
                  </form>
                )}
                <a
                  href={isRedirection ? '#' : 'https://google.com'}
                  onClick={(e) => {
                    if (isRedirection) {
                      e.preventDefault();
                      const form = document.getElementById('hotspot-login-form') as HTMLFormElement;
                      if (form) form.submit();
                    }
                  }}
                  className="w-full inline-flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-500 text-white font-bold py-4 px-4 rounded-2xl shadow-lg transition-all text-sm min-h-[48px]"
                >
                  <span>{isRedirection ? 'Connecting device...' : 'Start Browsing'}</span>
                  <ChevronRight size={18} />
                </a>

                <button
                  onClick={() => {
                    setActivationStatus('idle');
                    setVoucherCode('');
                  }}
                  className="text-slate-400 hover:text-white text-xs font-semibold transition-colors min-h-[44px]"
                >
                  Activate Another Voucher
                </button>
              </div>
            </div>
          ) : (
            <div className="py-4 text-center space-y-6 animate-scale-in">
              <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mx-auto border border-red-500/30 text-red-400">
                <AlertCircle size={36} />
              </div>
              <div>
                <h3 className="text-xl font-bold text-white">Activation Failed</h3>
                <p className="text-red-400 text-xs font-medium mt-1">{errorMessage}</p>
              </div>

              <div className="bg-slate-950/80 p-4 rounded-2xl border border-slate-800 text-left text-xs text-slate-400 space-y-1.5">
                <p className="font-semibold text-slate-300 mb-1">Troubleshooting Tips:</p>
                <p>• Verify code is typed accurately as shown on receipt.</p>
                <p>• Ensure device is connected to DeRoyal Hotspot WiFi signal.</p>
              </div>

              <button
                onClick={() => setActivationStatus('idle')}
                className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-3.5 px-4 rounded-2xl shadow-lg text-sm min-h-[48px]"
              >
                Try Again
              </button>
            </div>
          )}
        </div>

        {/* Public Rates & Plans Display Grid */}
        <div className="mt-8 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
              <Sparkles size={16} className="text-blue-400" />
              <span>Available WiFi Access Rates</span>
            </h3>
            <span className="text-xs text-slate-500 font-medium">Instant Voucher Purchase</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {publicPlans.map((plan) => (
              <div
                key={plan.id}
                className="bg-slate-900/60 backdrop-blur-md border border-slate-800 hover:border-blue-500/40 rounded-2xl p-4 transition-all space-y-2"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-bold text-white text-sm">{plan.name}</h4>
                    <span className="text-[11px] text-slate-400 flex items-center gap-1 mt-0.5">
                      <Clock size={12} />
                      {plan.duration} {plan.durationUnit}
                    </span>
                  </div>
                  <span className="text-sm font-extrabold text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-xl border border-emerald-500/20">
                    ₦{plan.price.toLocaleString()}
                  </span>
                </div>
                {plan.bandwidthProfile && (
                  <div className="text-[11px] text-slate-500 flex items-center gap-2 pt-1 border-t border-slate-800/60">
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

      {/* Footer Support Info */}
      <footer className="relative z-10 max-w-xl mx-auto w-full text-center pb-4 space-y-3">
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 text-xs font-medium text-slate-400">
          <div className="flex items-center gap-1.5">
            <Phone size={14} className="text-blue-400" />
            <span>+234 701 774 1881</span>
          </div>
          <span className="hidden sm:inline text-slate-700">•</span>
          <div className="flex items-center gap-1.5">
            <Mail size={14} className="text-blue-400" />
            <span>support@deroyalhotspot.name.ng</span>
          </div>
        </div>

        <p className="text-slate-600 text-[11px] pt-2">
          &copy; {new Date().getFullYear()} DeRoyal Hotspot OS (deroyalhotspot.name.ng). All Rights Reserved.
        </p>
      </footer>
    </div>
  );
};



