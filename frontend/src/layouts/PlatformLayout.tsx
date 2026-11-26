import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  LayoutDashboard, Building2, Package, FileText, Settings,
  LogOut, ChevronRight, Shield, Menu
} from 'lucide-react';
import { usePlatformAuth } from '../contexts/platform/PlatformAuthContext';

const NAV = [
  { label: 'Overview',   icon: LayoutDashboard, to: '/dashboard' },
  { label: 'ISP Accounts', icon: Building2,    to: '/tenants' },
  { label: 'Sub Plans',  icon: Package,         to: '/plans' },
  { label: 'Audit Logs', icon: FileText,        to: '/audit' },
  { label: 'Settings',   icon: Settings,        to: '/settings' },
];

export function PlatformLayout({ children }: { children: React.ReactNode }) {
  const { admin, logout } = usePlatformAuth();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = React.useState(false);

  const NavItem = ({ item }: { item: typeof NAV[0] }) => {
    const active = location.pathname === item.to || location.pathname.startsWith(item.to + '/');
    return (
      <Link to={item.to} onClick={() => setSidebarOpen(false)}
        className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-semibold transition-colors ${
          active ? 'bg-wire-orange/20 text-wire-orange' : 'text-slate-400 hover:bg-navy-800 hover:text-white'
        }`}>
        <item.icon size={16} className="shrink-0" />
        <span>{item.label}</span>
        {active && <ChevronRight size={12} className="ml-auto opacity-60" />}
      </Link>
    );
  };

  const Sidebar = () => (
    <aside className="flex flex-col h-full bg-navy-950 border-r border-navy-800 w-56 shrink-0">
      <div className="px-5 py-5 border-b border-navy-800">
        <div className="wire-bar h-0.5 w-12 rounded-full mb-3" />
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 bg-wire-orange rounded-lg flex items-center justify-center">
            <Shield size={13} className="text-white" />
          </div>
          <span className="text-white font-extrabold text-base">DHOS</span>
        </div>
        <p className="text-xs text-slate-500 mt-1 font-medium">Platform Admin</p>
      </div>
      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-0.5">
        {NAV.map(item => <NavItem key={item.to} item={item} />)}
      </nav>
      <div className="px-4 py-4 border-t border-navy-800">
        <div className="flex items-center gap-2 mb-3">
          <div className="w-7 h-7 rounded-full bg-wire-orange/20 flex items-center justify-center text-wire-orange text-xs font-bold uppercase">
            {admin?.fullName?.[0] ?? 'A'}
          </div>
          <div className="min-w-0">
            <p className="text-white text-xs font-semibold truncate">{admin?.fullName}</p>
            <p className="text-slate-500 text-[10px]">Super Admin</p>
          </div>
        </div>
        <button onClick={logout}
          className="w-full flex items-center gap-2 text-slate-400 hover:text-red-400 text-xs font-semibold py-1.5 px-2 rounded-lg hover:bg-red-950/30 transition-colors">
          <LogOut size={13} /> Sign out
        </button>
      </div>
    </aside>
  );

  return (
    <div className="flex h-screen bg-slate-50 font-sans overflow-hidden">
      <div className="hidden lg:flex"><Sidebar /></div>
      {sidebarOpen && (
        <div className="fixed inset-0 z-50 flex lg:hidden">
          <div className="fixed inset-0 bg-black/60" onClick={() => setSidebarOpen(false)} />
          <div className="relative z-10 w-56"><Sidebar /></div>
        </div>
      )}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <header className="h-14 flex items-center gap-3 px-4 border-b border-slate-200 bg-white shrink-0">
          <button className="lg:hidden text-slate-500 hover:text-slate-700" onClick={() => setSidebarOpen(true)}>
            <Menu size={20} />
          </button>
          <span className="text-sm font-semibold text-navy-900 lg:hidden">DHOS Platform</span>
          <div className="flex-1" />
          <span className="text-xs text-slate-500 font-medium">Super Admin Console</span>
        </header>
        <main className="flex-1 overflow-y-auto p-6">{children}</main>
      </div>
    </div>
  );
}
