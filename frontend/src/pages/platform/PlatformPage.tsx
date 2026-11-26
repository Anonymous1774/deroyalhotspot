import React from 'react';
import { Link } from 'react-router-dom';
import {
  Server, Wifi, Ticket, Activity, BarChart3, Shield,
  CheckCircle, ArrowRight, ChevronRight, Globe
} from 'lucide-react';
import { SEOHead } from '../../components/SEOHead';

const PILLARS = [
  {
    icon: Server,
    colour: 'wire-orange',
    border: 'border-wire-orange-DEFAULT',
    bg: 'bg-wire-orange-DEFAULT/10',
    text: 'text-wire-orange-DEFAULT',
    title: 'Router Management',
    desc: 'Register and monitor MikroTik routers. Track online/offline status, latency, and health in real time.',
  },
  {
    icon: Wifi,
    colour: 'wire-green',
    border: 'border-wire-green-DEFAULT',
    bg: 'bg-wire-green-DEFAULT/10',
    text: 'text-wire-green-DEFAULT',
    title: 'Internet Plans',
    desc: 'Create and manage internet packages with custom durations and bandwidth profiles.',
  },
  {
    icon: Ticket,
    colour: 'wire-blue',
    border: 'border-wire-blue-DEFAULT',
    bg: 'bg-wire-blue-DEFAULT/10',
    text: 'text-wire-blue-DEFAULT',
    title: 'Voucher System',
    desc: 'Generate, distribute, and track voucher codes. Monitor usage and activation status.',
  },
  {
    icon: Activity,
    colour: 'wire-brown',
    border: 'border-wire-brown-DEFAULT',
    bg: 'bg-wire-brown-DEFAULT/10',
    text: 'text-wire-brown-DEFAULT',
    title: 'Session Monitoring',
    desc: 'View all active hotspot sessions, connected devices, data usage, and uptime.',
  },
  {
    icon: BarChart3,
    colour: 'wire-orange',
    border: 'border-wire-orange-DEFAULT',
    bg: 'bg-wire-orange-DEFAULT/10',
    text: 'text-wire-orange-DEFAULT',
    title: 'Usage Analytics',
    desc: 'Track data consumption, session counts, and revenue metrics through the admin dashboard.',
  },
  {
    icon: Globe,
    colour: 'wire-green',
    border: 'border-wire-green-DEFAULT',
    bg: 'bg-wire-green-DEFAULT/10',
    text: 'text-wire-green-DEFAULT',
    title: 'Multi-Router Support',
    desc: 'Manage multiple access points across different locations from a single DHOS instance.',
  },
];

