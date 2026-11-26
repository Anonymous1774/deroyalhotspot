import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Clock, Wifi, ArrowRight, CheckCircle, Info } from 'lucide-react';
import api from '../../services/api';
import { Plan } from '../../types';
import { SEOHead } from '../../components/SEOHead';

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

const WIRE_ACCENTS = [
  { border: 'border-wire-orange-DEFAULT', badge: 'bg-wire-orange-DEFAULT/10 text-wire-orange-DEFAULT border-wire-orange-DEFAULT/30', bar: 'bg-wire-orange-DEFAULT', label: 'Orange Tier' },
  { border: 'border-wire-green-DEFAULT',  badge: 'bg-wire-green-DEFAULT/10 text-wire-green-DEFAULT border-wire-green-DEFAULT/30',   bar: 'bg-wire-green-DEFAULT',  label: 'Green Tier'  },
  { border: 'border-wire-blue-DEFAULT',   badge: 'bg-wire-blue-DEFAULT/10 text-wire-blue-DEFAULT border-wire-blue-DEFAULT/30',      bar: 'bg-wire-blue-DEFAULT',   label: 'Blue Tier'   },
  { border: 'border-wire-brown-DEFAULT',  badge: 'bg-wire-brown-DEFAULT/10 text-wire-brown-DEFAULT border-wire-brown-DEFAULT/30',   bar: 'bg-wire-brown-DEFAULT',  label: 'Brown Tier'  },
];

