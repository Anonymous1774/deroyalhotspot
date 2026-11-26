import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Wifi, ArrowRight, Zap, Shield, Clock, Headphones,
  CheckCircle, ChevronRight, Server, BarChart3, Ticket,
  Network, Activity, Globe
} from 'lucide-react';
import api from '../../services/api';
import { Plan } from '../../types';
import { SEOHead } from '../../components/SEOHead';

// â”€â”€ Helper â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
const formatDuration = (duration: number, unit: string): string => {
  if (unit === 'minutes') {
    if (duration < 60) return `${duration} min`;
    return `${Math.round(duration / 60)} hr${duration >= 120 ? 's' : ''}`;
  }
  if (unit === 'hours')   return `${duration} hr${duration > 1 ? 's' : ''}`;
  if (unit === 'days')    return `${duration} day${duration > 1 ? 's' : ''}`;
  if (unit === 'weeks')   return `${duration} week${duration > 1 ? 's' : ''}`;
  return `${duration} ${unit}`;
};

// Wire colour accent per plan index
const WIRE_ACCENTS = [
  { border: 'border-wire-orange-DEFAULT', badge: 'bg-wire-orange-DEFAULT/10 text-wire-orange-DEFAULT border-wire-orange-DEFAULT/30', dot: 'bg-wire-orange-DEFAULT', icon: 'text-wire-orange-DEFAULT' },
  { border: 'border-wire-green-DEFAULT',  badge: 'bg-wire-green-DEFAULT/10 text-wire-green-DEFAULT border-wire-green-DEFAULT/30',   dot: 'bg-wire-green-DEFAULT',  icon: 'text-wire-green-DEFAULT'  },
  { border: 'border-wire-blue-DEFAULT',   badge: 'bg-wire-blue-DEFAULT/10 text-wire-blue-DEFAULT border-wire-blue-DEFAULT/30',      dot: 'bg-wire-blue-DEFAULT',   icon: 'text-wire-blue-DEFAULT'   },
  { border: 'border-wire-brown-DEFAULT',  badge: 'bg-wire-brown-DEFAULT/10 text-wire-brown-DEFAULT border-wire-brown-DEFAULT/30',   dot: 'bg-wire-brown-DEFAULT',  icon: 'text-wire-brown-DEFAULT'  },
];

const FEATURES = [
  {
    icon: Zap,
    color: 'text-wire-orange-DEFAULT',
    bg:    'bg-wire-orange-DEFAULT/10',
    title: 'Fast & Reliable',
    desc:  'High-speed internet with consistent bandwidth delivered through managed MikroTik infrastructure.',
  },
  {
    icon: Ticket,
    color: 'text-wire-green-DEFAULT',
    bg:    'bg-wire-green-DEFAULT/10',
    title: 'Simple Voucher Access',
    desc:  'Purchase a voucher and activate access instantly â€” no account creation or registration required.',
  },
  {
    icon: Clock,
    color: 'text-wire-blue-DEFAULT',
    bg:    'bg-wire-blue-DEFAULT/10',
    title: 'Flexible Packages',
    desc:  'Choose from time-based plans to suit your needs â€” from hourly passes to multi-day access.',
  },
  {
    icon: Shield,
    color: 'text-wire-brown-DEFAULT',
    bg:    'bg-wire-brown-DEFAULT/10',
    title: 'Secure Network',
    desc:  'Connections are managed through enterprise-grade hotspot authentication on MikroTik RouterOS.',
  },
  {
    icon: Network,
    color: 'text-wire-orange-DEFAULT',
    bg:    'bg-wire-orange-DEFAULT/10',
    title: 'Auto Device Login',
    desc:  'Return visitors are automatically reconnected without re-entering voucher codes.',
  },
  {
    icon: Headphones,
    color: 'text-wire-green-DEFAULT',
    bg:    'bg-wire-green-DEFAULT/10',
    title: 'Support Available',
    desc:  'Reach us by phone or email whenever you need help with your connection.',
  },
];