export const PlatformPage: React.FC = () => {
  return (
    <>
      <SEOHead
        title="DHOS Platform | De Royal Hotspot"
        description="DHOS is the hotspot management platform powering De Royal Hotspot. Manage routers, plans, vouchers, and sessions from one dashboard."
        canonicalPath="/platform"
      />

      {/* Hero */}
      <section className="bg-hero-gradient py-20 lg:py-28 relative overflow-hidden">
        <div className="wire-bar absolute top-0 left-0 right-0" />
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute top-20 right-0 w-96 h-96 bg-wire-blue-DEFAULT/6 rounded-full blur-3xl" />
          <div className="absolute bottom-10 left-10 w-72 h-72 bg-wire-orange-DEFAULT/5 rounded-full blur-3xl" />
          <div className="absolute inset-0 opacity-[0.03]"
            style={{ backgroundImage: 'radial-gradient(circle, #3B82F6 1px, transparent 1px)', backgroundSize: '40px 40px' }} />
        </div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl space-y-8">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-wire-blue-DEFAULT/10 border border-wire-blue-DEFAULT/25 text-wire-blue-DEFAULT text-xs font-bold uppercase tracking-wider">
              <span className="w-2 h-2 rounded-full bg-wire-blue-DEFAULT" />
              Technology Platform
            </div>
            <h1 className="text-5xl sm:text-6xl font-extrabold text-white leading-tight tracking-tight">
              Meet{' '}
              <span className="text-wire-blue-DEFAULT">DHOS</span>
            </h1>
            <p className="text-xl text-white/60 leading-relaxed">
              De Royal Hotspot OS â€” the management platform built to operate, monitor, and scale hotspot networks. DHOS powers the De Royal Hotspot service and is designed for hotspot operators who need reliable, full-stack control.
            </p>
            <div className="flex flex-wrap gap-4 pt-2">
              <Link
                to="/platform/features"
                className="flex items-center gap-2 px-7 py-4 bg-wire-blue-DEFAULT hover:bg-wire-blue-dark text-white font-extrabold rounded-xl text-base transition-all shadow-wire-blue hover:-translate-y-0.5"
              >
                See All Features
                <ArrowRight size={16} />
              </Link>
              <Link
                to="/platform/for-providers"
                className="flex items-center gap-2 px-7 py-4 bg-white/5 hover:bg-white/10 text-white font-semibold rounded-xl text-base border border-white/15 hover:border-white/25 transition-all"
              >
                For Hotspot Operators
                <ChevronRight size={16} />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* What is DHOS */}
      <section className="py-20 bg-surface-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-14 items-center">
            <div className="space-y-6">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-wire-orange-DEFAULT/8 border border-wire-orange-DEFAULT/20 text-wire-orange-DEFAULT text-xs font-bold uppercase tracking-wider">
                <span className="w-2 h-2 rounded-full bg-wire-orange-DEFAULT" />
                What is DHOS?
              </div>
              <h2 className="text-4xl font-extrabold text-navy-900 leading-tight">
                Full-Stack Hotspot Management â€” in One Platform
              </h2>
              <p className="text-slate-500 leading-relaxed">
                DHOS is a web-based hotspot management system built on Node.js, React, and PostgreSQL. It integrates directly with MikroTik RouterOS via the RouterOS API to provide real-time control over hotspot access, bandwidth, and sessions.
              </p>
              <p className="text-slate-500 leading-relaxed">
                Operators use DHOS to manage their entire hotspot operation â€” from creating plans and generating vouchers, to monitoring active users and reviewing system logs â€” all from a single, secure dashboard.
              </p>
              <div className="space-y-2.5 pt-2">
                {[
                  'Real-time MikroTik RouterOS integration',
                  'Voucher-based authentication flow',
                  'Bandwidth profile management',
                  'Live session and data usage monitoring',
                  'Complete audit log of all system events',
                  'Secure admin access with JWT authentication',
                ].map((item) => (
                  <div key={item} className="flex items-center gap-3 text-sm text-slate-600">
                    <CheckCircle size={15} className="text-wire-green-DEFAULT flex-shrink-0" />
                    {item}
                  </div>
                ))}
              </div>
            </div>

            {/* Architecture card */}
            <div className="bg-navy-950 rounded-2xl border border-white/5 p-8 space-y-6">
              <h3 className="text-white font-bold text-sm uppercase tracking-wider">Technology Stack</h3>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { label: 'React 18',         tag: 'Frontend',  colour: 'border-wire-blue-DEFAULT/40 text-wire-blue-DEFAULT' },
                  { label: 'TypeScript',        tag: 'Language',  colour: 'border-wire-green-DEFAULT/40 text-wire-green-DEFAULT' },
                  { label: 'Node.js + Express', tag: 'Backend',   colour: 'border-wire-orange-DEFAULT/40 text-wire-orange-DEFAULT' },
                  { label: 'PostgreSQL',         tag: 'Database',  colour: 'border-wire-brown-DEFAULT/40 text-wire-brown-DEFAULT' },
                  { label: 'Prisma ORM',         tag: 'Data',      colour: 'border-wire-blue-DEFAULT/40 text-wire-blue-DEFAULT' },
                  { label: 'MikroTik API',       tag: 'Network',   colour: 'border-wire-orange-DEFAULT/40 text-wire-orange-DEFAULT' },
                  { label: 'JWT + Argon2id',     tag: 'Auth',      colour: 'border-wire-green-DEFAULT/40 text-wire-green-DEFAULT' },
                  { label: 'Tailwind CSS',       tag: 'Styling',   colour: 'border-wire-brown-DEFAULT/40 text-wire-brown-DEFAULT' },
                ].map((tech) => (
                  <div key={tech.label} className={`rounded-xl border ${tech.colour} p-3 space-y-1`}>
                    <p className="text-[10px] text-white/30 font-bold uppercase tracking-widest">{tech.tag}</p>
                    <p className={`text-sm font-bold ${tech.colour.split(' ')[1]}`}>{tech.label}</p>
                  </div>
                ))}
              </div>
              <div className="border-t border-white/5 pt-5">
                <div className="flex items-center gap-2 text-xs text-white/30">
                  <Shield size={12} className="text-wire-green-DEFAULT" />
                  <span>Open source Â· Self-hosted Â· MIT Licensed</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Platform pillars */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14 space-y-4">
            <h2 className="text-4xl font-extrabold text-navy-900">Core Capabilities</h2>
            <p className="text-slate-500 max-w-xl mx-auto">
              Every module in DHOS is built and operational in the current production system.
            </p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {PILLARS.map((p) => {
              const Icon = p.icon;
              return (
                <div key={p.title} className={`bg-surface-100 rounded-2xl border-2 ${p.border} p-6 space-y-4 hover:shadow-card-hover transition-all duration-200 hover:-translate-y-1`}>
                  <div className={`w-12 h-12 rounded-xl ${p.bg} flex items-center justify-center`}>
                    <Icon size={22} className={p.text} />
                  </div>
                  <h3 className="font-extrabold text-navy-900 text-lg">{p.title}</h3>
                  <p className="text-sm text-slate-500 leading-relaxed">{p.desc}</p>
                </div>
              );
            })}
          </div>
          <div className="text-center mt-10">
            <Link
              to="/platform/features"
              className="inline-flex items-center gap-2 px-6 py-3 bg-navy-900 hover:bg-navy-800 text-white font-bold rounded-xl text-sm transition-all"
            >
              Full Feature Overview <ArrowRight size={14} />
            </Link>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 bg-navy-950 border-t border-white/5">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6">
          <h2 className="text-3xl font-extrabold text-white">Interested in DHOS for Your Network?</h2>
          <p className="text-white/50 max-w-lg mx-auto">
            If you operate a hotspot network and want to explore DHOS as a management solution, get in touch.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link
              to="/platform/demo"
              className="flex items-center gap-2 px-7 py-3.5 bg-wire-orange-DEFAULT hover:bg-wire-orange-dark text-white font-bold rounded-xl text-sm transition-all shadow-wire-orange"
            >
              Request a Demo
              <ArrowRight size={15} />
            </Link>
            <Link
              to="/platform/for-providers"
              className="flex items-center gap-2 px-7 py-3.5 border border-white/15 text-white/70 hover:text-white hover:border-white/25 font-semibold rounded-xl text-sm transition-all"
            >
              For Operators
              <ChevronRight size={15} />
            </Link>
          </div>
        </div>
      </section>
    </>
  );
};
