import React from 'react';
import { Link } from 'react-router-dom';
import {
  Server, Wifi, Ticket, Activity, BarChart3, Shield,
  History, Settings, Network, CheckCircle,
  ArrowRight, Info
} from 'lucide-react';
import { SEOHead } from '../../components/SEOHead';

const FEATURES = [
  {
    section: 'Router Management',
    colour: 'wire-orange',
    border: 'border-wire-orange-DEFAULT',
    bg: 'bg-wire-orange-DEFAULT/8',
    text: 'text-wire-orange-DEFAULT',
    icon: Server,
    available: true,
    items: [
      { label: 'Register MikroTik routers via RouterOS API', done: true },
      { label: 'Real-time online/offline/degraded status', done: true },
      { label: 'Latency monitoring and health checks', done: true },
      { label: 'Per-router voucher and session counters', done: true },
      { label: 'Router enable/disable toggle', done: true },
      { label: 'SSL API connection support', done: true },
    ],
  },
  {
    section: 'Internet Plans',
    colour: 'wire-green',
    border: 'border-wire-green-DEFAULT',
    bg: 'bg-wire-green-DEFAULT/8',
    text: 'text-wire-green-DEFAULT',
    icon: Wifi,
    available: true,
    items: [
      { label: 'Create plans with custom name and description', done: true },
      { label: 'Flexible duration: minutes, hours, days, weeks', done: true },
      { label: 'Assign bandwidth profiles per plan', done: true },
      { label: 'Set plan price', done: true },
      { label: 'Public API exposes active plans to the portal', done: true },
    ],
  },
  {
    section: 'Bandwidth Profiles',
    colour: 'wire-blue',
    border: 'border-wire-blue-DEFAULT',
    bg: 'bg-wire-blue-DEFAULT/8',
    text: 'text-wire-blue-DEFAULT',
    icon: Network,
    available: true,
    items: [
      { label: 'Create named bandwidth profiles', done: true },
      { label: 'Set download and upload speed limits', done: true },
      { label: 'Map to MikroTik queue names', done: true },
      { label: 'Assign profiles to internet plans', done: true },
    ],
  },
  {
    section: 'Voucher System',
    colour: 'wire-brown',
    border: 'border-wire-brown-DEFAULT',
    bg: 'bg-wire-brown-DEFAULT/8',
    text: 'text-wire-brown-DEFAULT',
    icon: Ticket,
    available: true,
    items: [
      { label: 'Generate individual or batch voucher codes', done: true },
      { label: 'Assign vouchers to specific plans and routers', done: true },
      { label: 'Track status: UNUSED / ACTIVE / EXPIRED', done: true },
      { label: 'View activation IP, MAC, and timestamp', done: true },
      { label: 'Public voucher activation endpoint', done: true },
      { label: 'MikroTik login form POST redirect on activation', done: true },
    ],
  },
  {
    section: 'Session Monitoring',
    colour: 'wire-orange',
    border: 'border-wire-orange-DEFAULT',
    bg: 'bg-wire-orange-DEFAULT/8',
    text: 'text-wire-orange-DEFAULT',
    icon: Activity,
    available: true,
    items: [
      { label: 'List all active hotspot sessions', done: true },
      { label: 'View username, IP, MAC, and login time', done: true },
      { label: 'Session status: ONLINE / OFFLINE / EXPIRED', done: true },
      { label: 'Data usage per session (MB in/out)', done: true },
      { label: 'Automatic device reauthentication on return', done: true },
    ],
  },
  {
    section: 'Admin Dashboard',
    colour: 'wire-green',
    border: 'border-wire-green-DEFAULT',
    bg: 'bg-wire-green-DEFAULT/8',
    text: 'text-wire-green-DEFAULT',
    icon: BarChart3,
    available: true,
    items: [
      { label: 'Overview stats: plans, vouchers, sessions', done: true },
      { label: 'Active device count and data usage summary', done: true },
      { label: 'Router status summary panel', done: true },
      { label: 'Recent system activity feed', done: true },
      { label: 'Hourly traffic trend chart', done: true },
    ],
  },
  {
    section: 'Audit Logging',
    colour: 'wire-blue',
    border: 'border-wire-blue-DEFAULT',
    bg: 'bg-wire-blue-DEFAULT/8',
    text: 'text-wire-blue-DEFAULT',
    icon: History,
    available: true,
    items: [
      { label: 'Full admin action audit trail', done: true },
      { label: 'Module-level log categorisation', done: true },
      { label: 'Server error auto-logging', done: true },
      { label: 'IP address tracking on admin actions', done: true },
    ],
  },
  {
    section: 'Security & Access',
    colour: 'wire-brown',
    border: 'border-wire-brown-DEFAULT',
    bg: 'bg-wire-brown-DEFAULT/8',
    text: 'text-wire-brown-DEFAULT',
    icon: Shield,
    available: true,
    items: [
      { label: 'JWT-based admin authentication', done: true },
      { label: 'Argon2id password hashing', done: true },
      { label: 'Protected admin routes with token verification', done: true },
      { label: 'API rate limiting', done: true },
      { label: 'Helmet.js security headers', done: true },
    ],
  },
  {
    section: 'Settings',
    colour: 'wire-orange',
    border: 'border-wire-orange-DEFAULT',
    bg: 'bg-wire-orange-DEFAULT/8',
    text: 'text-wire-orange-DEFAULT',
    icon: Settings,
    available: true,
    items: [
      { label: 'Key-value system settings store', done: true },
      { label: 'Configurable via admin dashboard', done: true },
    ],
  },
];

