import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  LayoutDashboard, Server, Package, Ticket, Activity,
  Users, Settings, LogOut, ChevronRight,
  Wifi, CreditCard, Menu, Zap
} from 'lucide-react';
import { useIspAuth } from '../contexts/isp/IspAuthContext';

const NAV = [
  { label: 'Dashboard',   icon: LayoutDashboard, to: '/dashboard' },
  { label: 'Routers',     icon: Server,          to: '/routers' },
  { label: 'BW Profiles', icon: Zap,             to: '/profiles' },
  { label: 'Plans',       icon: Package,         to: '/plans' },
  { label: 'Vouchers',    icon: Ticket,          to: '/vouchers' },
  { label: 'Sessions',    icon: Activity,        to: '/sessions' },
  { label: 'Staff',       icon: Users,           to: '/staff' },
  { label: 'Subscription',icon: CreditCard,      to: '/subscription' },
  { label: 'Settings',    icon: Settings,        to: '/settings' },
];

interface IspLayoutProps { children: React.ReactNode }

export function IspLayout({ children }: IspLayoutProps) {
  const { user, tenant, logout } = useIspAuth();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = React.useState(false);

  const NavItem = ({ item }: { item: typeof NAV[0] }) => {
    const active = location.pathname === item.to || location.pathname.startsWith(item.to + '/');
    return (
      <Link
        to={item.to}
        onClick={() => setSidebarOpen(false)}
        className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-semibold transition-colors ${
          active
            ? 'bg-wire-orange/20 text-wire-orange'
            : 'text-slate-400 hover:bg-navy-800 hover:text-white'
        }`}
      >
        <item.icon size={16} className="shrink-0" />
        <span>{item.label}</span>
        {active && <ChevronRight size={12} className="ml-auto opacity-60" />}
      </Link>
    );
  };

  const Sidebar = () => (
    <aside className="flex flex-col h-full bg-navy-950 border-r border-navy-800 w-56 shrink-0">
      {/* Logo */}
      <div className="px-5 py-5 border-b border-navy-800">
        <div className="wire-bar h-0.5 w-12 rounded-full mb-3" />
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 bg-wire-orange rounded-lg flex items-center justify-center">
            <Wifi size={13} className="text-white" />
          </div>
          <span className="text-white font-extrabold text-base">DHOS</span>
        </div>
        {tenant && (
          <p className="text-slate-500 text-xs mt-1.5 truncate font-medium">
            {tenant.businessName || tenant.name}
          </p>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-0.5">
        {NAV.map(item => <NavItem key={item.to} item={item} />)}
      </nav>

      {/* User footer */}
      <div className="px-4 py-4 border-t border-navy-800">
        <div className="flex items-center gap-2 mb-3">
          <div className="w-7 h-7 rounded-full bg-wire-blue/20 flex items-center justify-center text-wire-blue text-xs font-bold uppercase">
            {user?.fullName?.[0] ?? '?'}
          </div>
          <div className="min-w-0">
            <p className="text-white text-xs font-semibold truncate">{user?.fullName}</p>
            <p className="text-slate-500 text-[10px] truncate">{user?.tenantRole?.replace(/_/g, ' ')}</p>
          </div>
        </div>
        <button
          onClick={logout}
          className="w-full flex items-center gap-2 text-slate-400 hover:text-red-400 text-xs font-semibold py-1.5 px-2 rounded-lg hover:bg-red-950/30 transition-colors"
        >
          <LogOut size={13} /> Sign out
        </button>
      </div>
    </aside>
  );

  return (
    <div className="flex h-screen bg-slate-50 font-sans overflow-hidden">
      {/* Desktop sidebar */}
      <div className="hidden lg:flex">
        <Sidebar />
      </div>

      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-50 flex lg:hidden">
          <div className="fixed inset-0 bg-black/60" onClick={() => setSidebarOpen(false)} />
          <div className="relative z-10 w-56">
            <Sidebar />
          </div>
        </div>
      )}

      {/* Main content area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top bar */}
        <header className="h-14 flex items-center gap-3 px-4 border-b border-slate-200 bg-white shrink-0">
          <button
            className="lg:hidden text-slate-500 hover:text-slate-700"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu size={20} />
          </button>
          <span className="text-sm font-semibold text-navy-900 lg:hidden">
            {tenant?.businessName || 'DHOS'}
          </span>
          <div className="flex-1" />
          <a
            href="https://deroyalhotspot.name.ng/connect"
            target="_blank"
            rel="noreferrer"
            className="text-xs text-slate-500 hover:text-wire-blue font-medium transition-colors"
          >
            View Portal ↗
          </a>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