const HOW_IT_WORKS = [
  { step: '01', title: 'Connect to Wi-Fi', desc: 'Find and connect to the De Royal Hotspot Wi-Fi network on your device.' },
  { step: '02', title: 'Open the Portal',  desc: 'Your browser will open the connection portal automatically.' },
  { step: '03', title: 'Choose a Plan',    desc: 'Select an internet package or enter your pre-purchased voucher code.' },
  { step: '04', title: 'Activate Access',  desc: 'Complete the activation and your device will be authenticated instantly.' },
  { step: '05', title: 'Start Browsing',   desc: 'You\'re connected. Browse freely until your session time elapses.' },
];

const DHOS_FEATURES = [
  { icon: Server,     label: 'Router Management' },
  { icon: Wifi,       label: 'Internet Plans'    },
  { icon: Ticket,     label: 'Voucher Generation' },
  { icon: Activity,   label: 'Live Sessions'     },
  { icon: BarChart3,  label: 'Usage Analytics'   },
  { icon: Globe,      label: 'Multi-Router Support' },
];

// â”€â”€ Network illustration SVG â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
const NetworkIllustration: React.FC = () => (
  <svg
    viewBox="0 0 500 380"
    xmlns="http://www.w3.org/2000/svg"
    className="w-full h-auto"
    aria-hidden="true"
  >
    {/* Background circles */}
    <circle cx="250" cy="190" r="160" fill="none" stroke="rgba(59,130,246,0.08)" strokeWidth="1" />
    <circle cx="250" cy="190" r="120" fill="none" stroke="rgba(59,130,246,0.06)" strokeWidth="1" />
    <circle cx="250" cy="190" r="80"  fill="none" stroke="rgba(59,130,246,0.1)"  strokeWidth="1" />

    {/* Router / hub */}
    <rect x="215" y="155" width="70" height="70" rx="14" fill="#172554" stroke="#3B82F6" strokeWidth="1.5" />
    <text x="250" y="186" textAnchor="middle" fill="#3B82F6" fontSize="22">ðŸ“¡</text>
    <text x="250" y="208" textAnchor="middle" fill="rgba(255,255,255,0.5)" fontSize="9" fontFamily="monospace">ROUTER</text>

    {/* Wire strands: orange */}
    <path d="M250,155 Q200,100 140,80"  stroke="#F97316" strokeWidth="3" fill="none" strokeLinecap="round" opacity="0.9" />
    <path d="M250,155 Q220,90  170,60"  stroke="#F97316" strokeWidth="1.5" fill="none" strokeLinecap="round" opacity="0.4" />

    {/* Wire strands: green */}
    <path d="M250,155 Q300,100 360,80"  stroke="#22C55E" strokeWidth="3" fill="none" strokeLinecap="round" opacity="0.9" />
    <path d="M250,155 Q280,90  330,60"  stroke="#22C55E" strokeWidth="1.5" fill="none" strokeLinecap="round" opacity="0.4" />

    {/* Wire strands: blue */}
    <path d="M250,225 Q200,280 140,300" stroke="#3B82F6" strokeWidth="3" fill="none" strokeLinecap="round" opacity="0.9" />
    <path d="M250,225 Q220,290 170,320" stroke="#3B82F6" strokeWidth="1.5" fill="none" strokeLinecap="round" opacity="0.4" />

    {/* Wire strands: brown */}
    <path d="M250,225 Q300,280 360,300" stroke="#B45309" strokeWidth="3" fill="none" strokeLinecap="round" opacity="0.9" />
    <path d="M250,225 Q280,290 330,320" stroke="#B45309" strokeWidth="1.5" fill="none" strokeLinecap="round" opacity="0.4" />

    {/* Device nodes */}
    {/* Orange â€” laptop */}
    <circle cx="130" cy="76"  r="22" fill="#1E3A8A" stroke="#F97316" strokeWidth="1.5" />
    <text x="130" y="82" textAnchor="middle" fontSize="18">ðŸ’»</text>

    {/* Green â€” phone */}
    <circle cx="368" cy="76"  r="22" fill="#1E3A8A" stroke="#22C55E" strokeWidth="1.5" />
    <text x="368" y="82" textAnchor="middle" fontSize="18">ðŸ“±</text>

    {/* Blue â€” tablet */}
    <circle cx="130" cy="304" r="22" fill="#1E3A8A" stroke="#3B82F6" strokeWidth="1.5" />
    <text x="130" y="310" textAnchor="middle" fontSize="18">ðŸ“²</text>

    {/* Brown â€” desktop */}
    <circle cx="368" cy="304" r="22" fill="#1E3A8A" stroke="#B45309" strokeWidth="1.5" />
    <text x="368" y="310" textAnchor="middle" fontSize="18">ðŸ–¥ï¸</text>

    {/* WiFi signal arcs above router */}
    <path d="M228,145 Q250,125 272,145" stroke="#3B82F6" strokeWidth="2" fill="none" strokeLinecap="round" opacity="0.7" />
    <path d="M218,135 Q250,110 282,135" stroke="#3B82F6" strokeWidth="1.5" fill="none" strokeLinecap="round" opacity="0.4" />
    <path d="M208,125 Q250,95  292,125" stroke="#3B82F6" strokeWidth="1" fill="none" strokeLinecap="round" opacity="0.2" />
  </svg>
);

