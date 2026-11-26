import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Wifi, Eye, EyeOff, AlertCircle, CheckCircle, ArrowRight } from 'lucide-react';
import ispApi from '../../services/ispApi';
import { useIspAuth } from '../../contexts/isp/IspAuthContext';

const FEATURES = [
  'Router management dashboard',
  'Internet plan configuration',
  'Voucher generation & tracking',
  'Live session monitoring',
  'Staff roles & permissions',
  '14-day free trial',
];

export function IspRegisterPage() {
  const { login } = useIspAuth();
  const navigate  = useNavigate();

  const [step, setStep] = useState<1 | 2>(1);
  const [form, setForm] = useState({
    businessName: '',
    ownerFullName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    country: '',
    address: '',
  });
  const [showPass, setShowPass]      = useState(false);
  const [loading, setLoading]        = useState(false);
  const [error, setError]            = useState('');
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  function set(field: string, value: string) {
    setForm(f => ({ ...f, [field]: value }));
    setFieldErrors(e => ({ ...e, [field]: '' }));
  }

  function validateStep1(): boolean {
    const errs: Record<string, string> = {};
    if (!form.businessName.trim()) errs.businessName = 'Business name is required.';
    if (!form.ownerFullName.trim()) errs.ownerFullName = 'Your full name is required.';
    if (!form.email.trim() || !/\S+@\S+\.\S+/.test(form.email)) errs.email = 'A valid email address is required.';
    if (!form.phone.trim()) errs.phone = 'Phone number is required.';
    setFieldErrors(errs);
    return Object.keys(errs).length === 0;
  }

  function validateStep2(): boolean {
    const errs: Record<string, string> = {};
    if (form.password.length < 8) errs.password = 'Password must be at least 8 characters.';
    else if (!/[A-Z]/.test(form.password)) errs.password = 'Password must include an uppercase letter.';
    else if (!/[0-9]/.test(form.password)) errs.password = 'Password must include a number.';
    if (form.password !== form.confirmPassword) errs.confirmPassword = 'Passwords do not match.';
    setFieldErrors(errs);
    return Object.keys(errs).length === 0;
  }

  function nextStep() {
    if (validateStep1()) setStep(2);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validateStep2()) return;
    setError('');
    setLoading(true);
    try {
      const { confirmPassword, ...payload } = form;
      const res = await ispApi.post('/isp/auth/register', payload);
      const { token, user, tenant } = res.data.data;
      login(token, user, tenant);
      navigate('/onboarding');
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Registration failed. Please try again.';
      setError(msg);
      setStep(1);
    } finally {
      setLoading(false);
    }
  }

  const inputClass = (field: string) =>
    `w-full bg-navy-800 border ${fieldErrors[field] ? 'border-red-500' : 'border-navy-700'} rounded-xl px-4 py-3 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-wire-blue transition-colors`;

  return (
    <div className="min-h-screen bg-navy-950 flex font-sans">
      {/* Left panel — features */}
      <div className="hidden lg:flex flex-col justify-center w-5/12 px-12 bg-navy-900 border-r border-navy-800">
        <div className="wire-bar h-1 w-20 rounded-full mb-8" />
        <div className="flex items-center gap-2 mb-6">
          <div className="w-9 h-9 bg-wire-orange rounded-lg flex items-center justify-center">
            <Wifi size={18} className="text-white" />
          </div>
          <span className="text-white font-extrabold text-2xl">DHOS</span>
        </div>
        <h2 className="text-white font-extrabold text-3xl leading-tight mb-3">
          Run your hotspot business from one place.
        </h2>
        <p className="text-slate-400 text-sm mb-8 leading-relaxed">
          DHOS gives ISPs and hotspot operators a complete management platform — routers, plans, vouchers, sessions and staff, all in one workspace.
        </p>
        <ul className="space-y-3">
          {FEATURES.map(f => (
            <li key={f} className="flex items-center gap-3 text-slate-300 text-sm">
              <CheckCircle size={15} className="text-wire-green shrink-0" />
              {f}
            </li>
          ))}
        </ul>
      </div>

      {/* Right panel — form */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-10">
        <div className="w-full max-w-md">
          {/* Step indicator */}
          <div className="flex items-center gap-2 mb-8">
            <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${step >= 1 ? 'bg-wire-orange text-white' : 'bg-navy-800 text-slate-500'}`}>1</div>
            <div className={`flex-1 h-0.5 ${step >= 2 ? 'bg-wire-orange' : 'bg-navy-800'}`} />
            <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${step >= 2 ? 'bg-wire-orange text-white' : 'bg-navy-800 text-slate-500'}`}>2</div>
          </div>

          <h1 className="text-white font-extrabold text-2xl mb-1">
            {step === 1 ? 'Create your workspace' : 'Set your password'}
          </h1>
          <p className="text-slate-400 text-sm mb-6">
            {step === 1 ? 'Tell us about your business.' : 'Choose a strong password for your account.'}
          </p>

          {error && (
            <div className="flex items-start gap-2 bg-red-950/60 border border-red-800 rounded-xl p-3 mb-5 text-red-300 text-sm">
              <AlertCircle size={16} className="mt-0.5 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={step === 1 ? (e) => { e.preventDefault(); nextStep(); } : handleSubmit} className="space-y-4">
            {step === 1 ? (
              <>
                <div>
                  <label className="block text-slate-300 text-sm font-semibold mb-1.5">Business name *</label>
                  <input type="text" required value={form.businessName} onChange={e => set('businessName', e.target.value)} className={inputClass('businessName')} placeholder="e.g. Bright Connect ISP" />
                  {fieldErrors.businessName && <p className="text-red-400 text-xs mt-1">{fieldErrors.businessName}</p>}
                </div>
                <div>
                  <label className="block text-slate-300 text-sm font-semibold mb-1.5">Your full name *</label>
                  <input type="text" required value={form.ownerFullName} onChange={e => set('ownerFullName', e.target.value)} className={inputClass('ownerFullName')} placeholder="e.g. Adaeze Okonkwo" />
                  {fieldErrors.ownerFullName && <p className="text-red-400 text-xs mt-1">{fieldErrors.ownerFullName}</p>}
                </div>
                <div>
                  <label className="block text-slate-300 text-sm font-semibold mb-1.5">Business email *</label>
                  <input type="email" required value={form.email} onChange={e => set('email', e.target.value)} className={inputClass('email')} placeholder="you@yourbusiness.com" />
                  {fieldErrors.email && <p className="text-red-400 text-xs mt-1">{fieldErrors.email}</p>}
                </div>
                <div>
                  <label className="block text-slate-300 text-sm font-semibold mb-1.5">Phone number *</label>
                  <input type="tel" required value={form.phone} onChange={e => set('phone', e.target.value)} className={inputClass('phone')} placeholder="+234 800 000 0000" />
                  {fieldErrors.phone && <p className="text-red-400 text-xs mt-1">{fieldErrors.phone}</p>}
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-300 text-sm font-semibold mb-1.5">Country</label>
                    <input type="text" value={form.country} onChange={e => set('country', e.target.value)} className={inputClass('country')} placeholder="Nigeria" />
                  </div>
                  <div>
                    <label className="block text-slate-300 text-sm font-semibold mb-1.5">Address</label>
                    <input type="text" value={form.address} onChange={e => set('address', e.target.value)} className={inputClass('address')} placeholder="City, State" />
                  </div>
                </div>
                <button type="submit" className="w-full bg-wire-orange hover:bg-orange-600 text-white font-bold py-3 rounded-xl transition-colors text-sm flex items-center justify-center gap-2 mt-2">
                  Continue <ArrowRight size={15} />
                </button>
              </>
            ) : (
              <>
                <div>
                  <label className="block text-slate-300 text-sm font-semibold mb-1.5">Password *</label>
                  <div className="relative">
                    <input type={showPass ? 'text' : 'password'} required value={form.password} onChange={e => set('password', e.target.value)} className={inputClass('password')} placeholder="Min. 8 characters" />
                    <button type="button" onClick={() => setShowPass(s => !s)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400">
                      {showPass ? <EyeOff size={15} /> : <Eye size={15} />}
                    </button>
                  </div>
                  {fieldErrors.password && <p className="text-red-400 text-xs mt-1">{fieldErrors.password}</p>}
                </div>
                <div>
                  <label className="block text-slate-300 text-sm font-semibold mb-1.5">Confirm password *</label>
                  <input type={showPass ? 'text' : 'password'} required value={form.confirmPassword} onChange={e => set('confirmPassword', e.target.value)} className={inputClass('confirmPassword')} placeholder="Repeat password" />
                  {fieldErrors.confirmPassword && <p className="text-red-400 text-xs mt-1">{fieldErrors.confirmPassword}</p>}
                </div>
                <div className="flex gap-3 mt-2">
                  <button type="button" onClick={() => setStep(1)} className="flex-1 border border-navy-700 text-slate-300 hover:bg-navy-800 font-semibold py-3 rounded-xl transition-colors text-sm">
                    Back
                  </button>
                  <button type="submit" disabled={loading} className="flex-1 bg-wire-orange hover:bg-orange-600 disabled:opacity-60 text-white font-bold py-3 rounded-xl transition-colors text-sm">
                    {loading ? 'Creating workspace…' : 'Create workspace'}
                  </button>
                </div>
              </>
            )}
          </form>

          <p className="text-center text-slate-500 text-sm mt-6">
            Already have a workspace?{' '}
            <Link to="/login" className="text-wire-blue hover:text-blue-300 font-semibold">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
