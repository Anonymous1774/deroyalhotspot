import React from 'react';
import { Link } from 'react-router-dom';
import { Target, Zap, Server, ArrowRight } from 'lucide-react';
import { SEOHead } from '../../components/SEOHead';

export const AboutPage: React.FC = () => {
  return (
    <>
      <SEOHead
        title="About Us | De Royal Hotspot"
        description="Learn about De Royal Hotspot â€” our mission to deliver reliable, accessible internet connectivity through flexible hotspot services."
        canonicalPath="/about"
      />

      {/* Page header */}
      <section className="bg-navy-950 py-16 relative overflow-hidden">
        <div className="wire-bar absolute top-0 left-0 right-0" />
        <div className="absolute inset-0 opacity-[0.03] pointer-events-none"
          style={{ backgroundImage: 'radial-gradient(circle, #3B82F6 1px, transparent 1px)', backgroundSize: '40px 40px' }} />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-4">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-wire-orange-DEFAULT/10 border border-wire-orange-DEFAULT/25 text-wire-orange-DEFAULT text-xs font-bold uppercase tracking-wider">
            <span className="w-2 h-2 rounded-full bg-wire-orange-DEFAULT" />
            About De Royal Hotspot
          </div>
          <h1 className="text-4xl sm:text-5xl font-extrabold text-white tracking-tight">
            Who We Are
          </h1>
        </div>
      </section>

      <section className="py-20 bg-surface-100">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">

          {/* Mission statement */}
          <div className="bg-white rounded-2xl border-2 border-wire-orange-DEFAULT p-8 sm:p-10 space-y-6">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-wire-orange-DEFAULT/10 flex items-center justify-center flex-shrink-0">
                <Target size={28} className="text-wire-orange-DEFAULT" />
              </div>
              <div>
                <p className="text-xs font-bold uppercase tracking-widest text-wire-orange-DEFAULT mb-1">Our Mission</p>
                <h2 className="text-2xl font-extrabold text-navy-900 leading-tight">Why We Exist</h2>
              </div>
            </div>
            <blockquote className="text-lg text-slate-600 leading-relaxed border-l-4 border-wire-orange-DEFAULT pl-6 italic">
              "Our mission is to make reliable and accessible internet connectivity available through flexible hotspot services and dependable network infrastructure."
            </blockquote>
          </div>

          {/* What we do */}
          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-white rounded-2xl border border-surface-300 p-7 space-y-4">
              <div className="w-12 h-12 rounded-xl bg-wire-blue-DEFAULT/8 flex items-center justify-center">
                <Zap size={22} className="text-wire-blue-DEFAULT" />
              </div>
              <h3 className="text-xl font-extrabold text-navy-900">De Royal Hotspot</h3>
              <p className="text-slate-500 text-sm leading-relaxed">
                De Royal Hotspot provides voucher-based internet access through a managed Wi-Fi hotspot network. Customers connect to the network, enter a voucher code at the portal, and get immediate internet access â€” no account or registration required.
              </p>
              <p className="text-slate-500 text-sm leading-relaxed">
                Plans are flexible, ranging from short hourly sessions to multi-day access. The service is designed to be simple, fast, and reliable for end users.
              </p>
            </div>

            <div className="bg-white rounded-2xl border border-surface-300 p-7 space-y-4">
              <div className="w-12 h-12 rounded-xl bg-wire-green-DEFAULT/8 flex items-center justify-center">
                <Server size={22} className="text-wire-green-DEFAULT" />
              </div>
              <h3 className="text-xl font-extrabold text-navy-900">DHOS Platform</h3>
              <p className="text-slate-500 text-sm leading-relaxed">
                DHOS (De Royal Hotspot OS) is the management platform built to operate this network. It allows the team to manage routers, create internet plans, generate vouchers, monitor active sessions, and review network activity â€” all from one dashboard.
              </p>
              <p className="text-slate-500 text-sm leading-relaxed">
                DHOS is built on enterprise-grade MikroTik RouterOS integration and is the backbone technology powering the De Royal Hotspot service.
              </p>
            </div>
          </div>

          {/* Values */}
          <div className="bg-navy-950 rounded-2xl border border-white/5 p-8 sm:p-10 space-y-7">
            <h3 className="text-white font-extrabold text-2xl">What We Stand For</h3>
            <div className="grid sm:grid-cols-3 gap-6">
              {[
                { colour: 'bg-wire-orange-DEFAULT', title: 'Reliability',   desc: 'Consistent uptime and stable connections built on proven infrastructure.' },
                { colour: 'bg-wire-green-DEFAULT',  title: 'Simplicity',    desc: 'Access should be straightforward. No barriers, no complex registration.' },
                { colour: 'bg-wire-blue-DEFAULT',   title: 'Accessibility', desc: 'Flexible plans that suit a wide range of users and connectivity needs.' },
              ].map((v) => (
                <div key={v.title} className="space-y-3">
                  <span className={`w-3 h-3 rounded-full ${v.colour} block`} />
                  <h4 className="font-bold text-white text-sm">{v.title}</h4>
                  <p className="text-white/45 text-sm leading-relaxed">{v.desc}</p>
                </div>
              ))}
            </div>
          </div>

          {/* CTA */}
          <div className="text-center space-y-4">
            <p className="text-slate-500 text-sm">Want to know more or get connected?</p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link to="/contact" className="inline-flex items-center gap-2 px-6 py-3 bg-navy-900 hover:bg-navy-800 text-white font-bold rounded-xl text-sm transition-all">
                Contact Us <ArrowRight size={14} />
              </Link>
              <Link to="/platform" className="inline-flex items-center gap-2 px-6 py-3 border-2 border-wire-blue-DEFAULT text-wire-blue-DEFAULT hover:bg-wire-blue-DEFAULT hover:text-white font-bold rounded-xl text-sm transition-all">
                Explore DHOS Platform
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};
