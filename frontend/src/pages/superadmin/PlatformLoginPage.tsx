import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, Eye, EyeOff, Loader2, AlertCircle } from 'lucide-react';
import platformApi from '../../services/platformApi';
import { usePlatformAuth } from '../../contexts/platform/PlatformAuthContext';

export function PlatformLoginPage() {
  const { login } = usePlatformAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const r = await platformApi.post('/platform/auth/login', form);
      const { token, admin } = r.data.data;
      login(token, admin);
      navigate('/dashboard', { replace: true });
    } catch (err: any) {
      setError(err.response?.data?.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-navy-950 flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 bg-wire-orange rounded-2xl mb-4">
            <Shield className="w-7 h-7 text-white" />
          </div>
          <h1 className="text-2xl font-extrabold text-white">DHOS Platform</h1>
          <p className="text-slate-400 text-sm mt-1">Super Admin Access</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-navy-900 border border-navy-700 rounded-2xl p-6 space-y-4">
          {error && (
            <div className="flex items-center gap-2 bg-red-950/50 border border-red-800 text-red-400 rounded-lg px-3 py-2.5 text-sm">
              <AlertCircle className="w-4 h-4 shrink-0" />{error}
            </div>
          )}
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1">Email Address</label>
            <input type="email" required value={form.email}
              onChange={e => setForm(p => ({ ...p, email: e.target.value }))}
              placeholder="admin@platform.com"
              className="w-full bg-navy-800 border border-navy-600 rounded-xl px-3 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-wire-orange/40 focus:border-wire-orange" />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1">Password</label>
            <div className="relative">
              <input type={showPass ? 'text' : 'password'} required value={form.password}
                onChange={e => setForm(p => ({ ...p, password: e.target.value }))}
                placeholder="••••••••"
                className="w-full bg-navy-800 border border-navy-600 rounded-xl px-3 py-2.5 pr-10 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-wire-orange/40 focus:border-wire-orange" />
              <button type="button" onClick={() => setShowPass(s => !s)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300">
                {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>
          <button type="submit" disabled={loading}
            className="w-full flex items-center justify-center gap-2 bg-wire-orange text-white py-2.5 rounded-xl text-sm font-semibold hover:bg-wire-orange/90 disabled:opacity-50 transition-colors mt-2">
            {loading && <Loader2 className="w-4 h-4 animate-spin" />}
            Sign In to Platform
          </button>
        </form>
      </div>
    </div>
  );
}