export const PricingPage: React.FC = () => {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState(false);

  useEffect(() => {
    api.get('/plans')
      .then((res: { data: { success: boolean; data: { plans: Plan[] } } }) => {
        if (res.data?.success) setPlans(res.data.data?.plans || []);
        else setError(true);
      })
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, []);

  return (
    <>
      <SEOHead
        title="Internet Plans | De Royal Hotspot"
        description="Browse all available internet packages from De Royal Hotspot. Flexible voucher-based plans from hourly to weekly access."
        canonicalPath="/pricing"
      />

      {/* Page header */}
      <section className="bg-navy-950 py-16 relative overflow-hidden">
        <div className="wire-bar absolute top-0 left-0 right-0" />
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute inset-0 opacity-[0.03]"
            style={{ backgroundImage: 'radial-gradient(circle, #3B82F6 1px, transparent 1px)', backgroundSize: '40px 40px' }} />
        </div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-4">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-wire-blue-DEFAULT/10 border border-wire-blue-DEFAULT/25 text-wire-blue-DEFAULT text-xs font-bold uppercase tracking-wider">
            <span className="w-2 h-2 rounded-full bg-wire-blue-DEFAULT" />
            Internet Access Packages
          </div>
          <h1 className="text-4xl sm:text-5xl font-extrabold text-white tracking-tight">
            Internet Plans & Pricing
          </h1>
          <p className="text-white/55 text-lg max-w-xl mx-auto">
            All plans are activated with a voucher code â€” no account or registration required.
          </p>
        </div>
      </section>

      {/* Plans grid */}
      <section className="py-20 bg-surface-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

          {loading && (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="bg-white rounded-2xl border border-surface-300 p-6 animate-pulse space-y-5">
                  <div className="h-4 bg-slate-200 rounded w-3/4" />
                  <div className="h-10 bg-slate-200 rounded w-1/2" />
                  <div className="h-3 bg-slate-100 rounded w-full" />
                  <div className="h-3 bg-slate-100 rounded w-2/3" />
                  <div className="h-10 bg-slate-100 rounded-xl" />
                </div>
              ))}
            </div>
          )}

          {error && (
            <div className="text-center py-16 space-y-4">
              <Info size={40} className="text-slate-300 mx-auto" />
              <h3 className="font-bold text-slate-600">Pricing unavailable right now</h3>
              <p className="text-slate-400 text-sm">We couldn't load the latest plans. Please try again or contact us.</p>
              <Link to="/contact" className="inline-flex items-center gap-2 text-wire-blue-DEFAULT text-sm font-semibold hover:underline mt-2">
                Contact Support <ArrowRight size={14} />
              </Link>
            </div>
          )}

          {!loading && !error && plans.length === 0 && (
            <div className="text-center py-16 text-slate-400 space-y-3">
              <Wifi size={40} className="mx-auto opacity-30" />
              <p className="font-medium">No plans are currently published.</p>
              <Link to="/contact" className="text-wire-blue-DEFAULT text-sm hover:underline">Contact us for availability â†’</Link>
            </div>
          )}

          {!loading && !error && plans.length > 0 && (
            <>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {plans.map((plan, idx) => {
                  const accent = WIRE_ACCENTS[idx % WIRE_ACCENTS.length];
                  return (
                    <article
                      key={plan.id}
                      className={`bg-white rounded-2xl border-2 ${accent.border} overflow-hidden hover:shadow-card-hover transition-all duration-200 hover:-translate-y-1 flex flex-col`}
                    >
                      {/* Top wire colour bar */}
                      <div className={`h-1.5 w-full ${accent.bar}`} />

                      <div className="p-6 flex flex-col flex-1 space-y-5">
                        <div className="space-y-2">
                          <h2 className="font-extrabold text-navy-900 text-xl leading-tight">{plan.name}</h2>
                          {plan.description && (
                            <p className="text-xs text-slate-400 leading-relaxed">{plan.description}</p>
                          )}
                          <div className={`inline-flex items-center gap-1.5 text-xs font-bold px-2.5 py-1 rounded-lg border ${accent.badge}`}>
                            <Clock size={10} />
                            {formatDuration(plan.duration, plan.durationUnit)}
                          </div>
                        </div>

                        <div className="text-4xl font-black text-navy-900">
                          â‚¦{plan.price.toLocaleString()}
                        </div>

                        {plan.bandwidthProfile && (
                          <div className="bg-surface-100 rounded-xl p-3 space-y-2 text-xs">
                            <p className="font-bold text-slate-500 uppercase tracking-wider text-[10px]">
                              Bandwidth Profile: {plan.bandwidthProfile.name}
                            </p>
                            <div className="flex justify-between text-slate-500">
                              <span>â¬‡ Download</span>
                              <span className="font-bold text-slate-700">{plan.bandwidthProfile.downloadSpeed}</span>
                            </div>
                            <div className="flex justify-between text-slate-500">
                              <span>â¬† Upload</span>
                              <span className="font-bold text-slate-700">{plan.bandwidthProfile.uploadSpeed}</span>
                            </div>
                          </div>
                        )}

                        <div className="flex items-start gap-2 text-xs text-slate-400">
                          <CheckCircle size={12} className="text-wire-green-DEFAULT flex-shrink-0 mt-0.5" />
                          Voucher activation â€” no registration required
                        </div>

                        <div className="mt-auto pt-2">
                          <Link
                            to="/connect"
                            className={`w-full flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold transition-all border-2 ${accent.border} text-navy-900 hover:bg-navy-900 hover:text-white`}
                          >
                            Get This Plan
                            <ArrowRight size={14} />
                          </Link>
                        </div>
                      </div>
                    </article>
                  );
                })}
              </div>

              {/* Info callout */}
              <div className="mt-12 bg-navy-950 rounded-2xl p-6 sm:p-8 flex flex-col sm:flex-row gap-5 items-start border border-white/5">
                <div className="w-10 h-10 rounded-xl bg-wire-blue-DEFAULT/10 flex items-center justify-center flex-shrink-0">
                  <Info size={20} className="text-wire-blue-DEFAULT" />
                </div>
                <div className="space-y-1">
                  <h3 className="font-bold text-white text-base">How to Purchase</h3>
                  <p className="text-sm text-white/50 leading-relaxed">
                    Vouchers for these plans are sold at the point of access. Connect to the De Royal Hotspot Wi-Fi network, open the portal at <span className="text-wire-blue-DEFAULT">/connect</span>, and enter your voucher code to activate access instantly.
                  </p>
                  <Link to="/how-it-works" className="inline-flex items-center gap-1.5 text-wire-orange-DEFAULT text-sm font-semibold hover:underline mt-2">
                    Learn how it works <ArrowRight size={13} />
                  </Link>
                </div>
              </div>
            </>
          )}
        </div>
      </section>
    </>
  );
};
