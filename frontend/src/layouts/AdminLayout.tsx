import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Wifi, 
  Settings, 
  FileSpreadsheet, 
  History, 
  Network, 
  Users, 
  LogOut, 
  Menu, 
  X,
  Sun,
  Moon,
  ExternalLink
} from 'lucide-react';
import { AdminUser } from '../types';
import { useTheme } from '../contexts/ThemeContext';
import { Breadcrumb } from '../components/Breadcrumb';

interface AdminLayoutProps {
  children: React.ReactNode;
  onLogout: () => void;
  admin: AdminUser | null;
}

export const AdminLayout: React.FC<AdminLayoutProps> = ({ children, onLogout, admin }) => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();
  const { theme, toggleTheme } = useTheme();

  const navItems = [
    { label: 'Dashboard Overview', path: '/admin', icon: LayoutDashboard },
    { label: 'Internet Plans', path: '/admin/plans', icon: Wifi },
    { label: 'Bandwidth Profiles', path: '/admin/profiles', icon: Network },
    { label: 'Vouchers', path: '/admin/vouchers', icon: FileSpreadsheet },
    { label: 'Active Sessions', path: '/admin/sessions', icon: Users },
    { label: 'Audit System Logs', path: '/admin/logs', icon: History },
    { label: 'Network Settings', path: '/admin/settings', icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-sans flex transition-colors duration-200">
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex flex-col w-64 bg-slate-900 dark:bg-slate-900 text-white border-r border-slate-800 flex-shrink-0" aria-label="Admin Navigation Sidebar">
        <div className="p-6 border-b border-slate-800 flex items-center gap-3">
          <img 
            src="/favicon.svg" 
            alt="DeRoyal Hotspot OS Logo - High Speed Enterprise Wi-Fi Management" 
            className="w-10 h-10 rounded-xl shadow-lg shadow-blue-500/20"
          />
          <div>
            <span className="font-extrabold text-base tracking-tight leading-none text-white block">
              DeRoyal Hotspot
            </span>
            <span className="text-[11px] font-semibold text-blue-400 uppercase tracking-widest mt-1 block">
              Admin OS
            </span>
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-1 overflow-y-auto" aria-label="Primary Navigation">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-3 px-3.5 py-3 rounded-xl font-medium text-sm transition-all ${
                  active
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                }`}
              >
                <Icon size={18} aria-hidden="true" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-slate-800 space-y-3">
          <div className="px-3 py-2 bg-slate-800/50 rounded-xl text-xs space-y-1 border border-slate-800">
            <p className="text-slate-400 font-medium">Logged in as:</p>
            <p className="font-bold text-white truncate">{admin?.fullName || admin?.email || 'Administrator'}</p>
            <span className="inline-block text-[10px] uppercase font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded">
              {admin?.role || 'SUPER_ADMIN'}
            </span>
          </div>

          <button
            onClick={onLogout}
            aria-label="Sign out of administrator session"
            className="w-full flex items-center justify-center gap-2 min-h-[44px] px-4 rounded-xl text-sm font-semibold text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-colors"
          >
            <LogOut size={16} aria-hidden="true" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Mobile Drawer Overlay */}
      {mobileOpen && (
        <div
          className="md:hidden fixed inset-0 z-40 bg-slate-950/70 backdrop-blur-sm animate-fade-in"
          onClick={() => setMobileOpen(false)}
          aria-hidden="true"
        />
      )}

      <div
        className={`md:hidden fixed top-0 bottom-0 left-0 z-50 w-72 bg-slate-900 text-white flex flex-col transition-transform duration-300 ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
        aria-label="Mobile Navigation Menu"
      >
        <div className="p-5 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img 
              src="/favicon.svg" 
              alt="DeRoyal Hotspot OS Logo - Wi-Fi Management System" 
              className="w-8 h-8 rounded-xl"
            />
            <span className="font-bold text-base text-white">DeRoyal OS</span>
          </div>
          <button
            onClick={() => setMobileOpen(false)}
            aria-label="Close sidebar navigation menu"
            className="min-h-[44px] min-w-[44px] flex items-center justify-center text-slate-400 hover:text-white"
          >
            <X size={20} />
          </button>
        </div>

        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setMobileOpen(false)}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl font-medium text-sm transition-all ${
                  active ? 'bg-blue-600 text-white font-bold' : 'text-slate-400 hover:text-white hover:bg-slate-800'
                }`}
              >
                <Icon size={18} aria-hidden="true" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-slate-800">
          <button
            onClick={onLogout}
            className="w-full flex items-center justify-center gap-2 min-h-[44px] px-4 rounded-xl text-sm font-semibold text-red-400 hover:bg-red-500/10"
          >
            <LogOut size={16} aria-hidden="true" />
            <span>Sign Out</span>
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Header */}
        <header className="sticky top-0 z-30 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 px-4 sm:px-6 py-3.5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileOpen(true)}
              aria-label="Open sidebar menu"
              className="md:hidden min-h-[44px] min-w-[44px] flex items-center justify-center text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl"
            >
              <Menu size={22} />
            </button>
            <div>
              <span className="text-xs font-semibold text-blue-600 dark:text-blue-400 uppercase tracking-wider block sm:hidden">
                DeRoyal Hotspot OS
              </span>
              <span className="text-base sm:text-lg font-bold text-slate-900 dark:text-white truncate block">
                {navItems.find((i) => i.path === location.pathname)?.label || 'Administration'}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            <button
              onClick={toggleTheme}
              aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
              className="min-h-[44px] min-w-[44px] flex items-center justify-center rounded-xl text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              {theme === 'light' ? <Moon size={20} /> : <Sun size={20} className="text-amber-400" />}
            </button>

            <Link
              to="/"
              className="hidden sm:flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-blue-50 text-blue-600 dark:bg-blue-950/50 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/50 transition-colors min-h-[44px]"
            >
              <Wifi size={14} aria-hidden="true" />
              <span>View Portal</span>
              <ExternalLink size={12} className="opacity-70 ml-0.5" />
            </Link>
          </div>
        </header>

        {/* Page Content View */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto">
          <Breadcrumb />
          {children}
        </main>
      </div>
    </div>
  );
};