// â”€â”€ Main Component â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
export const LandingPage: React.FC = () => {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [plansLoading, setPlansLoading] = useState(true);

  useEffect(() => {
    api.get('/plans')
      .then((res: { data: { success: boolean; data: { plans: Plan[] } } }) => {
        if (res.data?.success) {
          setPlans((res.data.data?.plans || []).slice(0, 4));
        }
      })
      .catch(() => {/* silently fail â€” no fallback prices displayed */})
      .finally(() => setPlansLoading(false));
  }, []);

  return (
    <>
      <SEOHead
        title="De Royal Hotspot | Stay Connected. Go Further."
        description="Reliable, flexible internet access through De Royal Hotspot. Choose a package, activate your voucher, and get online instantly."
        canonicalPath="/"
      />

      {/* â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
          HERO SECTION
          â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */}
      <section className="relative bg-hero-gradient min-h-[90vh] flex items-center overflow-hidden" aria-label="Hero">
        {/* Background decorative elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {/* Glow blobs */}
          <div className="absolute top-20 left-1/4 w-96 h-96 bg-wire-blue-DEFAULT/8 rounded-full blur-3xl" />
          <div className="absolute bottom-20 right-1/4 w-80 h-80 bg-wire-orange-DEFAULT/8 rounded-full blur-3xl" />
          {/* Grid */}
          <div
            className="absolute inset-0 opacity-[0.03]"
            style={{ backgroundImage: 'radial-gradient(circle, #3B82F6 1px, transparent 1px)', backgroundSize: '40px 40px' }}
          />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 grid lg:grid-cols-2 gap-12 items-center">
          {/* Left: copy */}
          <div className="text-white space-y-8">
            {/* Status badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-wire-green-DEFAULT/10 border border-wire-green-DEFAULT/25 text-wire-green-DEFAULT text-xs font-bold uppercase tracking-wider">
              <span className="w-2 h-2 rounded-full bg-wire-green-DEFAULT animate-pulse" />
              Hotspot Network Active
            </div>

            <div className="space-y-4">
              <h1 className="text-5xl sm:text-6xl lg:text-7xl font-extrabold leading-[1.08] tracking-tight">
                Stay{' '}
                <span className="relative">
                  Connected.
                  <span className="absolute -bottom-1 left-0 w-full wire-stripe opacity-70" />
                </span>
                <br />
                <span className="text-wire-orange-DEFAULT">Go Further.</span>
              </h1>
              <p className="text-lg sm:text-xl text-white/60 max-w-lg leading-relaxed">
                Reliable, flexible internet access designed to keep you connected when it matters. Choose a plan, activate your voucher, and get online instantly.
              </p>
            </div>

            {/* CTAs */}
            <div className="flex flex-wrap gap-4">
              <Link
                to="/connect"
                id="hero-cta-primary"
                className="flex items-center gap-2 px-7 py-4 bg-wire-orange-DEFAULT hover:bg-wire-orange-dark text-white font-extrabold rounded-xl text-base transition-all shadow-wire-orange hover:shadow-xl hover:-translate-y-0.5 active:translate-y-0"
              >
                <Wifi size={18} />
                Get Internet
                <ArrowRight size={16} />
              </Link>
              <Link
                to="/platform"
                id="hero-cta-secondary"
                className="flex items-center gap-2 px-7 py-4 bg-white/5 hover:bg-white/10 text-white font-semibold rounded-xl text-base border border-white/15 hover:border-white/25 transition-all"
              >
                Explore DHOS
                <ChevronRight size={16} />
              </Link>
            </div>

            {/* Trust signals */}
            <div className="flex items-center gap-6 pt-2">
              {[
                { dot: 'bg-wire-orange-DEFAULT', label: 'Instant Activation' },
                { dot: 'bg-wire-green-DEFAULT',  label: 'No Registration' },
                { dot: 'bg-wire-blue-DEFAULT',   label: 'Auto-Reconnect'  },
              ].map((s) => (
                <div key={s.label} className="flex items-center gap-2 text-sm text-white/50">
                  <span className={`w-2 h-2 rounded-full ${s.dot}`} />
                  {s.label}
                </div>
              ))}
            </div>
          </div>

          {/* Right: illustration */}
          <div className="hidden lg:flex justify-center animate-float">
            <div className="w-full max-w-sm">
              <NetworkIllustration />
            </div>
          </div>
        </div>
      </section>

      {/* â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
          INTERNET PLANS PREVIEW
          â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */}
      <section className="py-20 lg:py-28 bg-surface-100" id="plans" aria-label="Internet Plans">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Section header */}
          <div className="text-center mb-14 space-y-4">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-wire-blue-DEFAULT/8 border border-wire-blue-DEFAULT/20 text-wire-blue-DEFAULT text-xs font-bold uppercase tracking-wider">
              <span className="w-2 h-2 rounded-full bg-wire-blue-DEFAULT" />
              Available Packages
            </div>
            <h2 className="text-4xl sm:text-5xl font-extrabold text-navy-900 tracking-tight">
              Internet Plans
            </h2>
            <p className="text-lg text-slate-500 max-w-xl mx-auto">
              Flexible packages for every need. Activate instantly with a voucher â€” no account required.
            </p>
          </div>

          {/* Plan cards */}
          {plansLoading ? (
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="bg-white rounded-2xl border border-surface-300 p-6 animate-pulse space-y-4">
                  <div className="h-4 bg-slate-200 rounded w-3/4" />
                  <div className="h-8 bg-slate-200 rounded w-1/2" />
                  <div className="h-3 bg-slate-100 rounded w-full" />
                  <div className="h-3 bg-slate-100 rounded w-2/3" />
                </div>
              ))}
            </div>
          ) : plans.length === 0 ? (
            <div className="text-center py-12 text-slate-400">
              <Wifi size={40} className="mx-auto mb-3 opacity-30" />
              <p className="font-medium">Plans are loading or unavailable right now.</p>
              <Link to="/contact" className="text-wire-blue-DEFAULT text-sm mt-1 inline-block hover:underline">
                Contact us for pricing â†’
              </Link>
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {plans.map((plan, idx) => {
                const accent = WIRE_ACCENTS[idx % WIRE_ACCENTS.length];
                return (
                  <article
                    key={plan.id}
                    className={`bg-white rounded-2xl border-2 ${accent.border} p-6 space-y-4 hover:shadow-card-hover transition-all duration-200 hover:-translate-y-1 relative overflow-hidden group`}
                  >
                    {/* Top wire accent dot */}
                    <span className={`absolute top-0 right-0 w-16 h-16 rounded-bl-full opacity-5 ${accent.dot}`} />

                    <div className="space-y-1">
                      <h3 className="font-extrabold text-navy-900 text-lg leading-tight">{plan.name}</h3>
                      <div className={`inline-flex items-center gap-1.5 text-xs font-bold px-2.5 py-1 rounded-lg border ${accent.badge}`}>
                        <Clock size={10} />
                        {formatDuration(plan.duration, plan.durationUnit)}
                      </div>
                    </div>

                    <div className="text-3xl font-black text-navy-900">
                      â‚¦{plan.price.toLocaleString()}
                    </div>

                    {plan.bandwidthProfile && (
                      <div className="text-xs text-slate-400 space-y-1 pt-1 border-t border-slate-100">
                        <div className="flex justify-between">
                          <span>Download</span>
                          <span className="font-bold text-slate-600">{plan.bandwidthProfile.downloadSpeed}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Upload</span>
                          <span className="font-bold text-slate-600">{plan.bandwidthProfile.uploadSpeed}</span>
                        </div>
                      </div>
                    )}

                    <Link
                      to="/connect"
                      className={`w-full flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold transition-all border-2 ${accent.border} text-navy-900 hover:bg-navy-900 hover:text-white`}
                    >
                      Get This Plan
                      <ArrowRight size={14} />
                    </Link>
                  </article>
                );
              })}
            </div>
          )}

          <div className="text-center mt-10">
            <Link
              to="/pricing"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl border-2 border-navy-800 text-navy-800 font-bold hover:bg-navy-900 hover:text-white transition-all text-sm"
            >
              View All Plans
              <ArrowRight size={15} />
            </Link>
          </div>
        </div>
      </section>

      {/* â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
          HOW IT WORKS
          â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */}
      <section className="py-20 lg:py-28 bg-navy-950 relative overflow-hidden" id="how-it-works" aria-label="How It Works">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-0 right-0 wire-bar opacity-60" />
          <div className="absolute bottom-0 left-0 right-0 wire-bar opacity-60" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-wire-blue-DEFAULT/4 rounded-full blur-3xl" />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16 space-y-4">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-wire-orange-DEFAULT/10 border border-wire-orange-DEFAULT/25 text-wire-orange-DEFAULT text-xs font-bold uppercase tracking-wider">
              <span className="w-2 h-2 rounded-full bg-wire-orange-DEFAULT" />
              Simple Process
            </div>
            <h2 className="text-4xl sm:text-5xl font-extrabold text-white tracking-tight">
              How It Works
            </h2>
            <p className="text-lg text-white/50 max-w-lg mx-auto">
              Getting connected is straightforward. Follow these steps to get online in minutes.
            </p>
          </div>

          <div className="grid md:grid-cols-5 gap-6 md:gap-4">
            {HOW_IT_WORKS.map((step, idx) => {
              const accent = WIRE_ACCENTS[idx % WIRE_ACCENTS.length];
              return (
                <div key={step.step} className="relative text-center space-y-4 group">
                  {/* Connector line (not on last item) */}
                  {idx < HOW_IT_WORKS.length - 1 && (
                    <div className="hidden md:block absolute top-10 left-[60%] right-[-40%] h-0.5 bg-gradient-to-r from-white/15 to-white/5" />
                  )}
                  <div className={`w-20 h-20 mx-auto rounded-2xl bg-navy-900 border-2 ${accent.border} flex items-center justify-center group-hover:scale-105 transition-transform`}>
                    <span className={`text-2xl font-black ${accent.icon}`}>{step.step}</span>
                  </div>
                  <div className="space-y-2">
                    <h3 className="font-bold text-white text-base">{step.title}</h3>
                    <p className="text-sm text-white/45 leading-relaxed">{step.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="text-center mt-12">
            <Link
              to="/how-it-works"
              className="inline-flex items-center gap-2 text-white/60 hover:text-white text-sm font-semibold transition-colors"
            >
              Learn more about the process
              <ChevronRight size={16} />
            </Link>
          </div>
        </div>
      </section>

      {/* â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
          WHY DE ROYAL HOTSPOT
          â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */}
      <section className="py-20 lg:py-28 bg-white" id="features" aria-label="Why De Royal Hotspot">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14 space-y-4">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-wire-green-DEFAULT/8 border border-wire-green-DEFAULT/20 text-wire-green-DEFAULT text-xs font-bold uppercase tracking-wider">
              <span className="w-2 h-2 rounded-full bg-wire-green-DEFAULT" />
              Why Choose Us
            </div>
            <h2 className="text-4xl sm:text-5xl font-extrabold text-navy-900 tracking-tight">
              Built for Reliable Connectivity
            </h2>
            <p className="text-lg text-slate-500 max-w-xl mx-auto">
              De Royal Hotspot is designed around simplicity and dependability.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {FEATURES.map((f) => {
              const Icon = f.icon;
              return (
                <div
                  key={f.title}
                  className="bg-surface-100 rounded-2xl p-6 border border-surface-300 hover:border-slate-200 hover:shadow-card-hover transition-all duration-200 group space-y-4"
                >
                  <div className={`w-12 h-12 rounded-xl ${f.bg} flex items-center justify-center group-hover:scale-110 transition-transform`}>
                    <Icon size={22} className={f.color} />
                  </div>
                  <div>
                    <h3 className="font-bold text-navy-900 text-base mb-1.5">{f.title}</h3>
                    <p className="text-sm text-slate-500 leading-relaxed">{f.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
          DHOS PLATFORM INTRO
          â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */}
      <section className="py-20 lg:py-28 bg-navy-950 relative overflow-hidden" id="platform" aria-label="DHOS Platform">
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute -top-20 -right-20 w-96 h-96 bg-wire-blue-DEFAULT/6 rounded-full blur-3xl" />
          <div className="absolute -bottom-20 -left-20 w-80 h-80 bg-wire-orange-DEFAULT/6 rounded-full blur-3xl" />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-14 items-center">
            {/* Left: copy */}
            <div className="space-y-8">
              <div className="space-y-4">
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-wire-blue-DEFAULT/10 border border-wire-blue-DEFAULT/25 text-wire-blue-DEFAULT text-xs font-bold uppercase tracking-wider">
                  <span className="w-2 h-2 rounded-full bg-wire-blue-DEFAULT" />
                  DHOS Platform
                </div>
                <h2 className="text-4xl sm:text-5xl font-extrabold text-white tracking-tight leading-tight">
                  The Technology Behind
                  <span className="text-wire-blue-DEFAULT"> De Royal Hotspot</span>
                </h2>
                <p className="text-white/55 text-lg leading-relaxed">
                  DHOS (De Royal Hotspot OS) is the management platform that powers this network. It gives operators full control over routers, plans, vouchers, and live sessions through a single dashboard.
                </p>
              </div>

              <div className="space-y-3">
                {[
                  'Manage multiple MikroTik routers from one dashboard',
                  'Create and configure internet plans with bandwidth profiles',
                  'Generate and distribute voucher batches',
                  'Monitor active sessions and network activity in real time',
                  'Review audit logs and system events',
                ].map((point) => (
                  <div key={point} className="flex items-start gap-3 text-sm text-white/60">
                    <CheckCircle size={16} className="text-wire-green-DEFAULT flex-shrink-0 mt-0.5" />
                    {point}
                  </div>
                ))}
              </div>

              <Link
                to="/platform"
                className="inline-flex items-center gap-2 px-6 py-3.5 bg-wire-blue-DEFAULT hover:bg-wire-blue-dark text-white font-bold rounded-xl text-sm transition-all shadow-wire-blue"
              >
                Explore DHOS Platform
                <ArrowRight size={15} />
              </Link>
            </div>

            {/* Right: feature grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {DHOS_FEATURES.map((f, idx) => {
                const Icon = f.icon;
                const accent = WIRE_ACCENTS[idx % WIRE_ACCENTS.length];
                return (
                  <div
                    key={f.label}
                    className={`bg-navy-900 rounded-2xl border ${accent.border}/30 hover:${accent.border}/70 p-5 flex flex-col items-center text-center gap-3 transition-all hover:bg-navy-800`}
                  >
                    <Icon size={24} className={accent.icon} />
                    <span className="text-xs font-semibold text-white/70">{f.label}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
          CTA STRIP
          â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */}
      <section className="py-16 bg-wire-orange-DEFAULT relative overflow-hidden" aria-label="Get Internet CTA">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-0 w-72 h-72 bg-white/5 rounded-full -translate-x-1/2 -translate-y-1/2" />
          <div className="absolute bottom-0 right-0 w-72 h-72 bg-white/5 rounded-full translate-x-1/2 translate-y-1/2" />
        </div>
        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            Ready to Get Connected?
          </h2>
          <p className="text-white/80 text-lg max-w-lg mx-auto">
            Activate a voucher and get online in under two minutes. No registration. No complexity.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link
              to="/connect"
              id="cta-strip-get-internet"
              className="flex items-center gap-2 px-8 py-4 bg-white text-wire-orange-DEFAULT font-extrabold rounded-xl text-base hover:bg-orange-50 transition-all shadow-lg"
            >
              <Wifi size={18} />
              Get Internet Now
            </Link>
            <Link
              to="/pricing"
              className="flex items-center gap-2 px-8 py-4 bg-white/10 hover:bg-white/20 text-white font-bold rounded-xl text-base border border-white/25 transition-all"
            >
              View Plans
              <ChevronRight size={16} />
            </Link>
          </div>
        </div>
      </section>
    </>
  );
};
