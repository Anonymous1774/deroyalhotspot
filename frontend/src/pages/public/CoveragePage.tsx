import React from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Phone, Mail, ArrowRight, AlertCircle } from 'lucide-react';
import { SEOHead } from '../../components/SEOHead';

export const CoveragePage: React.FC = () => {
  return (
    <>
      <SEOHead
        title="Coverage | De Royal Hotspot"
        description="Check De Royal Hotspot network coverage in your area. Contact us to confirm availability at your location."
        canonicalPath="/coverage"
      />

      {/* Page header */}
      <section className="bg-navy-950 py-16 relative overflow-hidden">
        <div className="wire-bar absolute top-0 left-0 right-0" />
        <div className="absolute inset-0 opacity-[0.03] pointer-events-none"
          style={{ backgroundImage: 'radial-gradient(circle, #3B82F6 1px, transparent 1px)', backgroundSize: '40px 40px' }} />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-4">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-wire-green-DEFAULT/10 border border-wire-green-DEFAULT/25 text-wire-green-DEFAULT text-xs font-bold uppercase tracking-wider">
            <span className="w-2 h-2 rounded-full bg-wire-green-DEFAULT" />
            Network Coverage
          </div>
          <h1 className="text-4xl sm:text-5xl font-extrabold text-white tracking-tight">
            Coverage Area
          </h1>
          <p className="text-white/55 text-lg max-w-xl mx-auto">
            Find out if De Royal Hotspot is available in your location.
          </p>
        </div>
      </section>

      {/* Coverage notice */}
      <section className="py-20 bg-surface-100">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">

          {/* Notice card */}
          <div className="bg-white rounded-2xl border-2 border-wire-orange-DEFAULT/40 p-8 sm:p-10 text-center space-y-6">
            <div className="w-20 h-20 mx-auto rounded-2xl bg-wire-orange-DEFAULT/8 flex items-center justify-center">
              <MapPin size={36} className="text-wire-orange-DEFAULT" />
            </div>
            <div className="space-y-3">
              <h2 className="text-2xl font-extrabold text-navy-900">
                Coverage Information
              </h2>
              <div className="flex items-start gap-3 text-left bg-amber-50 border border-amber-200 rounded-xl p-4 text-sm text-amber-800">
                <AlertCircle size={16} className="text-amber-500 flex-shrink-0 mt-0.5" />
                <p>
                  Coverage area details are currently being updated. Please contact us to confirm whether De Royal Hotspot service is available at your location.
                </p>
              </div>
              <p className="text-slate-500 text-sm leading-relaxed max-w-md mx-auto">
                Our team will confirm availability and provide information on how to access the network at your specific location.
              </p>
            </div>

            {/* Contact options */}
            <div className="grid sm:grid-cols-2 gap-4 pt-2">
              <a
                href="tel:+2347017741881"
                className="flex items-center gap-4 p-5 bg-surface-100 hover:bg-surface-200 rounded-xl border border-surface-300 transition-colors group text-left"
              >
                <span className="w-10 h-10 rounded-lg bg-wire-orange-DEFAULT/10 flex items-center justify-center group-hover:bg-wire-orange-DEFAULT/20 transition-colors flex-shrink-0">
                  <Phone size={18} className="text-wire-orange-DEFAULT" />
                </span>
                <div>
                  <p className="text-xs text-slate-400 font-medium mb-0.5">Call Us</p>
                  <p className="font-bold text-navy-900 text-sm">+234 701 774 1881</p>
                </div>
              </a>
              <a
                href="mailto:support@deroyalhotspot.name.ng"
                className="flex items-center gap-4 p-5 bg-surface-100 hover:bg-surface-200 rounded-xl border border-surface-300 transition-colors group text-left"
              >
                <span className="w-10 h-10 rounded-lg bg-wire-blue-DEFAULT/10 flex items-center justify-center group-hover:bg-wire-blue-DEFAULT/20 transition-colors flex-shrink-0">
                  <Mail size={18} className="text-wire-blue-DEFAULT" />
                </span>
                <div>
                  <p className="text-xs text-slate-400 font-medium mb-0.5">Email Us</p>
                  <p className="font-bold text-navy-900 text-sm break-all">support@deroyalhotspot.name.ng</p>
                </div>
              </a>
            </div>

            <Link
              to="/contact"
              className="inline-flex items-center gap-2 px-6 py-3 bg-navy-900 hover:bg-navy-800 text-white font-bold rounded-xl text-sm transition-all"
            >
              Contact Us to Check Availability
              <ArrowRight size={14} />
            </Link>
          </div>

          {/* What to ask card */}
          <div className="bg-navy-950 rounded-2xl p-6 sm:p-8 border border-white/5 space-y-5">
            <h3 className="text-white font-bold text-lg">When You Contact Us, Let Us Know:</h3>
            <ul className="space-y-3">
              {[
                'Your general location or area name',
                'The type of location (home, office, event venue, outdoor area)',
                'The number of users you expect to connect',
                'Whether you need a permanent or temporary installation',
              ].map((item) => (
                <li key={item} className="flex items-start gap-3 text-sm text-white/55">
                  <span className="w-2 h-2 rounded-full bg-wire-orange-DEFAULT flex-shrink-0 mt-1.5" />
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>
    </>
  );
};