export const PlatformFeaturesPage: React.FC = () => {
  return (
    <>
      <SEOHead
        title="Platform Features | DHOS | De Royal Hotspot"
        description="Detailed breakdown of all DHOS platform features including router management, vouchers, sessions, analytics, and security."
        canonicalPath="/platform/features"
      />

      {/* Page header */}
      <section className="bg-hero-gradient py-16 relative overflow-hidden">
        <div className="wire-bar absolute top-0 left-0 right-0" />
        <div className="absolute inset-0 opacity-[0.03] pointer-events-none"
          style={{ backgroundImage: 'radial-gradient(circle, #3B82F6 1px, transparent 1px)', backgroundSize: '40px 40px' }} />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-4">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-wire-blue-DEFAULT/10 border border-wire-blue-DEFAULT/25 text-wire-blue-DEFAULT text-xs font-bold uppercase tracking-wider">
            <span className="w-2 h-2 rounded-full bg-wire-blue-DEFAULT" />
            DHOS Platform
          </div>
          <h1 className="text-4xl sm:text-5xl font-extrabold text-white tracking-tight">
            Platform Features
          </h1>
          <p className="text-white/55 text-lg max-w-xl mx-auto">
            A complete breakdown of every feature available in the current DHOS release.
          </p>
        </div>
      </section>

      {/* Legend */}
      <div className="bg-navy-950 border-b border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center gap-6 text-xs text-white/40">
          <div className="flex items-center gap-2">
            <CheckCircle size={12} className="text-wire-green-DEFAULT" />
            <span>Implemented and available</span>
          </div>
          <div className="flex items-center gap-2">
            <Info size={12} className="text-wire-orange-DEFAULT" />
            <span>Planned  not yet available</span>
          </div>
        </div>
      </div>

      {/* Feature sections */}
      <section className="py-16 bg-surface-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          <div className="grid lg:grid-cols-2 gap-6">
            {FEATURES.map((section) => {
              const Icon = section.icon;
              return (
                <article
                  key={section.section}
                  className={`bg-white rounded-2xl border-2 ${section.border} overflow-hidden`}
                >
                  <div className={`${section.bg} px-6 py-4 flex items-center gap-4 border-b ${section.border}`}>
                    <div className={`w-10 h-10 rounded-xl bg-white/80 flex items-center justify-center`}>
                      <Icon size={20} className={section.text} />
                    </div>
                    <div className="flex-1">
                      <h2 className={`font-extrabold ${section.text} text-base`}>{section.section}</h2>
                    </div>
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold bg-wire-green-DEFAULT/10 text-wire-green-DEFAULT border border-wire-green-DEFAULT/30 px-2 py-1 rounded-full uppercase tracking-wider">
                      <CheckCircle size={9} /> Live
                    </span>
                  </div>
                  <div className="p-6">
                    <ul className="space-y-2.5">
                      {section.items.map((item) => (
                        <li key={item.label} className="flex items-start gap-3 text-sm text-slate-600">
                          <CheckCircle size={14} className="text-wire-green-DEFAULT flex-shrink-0 mt-0.5" />
                          {item.label}
                        </li>
                      ))}
                    </ul>
                  </div>
                </article>
              );
            })}
          </div>

          {/* CTA */}
          <div className="bg-navy-950 rounded-2xl border border-white/5 p-8 text-center space-y-5 mt-6">
            <h3 className="text-white font-extrabold text-2xl">Want DHOS for Your Hotspot?</h3>
            <p className="text-white/50 text-sm max-w-sm mx-auto">
              Contact us to discuss deploying DHOS for your own network operation.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link
                to="/platform/demo"
                className="inline-flex items-center gap-2 px-6 py-3 bg-wire-orange-DEFAULT hover:bg-wire-orange-dark text-white font-bold rounded-xl text-sm transition-all shadow-wire-orange"
              >
                Request a Demo <ArrowRight size={14} />
              </Link>
              <Link
                to="/platform/for-providers"
                className="inline-flex items-center gap-2 px-6 py-3 border border-white/15 text-white/70 hover:text-white hover:border-white/25 font-semibold rounded-xl text-sm transition-all"
              >
                For Operators
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};
