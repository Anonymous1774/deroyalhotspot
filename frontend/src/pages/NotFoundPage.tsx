import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Wifi, ArrowLeft, ShieldAlert, KeyRound, Compass } from 'lucide-react';
import { SEOHead } from '../components/SEOHead';
import { Breadcrumb } from '../components/Breadcrumb';

export const NotFoundPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between p-4 sm:p-8 font-sans relative overflow-hidden selection:bg-blue-500 selection:text-white">
      <SEOHead 
        title="404 Page Not Found | DeRoyal Hotspot OS"
        description="The page or network resource you requested was not found on DeRoyal Hotspot OS."
        canonicalPath="/404"
      />

      {/* Decorative ambient background glows */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-72 h-72 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />

      {/* Top Header Branding */}
      <header className="w-full max-w-4xl mx-auto flex items-center justify-between z-10 py-2">
        <Link to="/" className="flex items-center gap-3 group">
          <img 
            src="/favicon.svg" 
            alt="DeRoyal Hotspot OS Logo - High Speed Enterprise Wi-Fi Gateway" 
            className="w-10 h-10 rounded-xl shadow-lg shadow-blue-500/20 group-hover:scale-105 transition-transform"
          />
          <div>
            <span className="font-extrabold text-lg tracking-tight text-white block leading-none">
              DeRoyal Hotspot
            </span>
            <span className="text-[11px] font-semibold text-blue-400 uppercase tracking-widest block mt-0.5">
              Operating System
            </span>
          </div>
        </Link>

        <Link
          to="/admin/login"
          className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold bg-slate-900 border border-slate-800 text-slate-300 hover:text-white hover:border-slate-700 transition-all min-h-[44px]"
        >
          <KeyRound size={14} className="text-blue-400" />
          <span>Admin Portal</span>
        </Link>
      </header>

      {/* Center 404 Glassmorphic Card */}
      <main className="w-full max-w-xl mx-auto my-auto z-10 py-8">
        <div className="bg-slate-900/60 backdrop-blur-xl border border-slate-800/80 rounded-3xl p-6 sm:p-10 shadow-2xl text-center space-y-6">
          <div className="flex justify-center">
            <Breadcrumb items={[{ label: 'Portal', path: '/' }, { label: '404 Error' }]} />
          </div>

          <div className="w-20 h-20 mx-auto rounded-3xl bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-400 shadow-inner">
            <ShieldAlert size={42} aria-hidden="true" />
          </div>

          <div className="space-y-2">
            <span className="inline-block text-xs font-extrabold text-red-400 bg-red-500/10 px-3 py-1 rounded-full uppercase tracking-wider">
              Error 404 • Resource Missing
            </span>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
              Page Not Found
            </h1>
            <p className="text-slate-400 text-sm sm:text-base max-w-md mx-auto leading-relaxed">
              The URL path you requested does not exist or has been moved within DeRoyal Hotspot OS.
            </p>
          </div>

          {/* Quick Navigation Action Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
            <button
              onClick={() => navigate('/')}
              className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-500 text-white font-bold py-3.5 px-5 rounded-2xl text-sm transition-all shadow-lg shadow-blue-600/30 min-h-[48px]"
            >
              <Wifi size={18} aria-hidden="true" />
              <span>Captive Portal Access</span>
            </button>

            <button
              onClick={() => navigate(-1)}
              className="flex items-center justify-center gap-2 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold py-3.5 px-5 rounded-2xl text-sm transition-all border border-slate-700 min-h-[48px]"
            >
              <ArrowLeft size={18} aria-hidden="true" />
              <span>Go Back Previous Page</span>
            </button>
          </div>

          {/* Quick links list */}
          <div className="border-t border-slate-800/80 pt-4 text-xs text-slate-400 flex flex-wrap justify-center gap-4">
            <Link to="/" className="hover:text-blue-400 transition-colors flex items-center gap-1">
              <Compass size={13} />
              <span>Public Hotspot</span>
            </Link>
            <span>•</span>
            <Link to="/admin/login" className="hover:text-blue-400 transition-colors">
              Administrator Login
            </Link>
            <span>•</span>
            <a href="https://deroyalhotspot.name.ng/sitemap.xml" className="hover:text-blue-400 transition-colors">
              Sitemap.xml
            </a>
          </div>
        </div>
      </main>

      {/* Footer copyright & domain info */}
      <footer className="w-full max-w-4xl mx-auto text-center z-10 text-xs text-slate-500 py-2">
        <p>© 2026 DeRoyal Hotspot OS (deroyalhotspot.name.ng). All rights reserved.</p>
      </footer>
    </div>
  );
};

