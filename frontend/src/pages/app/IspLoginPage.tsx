import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Wifi, Eye, EyeOff, AlertCircle } from 'lucide-react';
import ispApi from '../../services/ispApi';
import { useIspAuth } from '../../contexts/isp/IspAuthContext';

export function IspLoginPage() {
  const { login } = useIspAuth();
  const navigate  = useNavigate();

  const [form, setForm]       = useState({ email: '', password: '' });
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await ispApi.post('/isp/auth/login', form);
      const { token, user, tenant } = res.data.data;
      login(token, user, tenant);
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Login failed. Please check your details and try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-navy-950 flex flex-col items-center justify-center px-4 font-sans">
      {/* Wire accent bar */}
      <div className="w-full max-w-sm mb-8">
        <div className="wire-bar rounded-full h-1 w-24 mx-auto mb-6" />
        <div className="flex items-center justify-center gap-2 mb-2">
          <div className="w-8 h-8 bg-wire-orange rounded-lg flex items-center justify-center">
            <Wifi size={16} className="text-white" />
          </div>
          <span className="text-white font-extrabold text-xl tracking-tight">DHOS</span>
        </div>
        <p className="text-center text-slate-400 text-sm">ISP Management Platform</p>
      </div>

      <div className="w-full max-w-sm bg-navy-900 border border-navy-800 rounded-2xl p-8 shadow-xl">
        <h1 className="text-white font-extrabold text-2xl mb-1">Sign in</h1>
        <p className="text-slate-400 text-sm mb-6">Access your business workspace</p>

        {error && (
          <div className="flex items-start gap-2 bg-red-950/60 border border-red-800 rounded-xl p-3 mb-5 text-red-300 text-sm">
            <AlertCircle size={16} className="mt-0.5 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-slate-300 text-sm font-semibold mb-1.5">Email address</label>
            <input
              type="email"
              required
              autoComplete="email"
              value={form.email}
              onChange={(e) => setForm(f => ({ ...f, email: e.target.value }))}
              className="w-full bg-navy-800 border border-navy-700 rounded-xl px-4 py-3 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-wire-blue transition-colors"
              placeholder="you@yourbusiness.com"
            />
          </div>

          <div>
            <label className="block text-slate-300 text-sm font-semibold mb-1.5">Password</label>
            <div className="relative">
              <input
                type={showPass ? 'text' : 'password'}
                required
                autoComplete="current-password"
                value={form.password}
                onChange={(e) => setForm(f => ({ ...f, password: e.target.value }))}
                className="w-full bg-navy-800 border border-navy-700 rounded-xl px-4 py-3 pr-11 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-wire-blue transition-colors"
                placeholder="••••••••"
              />
              <button
                type="button"
                onClick={() => setShowPass(s => !s)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200"
              >
                {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-wire-orange hover:bg-orange-600 disabled:opacity-60 text-white font-bold py-3 rounded-xl transition-colors text-sm mt-2"
          >
            {loading ? 'Signing in…' : 'Sign in'}
          </button>
        </form>

        <p className="text-center text-slate-500 text-sm mt-6">
          Don't have an account?{' '}
          <Link to="/register" className="text-wire-blue hover:text-blue-300 font-semibold">
            Register your ISP
          </Link>
        </p>
      </div>

      <p className="mt-6 text-slate-600 text-xs text-center">
        Looking for internet access?{' '}
        <a href="https://deroyalhotspot.name.ng/connect" className="text-slate-400 underline">
          Visit the customer portal
        </a>
      </p>
    </div>
  );
}
