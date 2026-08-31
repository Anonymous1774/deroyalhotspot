import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AlertCircle, Lock, Mail, ArrowLeft } from 'lucide-react';
import api from '../services/api';
import { useToast } from '../contexts/ToastContext';
import { SEOHead } from '../components/SEOHead';
import { Breadcrumb } from '../components/Breadcrumb';


interface AdminLoginPageProps {
  onLoginSuccess: (adminData: any) => void;
}

export const AdminLoginPage: React.FC<AdminLoginPageProps> = ({ onLoginSuccess }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { showToast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');

    try {
      const response = await api.post('/auth/login', { email, password });
      if (response.data && response.data.success) {
        const { token, admin } = response.data.data;
        localStorage.setItem('dhos_token', token);
        localStorage.setItem('dhos_admin', JSON.stringify(admin));
        showToast('Login Successful', `Welcome back, ${admin.fullName}!`, 'success');
        onLoginSuccess(admin);
        navigate('/admin');
      } else {
        setError(response.data.message || 'Login failed.');
      }
    } catch (err: any) {
      console.error(err);
      setError(err.response?.data?.message || 'Invalid administrator email or password.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between py-8 px-4 sm:px-6 lg:px-8 font-sans relative overflow-hidden selection:bg-blue-600 selection:text-white">
      <SEOHead 
        title="Admin Sign In | DeRoyal Hotspot OS"
        description="Administrator login portal for DeRoyal Hotspot OS bandwidth management and router configuration."
        canonicalPath="/admin/login"
      />

      {/* Background Lighting */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-96 h-96 bg-blue-600/15 blur-3xl rounded-full pointer-events-none" />

      {/* Top Bar with Return Link */}
      <header className="max-w-md w-full mx-auto flex items-center justify-between relative z-10">
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-xs font-bold text-slate-400 hover:text-white bg-slate-900 border border-slate-800 px-3.5 py-2 rounded-xl transition-all"
        >
          <ArrowLeft size={14} className="text-blue-400" />
          <span>Return to Captive Portal</span>
        </Link>
        <span className="text-xs text-slate-500 font-mono font-semibold">deroyalhotspot.name.ng</span>
      </header>

      <main className="max-w-md w-full mx-auto space-y-6 relative z-10 my-auto py-4">
        <div className="flex justify-center">
          <Breadcrumb items={[{ label: 'Portal', path: '/' }, { label: 'Admin Login' }]} />
        </div>

        <div className="text-center space-y-3">
          <img 
            src="/favicon.svg" 
            alt="DeRoyal Hotspot OS Administrative Shield Emblem" 
            className="mx-auto h-16 w-16 rounded-2xl shadow-xl shadow-blue-500/20"
          />
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Administrator Authentication
          </h1>
          <p className="text-xs text-slate-400 font-medium">
            DeRoyal Hotspot OS Network Control Center
          </p>
        </div>

        <div className="bg-slate-900/90 backdrop-blur-xl py-8 px-8 shadow-2xl rounded-3xl border border-slate-800 space-y-6">
          <form className="space-y-5" onSubmit={handleSubmit}>
            {error && (
              <div className="bg-red-500/10 border border-red-500/30 text-red-400 px-4 py-3 rounded-2xl text-xs font-medium flex items-center gap-2">
                <AlertCircle size={16} className="flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <div>
              <label htmlFor="email" className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                Email Address
              </label>
              <div className="relative">
                <input
                  id="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={submitting}
                  placeholder="admin@deroyalhotspot.name.ng"
                  className="w-full bg-slate-950/80 border border-slate-800 rounded-2xl py-3.5 pl-10 pr-4 text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all placeholder:text-slate-600"
                />
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={submitting}
                  placeholder="••••••••••••"
                  className="w-full bg-slate-950/80 border border-slate-800 rounded-2xl py-3.5 pl-10 pr-4 text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all placeholder:text-slate-600"
                />
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full bg-blue-600 hover:bg-blue-500 disabled:bg-slate-800 text-white font-extrabold py-3.5 px-4 rounded-2xl shadow-lg shadow-blue-600/30 transition-all text-sm flex justify-center items-center gap-2 min-h-[48px]"
            >
              {submitting ? (
                <>
                  <div className="w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
                  <span>Verifying Credentials...</span>
                </>
              ) : (
                <span>Sign In to Dashboard</span>
              )}
            </button>
          </form>
        </div>
      </main>

      <footer className="text-center text-xs text-slate-500 py-2">
        <p>Security audit logging enabled for all administrative access.</p>
        <p className="mt-1">&copy; {new Date().getFullYear()} DeRoyal Hotspot OS (deroyalhotspot.name.ng)</p>
      </footer>
    </div>
  );
};

