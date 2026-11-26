import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Loader2, AlertCircle } from 'lucide-react';
import axios from 'axios';
import { useCustomerAuth } from '../../contexts/customer/CustomerAuthContext';

const api = axios.create({ baseURL: '/api/v1' });

export function CustomerLoginPage({ isRegister = false }: { isRegister?: boolean }) {
  const { login } = useCustomerAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '', phone: '' });
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [mode, setMode] = useState<'login' | 'register'>(isRegister ? 'register' : 'login');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const endpoint = mode === 'login' ? '/customer/auth/login' : '/customer/auth/register';
      const r = await api.post(endpoint, form);
      const { token, customer } = r.data.data;
      login(token, customer);
      navigate('/dashboard', { replace: true });
    } catch (err: any) {
      setError(err.response?.data?.message || `Failed to ${mode}. Please try again.`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-sm mx-auto">
      <div className="text-center mb-6">
        <h1 className="text-2xl font-bold text-navy-900">{mode === 'login' ? 'Welcome back' : 'Create account'}</h1>
        <p className="text-sm text-slate-500 mt-1">
          {mode === 'login' ? 'Sign in to your De Royal Hotspot account' : 'Start managing your internet access'}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-slate-100 p-6 space-y-4">
        {error && (
          <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 rounded-lg px-3 py-2.5 text-sm">
            <AlertCircle className="w-4 h-4 shrink-0" />{error}
          </div>
        )}
        {mode === 'register' && (
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">Full Name *</label>
            <input required value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
              placeholder="Your name"
              className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-wire-blue/30 focus:border-wire-blue" />
          </div>
        )}
        <div>
          <label className="block text-xs font-medium text-slate-600 mb-1">Email Address *</label>
          <input type="email" required value={form.email} onChange={e => setForm(p => ({ ...p, email: e.target.value }))}
            placeholder="you@example.com"
            className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-wire-blue/30 focus:border-wire-blue" />
        </div>
        <div>
          <label className="block text-xs font-medium text-slate-600 mb-1">Password *</label>
          <div className="relative">
            <input type={showPass ? 'text' : 'password'} required value={form.password}
              onChange={e => setForm(p => ({ ...p, password: e.target.value }))}
              placeholder="••••••••"
              className="w-full border border-slate-200 rounded-xl px-3 py-2.5 pr-10 text-sm focus:outline-none focus:ring-2 focus:ring-wire-blue/30 focus:border-wire-blue" />
            <button type="button" onClick={() => setShowPass(s => !s)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
              {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>
        <button type="submit" disabled={loading}
          className="w-full flex items-center justify-center gap-2 bg-wire-blue text-white py-2.5 rounded-xl text-sm font-semibold hover:bg-wire-blue/90 disabled:opacity-50 transition-colors">
          {loading && <Loader2 className="w-4 h-4 animate-spin" />}
          {mode === 'login' ? 'Sign In' : 'Create Account'}
        </button>
      </form>

      <p className="text-center text-sm text-slate-500 mt-4">
        {mode === 'login' ? (
          <>Don't have an account?{' '}
            <button onClick={() => setMode('register')} className="text-wire-blue font-semibold hover:underline">Create one</button>
          </>
        ) : (
          <>Already have an account?{' '}
            <button onClick={() => setMode('login')} className="text-wire-blue font-semibold hover:underline">Sign in</button>
          </>
        )}
      </p>
      <p className="text-center text-xs text-slate-400 mt-3">
        Just want internet access?{' '}
        <a href="/connect" className="text-wire-blue hover:underline">Go to connection portal</a>
      </p>
    </div>
  );
}
