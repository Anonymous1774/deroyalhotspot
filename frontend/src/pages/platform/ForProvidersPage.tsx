import React from 'react';
import { Link } from 'react-router-dom';
import {
  Server, Ticket, Activity, CheckCircle,
  ArrowRight, ChevronRight, Zap, Settings
} from 'lucide-react';
import { SEOHead } from '../../components/SEOHead';

const USE_CASES = [
  {
    icon: Server,
    colour: 'wire-orange',
    border: 'border-wire-orange-DEFAULT',
    bg: 'bg-wire-orange-DEFAULT/10',
    text: 'text-wire-orange-DEFAULT',
    title: 'Campus & Estate Wi-Fi',
    desc: 'Manage internet access across a residential estate, school campus, or compound with multiple routers and zones.',
  },
  {
    icon: Ticket,
    colour: 'wire-green',
    border: 'border-wire-green-DEFAULT',
    bg: 'bg-wire-green-DEFAULT/10',
    text: 'text-wire-green-DEFAULT',
    title: 'Event & Venue Hotspots',
    desc: 'Deploy temporary internet access at events, conferences, or venues using time-limited voucher plans.',
  },
  {
    icon: Activity,
    colour: 'wire-blue',
    border: 'border-wire-blue-DEFAULT',
    bg: 'bg-wire-blue-DEFAULT/10',
    text: 'text-wire-blue-DEFAULT',
    title: 'Community Networks',
    desc: 'Provide affordable, managed internet access to a community with the flexibility to set your own plans and pricing.',
  },
  {
    icon: Zap,
    colour: 'wire-brown',
    border: 'border-wire-brown-DEFAULT',
    bg: 'bg-wire-brown-DEFAULT/10',
    text: 'text-wire-brown-DEFAULT',
    title: 'ISP Hotspot Add-On',
    desc: 'Add a hotspot portal layer to an existing MikroTik infrastructure to monetise and manage public Wi-Fi.',
  },
];

const WHAT_YOU_GET = [
  'Full DHOS admin dashboard access',
  'Router registration and health monitoring',
  'Internet plan creation and management',
  'Bandwidth profile configuration',
  'Voucher generation and distribution tools',
  'Live session monitoring and device tracking',
  'Audit log and system event history',
  'Captive portal for end-user voucher activation',
  'MikroTik RouterOS API integration (RouterOS v6/v7)',
  'JWT-secured admin access with Argon2id password hashing',
];

