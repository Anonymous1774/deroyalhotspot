import React from 'react';
import { Link } from 'react-router-dom';
import { Phone, Mail, Wifi } from 'lucide-react';

const FOOTER_LINKS = {
  Services: [
    { label: 'Internet Plans',  href: '/pricing' },
    { label: 'How It Works',    href: '/how-it-works' },
    { label: 'Coverage',        href: '/coverage' },
    { label: 'Get Internet',    href: '/connect' },
  ],
  'DHOS Platform': [
    { label: 'Platform Overview',   href: '/platform' },
    { label: 'Features',            href: '/platform/features' },
    { label: 'For Providers',       href: '/platform/for-providers' },
    { label: 'Request a Demo',      href: '/platform/demo' },
  ],
  Company: [
    { label: 'About Us',      href: '/about' },
    { label: 'Contact',       href: '/contact' },
    { label: 'FAQ',           href: '/faq' },
  ],
  Legal: [
    { label: 'Terms & Conditions', href: '/terms' },
    { label: 'Privacy Policy',     href: '/privacy' },
  ],
};

export const PublicFooter: React.FC = () => {
  const year = new Date().getFullYear();

  return (
    <footer className="bg-navy-950 text-white border-t border-white/5" role="contentinfo">
      {/* Wire accent bar */}
      <div className="wire-bar w-full" />

      {/* Main footer body */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 lg:py-20">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-10 lg:gap-8">

          {/* Brand column */}
          <div className="lg:col-span-2 space-y-6">
            <Link to="/" aria-label="De Royal Hotspot — Home">
              <img
                src="/logo.png"
                alt="De Royal Hotspot Logo"
                className="h-12 w-auto object-contain brightness-0 invert"
              />
            </Link>

            <p className="text-sm text-white/50 leading-relaxed max-w-xs">
              Reliable, flexible internet access designed to keep you connected when it matters most.
            </p>

            {/* Contact info */}
            <div className="space-y-3 pt-2">
              <a
                href="tel:+2347017741881"
                className="flex items-center gap-3 text-sm text-white/60 hover:text-white transition-colors group"
              >
                <span className="w-8 h-8 rounded-lg bg-wire-orange-DEFAULT/10 flex items-center justify-center group-hover:bg-wire-orange-DEFAULT/20 transition-colors flex-shrink-0">
                  <Phone size={14} className="text-wire-orange-DEFAULT" />
                </span>
                +234 701 774 1881
              </a>
              <a
                href="mailto:support@deroyalhotspot.name.ng"
                className="flex items-center gap-3 text-sm text-white/60 hover:text-white transition-colors group"
              >
                <span className="w-8 h-8 rounded-lg bg-wire-blue-DEFAULT/10 flex items-center justify-center group-hover:bg-wire-blue-DEFAULT/20 transition-colors flex-shrink-0">
                  <Mail size={14} className="text-wire-blue-DEFAULT" />
                </span>
                support@deroyalhotspot.name.ng
              </a>
            </div>

            {/* Get Internet CTA */}
            <Link
              to="/connect"
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-wire-orange-DEFAULT hover:bg-wire-orange-dark text-white font-bold rounded-xl text-sm transition-all shadow-wire-orange"
            >
              <Wifi size={15} />
              Get Internet
            </Link>
          </div>

          {/* Link columns */}
          {Object.entries(FOOTER_LINKS).map(([group, links]) => (
            <div key={group} className="lg:col-span-1">
              <h3 className="text-xs font-bold uppercase tracking-widest text-white/30 mb-5">
                {group}
              </h3>
              <ul className="space-y-3">
                {links.map((link) => (
                  <li key={link.href}>
                    <Link
                      to={link.href}
                      className="text-sm text-white/55 hover:text-white transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs text-white/30">
            &copy; {year} De Royal Hotspot (deroyalhotspot.name.ng). All rights reserved.
          </p>
          <div className="flex items-center gap-4 text-xs text-white/30">
            <Link to="/terms"   className="hover:text-white/60 transition-colors">Terms</Link>
            <span className="text-white/10">•</span>
            <Link to="/privacy" className="hover:text-white/60 transition-colors">Privacy</Link>
            <span className="text-white/10">•</span>
            <Link to="/contact" className="hover:text-white/60 transition-colors">Support</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};