export const ForProvidersPage: React.FC = () => {
  return (
    <>
      <SEOHead
        title="For Hotspot Operators | DHOS | De Royal Hotspot"
        description="DHOS helps hotspot operators manage MikroTik routers, internet plans, and voucher systems at scale. Enquire about DHOS for your network."
        canonicalPath="/platform/for-providers"
      />

      {/* Page header */}
      <section className="bg-hero-gradient py-16 relative overflow-hidden">
        <div className="wire-bar absolute top-0 left-0 right-0" />
        <div className="absolute inset-0 opacity-[0.03] pointer-events-none"
          style={{ backgroundImage: 'radial-gradient(circle, #3B82F6 1px, transparent 1px)', backgroundSize: '40px 40px' }} />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-4">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-wire-orange-DEFAULT/10 border border-wire-orange-DEFAULT/25 text-wire-orange-DEFAULT text-xs font-bold uppercase tracking-wider">
            <span className="w-2 h-2 rounded-full bg-wire-orange-DEFAULT" />
            For Hotspot Operators
          </div>
          <h1 className="text-4xl sm:text-5xl font-extrabold text-white tracking-tight">
            Run Your Hotspot Business with DHOS
          </h1>
          <p className="text-white/55 text-lg max-w-2xl mx-auto">
            If you operate a MikroTik-based hotspot network, DHOS gives you the management platform to run it professionally â€” from voucher sales to real-time monitoring.
          </p>
        </div>
      </section>

      {/* Use cases */}
      <section className="py-20 bg-surface-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14 space-y-4">
            <h2 className="text-3xl font-extrabold text-navy-900">Who DHOS is Built For</h2>
            <p className="text-slate-500 max-w-lg mx-auto text-sm">
              DHOS is suitable for any operator running a MikroTik hotspot with a voucher-based access model.
            </p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {USE_CASES.map((uc) => {
              const Icon = uc.icon;
              return (
                <div key={uc.title} className={`bg-white rounded-2xl border-2 ${uc.border} p-6 space-y-4 hover:shadow-card-hover transition-all duration-200 hover:-translate-y-1`}>
                  <div className={`w-12 h-12 rounded-xl ${uc.bg} flex items-center justify-center`}>
                    <Icon size={22} className={uc.text} />
                  </div>
                  <h3 className="font-extrabold text-navy-900">{uc.title}</h3>
                  <p className="text-sm text-slate-500 leading-relaxed">{uc.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* What you get */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-14 items-start">
            <div className="space-y-6">
              <h2 className="text-3xl font-extrabold text-navy-900">What's Included in DHOS</h2>
              <p className="text-slate-500 leading-relaxed text-sm">
                Everything listed below is currently implemented and operational in the production DHOS system powering De Royal Hotspot. No feature is listed that is not built.
              </p>
              <div className="space-y-2.5">
                {WHAT_YOU_GET.map((item) => (
                  <div key={item} className="flex items-start gap-3 text-sm text-slate-600">
                    <CheckCircle size={15} className="text-wire-green-DEFAULT flex-shrink-0 mt-0.5" />
                    {item}
                  </div>
                ))}
              </div>
            </div>

            {/* Requirements card */}
            <div className="space-y-6">
              <div className="bg-navy-950 rounded-2xl border border-white/5 p-8 space-y-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-wire-orange-DEFAULT/10 flex items-center justify-center">
                    <Settings size={20} className="text-wire-orange-DEFAULT" />
                  </div>
                  <h3 className="font-bold text-white">Infrastructure Requirements</h3>
                </div>
                <div className="space-y-3">
                  {[
                    { label: 'MikroTik router running RouterOS v6 or v7', note: 'Required' },
                    { label: 'RouterOS API enabled on the router',         note: 'Required' },
                    { label: 'VPS or server for DHOS backend',             note: 'Required' },
                    { label: 'PostgreSQL 14+ database',                    note: 'Required' },
                    { label: 'Node.js 18+ runtime',                        note: 'Required' },
                    { label: 'SSL certificate (recommended for production)', note: 'Recommended' },
                  ].map((req) => (
                    <div key={req.label} className="flex justify-between items-start gap-4 py-2 border-b border-white/5 last:border-0">
                      <span className="text-sm text-white/60">{req.label}</span>
                      <span className={`text-[10px] font-bold uppercase flex-shrink-0 px-2 py-0.5 rounded ${
                        req.note === 'Required'
                          ? 'bg-wire-orange-DEFAULT/15 text-wire-orange-DEFAULT'
                          : 'bg-wire-green-DEFAULT/15 text-wire-green-DEFAULT'
                      }`}>
                        {req.note}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* CTA card */}
              <div className="bg-wire-orange-DEFAULT rounded-2xl p-8 space-y-4">
                <h3 className="font-extrabold text-white text-xl">Enquire About DHOS</h3>
                <p className="text-white/80 text-sm">
                  Reach out to discuss deploying DHOS for your hotspot network. We'll confirm what's right for your infrastructure.
                </p>
                <Link
                  to="/platform/demo"
                  className="flex items-center gap-2 px-6 py-3 bg-white text-wire-orange-DEFAULT font-extrabold rounded-xl text-sm hover:bg-orange-50 transition-all"
                >
                  Request a Demo
                  <ArrowRight size={14} />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Nav links */}
      <section className="py-10 bg-surface-100 border-t border-surface-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-wrap gap-5 items-center justify-between">
          <div className="flex flex-wrap gap-4">
            <Link to="/platform" className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-navy-900 font-medium transition-colors">
              <ChevronRight size={14} /> Platform Overview
            </Link>
            <Link to="/platform/features" className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-navy-900 font-medium transition-colors">
              <ChevronRight size={14} /> All Features
            </Link>
          </div>
          <Link
            to="/platform/demo"
            className="flex items-center gap-2 px-5 py-2.5 bg-navy-900 hover:bg-navy-800 text-white font-bold rounded-xl text-sm transition-all"
          >
            Request a Demo <ArrowRight size={13} />
          </Link>
        </div>
      </section>
    </>
  );
};
