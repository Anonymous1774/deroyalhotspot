import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, ChevronDown, Wifi } from 'lucide-react';

const NAV_LINKS = [
  { label: 'Home',           href: '/' },
  { label: 'Internet Plans', href: '/pricing' },
  { label: 'How It Works',  href: '/how-it-works' },
  { label: 'Coverage',      href: '/coverage' },
  {
    label: 'DHOS Platform',
    href: '/platform',
    children: [
      { label: 'Platform Overview', href: '/platform' },
      { label: 'Features',          href: '/platform/features' },
      { label: 'For Providers',     href: '/platform/for-providers' },
      { label: 'Request a Demo',    href: '/platform/demo' },
    ],
  },
  { label: 'Contact', href: '/contact' },
];

export const PublicNavbar: React.FC = () => {
  const [mobileOpen, setMobileOpen]       = useState(false);
  const [scrolled, setScrolled]           = useState(false);
  const [dhosOpen, setDhosOpen]           = useState(false);
  const [mobileDhosOpen, setMobileDhosOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileOpen(false);
    setDhosOpen(false);
  }, [location.pathname]);

  const isActive = (href: string) =>
    href === '/' ? location.pathname === '/' : location.pathname.startsWith(href);

  return (
    <>
      <nav
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          scrolled || mobileOpen
            ? 'bg-navy-950/98 backdrop-blur-md shadow-lg shadow-navy-950/50 border-b border-white/5'
            : 'bg-navy-950/80 backdrop-blur-sm'
        }`}
        aria-label="Main navigation"
      >
        {/* Wire accent bar at very top */}
        <div className="wire-bar w-full" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 lg:h-18">

            {/* Logo */}
            <Link to="/" className="flex items-center gap-3 flex-shrink-0 group" aria-label="De Royal Hotspot — Home">
              <img
                src="/logo.png"
                alt="De Royal Hotspot Logo"
                className="h-9 w-auto object-contain"
              />
            </Link>

            {/* Desktop nav links */}
            <div className="hidden lg:flex items-center gap-1">
              {NAV_LINKS.map((link) =>
                link.children ? (
                  <div key={link.href} className="relative" onMouseLeave={() => setDhosOpen(false)}>
                    <button
                      onMouseEnter={() => setDhosOpen(true)}
                      onClick={() => setDhosOpen((v) => !v)}
                      className={`flex items-center gap-1 px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${
                        isActive(link.href)
                          ? 'text-wire-blue-DEFAULT'
                          : 'text-white/80 hover:text-white hover:bg-white/5'
                      }`}
                    >
                      {link.label}
                      <ChevronDown size={14} className={`transition-transform ${dhosOpen ? 'rotate-180' : ''}`} />
                    </button>

                    {dhosOpen && (
                      <div className="absolute top-full left-0 mt-2 w-52 bg-navy-900 border border-white/10 rounded-xl shadow-xl shadow-navy-950/60 py-2 animate-fade-in">
                        {link.children.map((child) => (
                          <Link
                            key={child.href}
                            to={child.href}
                            className="flex items-center px-4 py-2.5 text-sm text-white/70 hover:text-white hover:bg-white/5 transition-colors"
                          >
                            {child.label}
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>
                ) : (
                  <Link
                    key={link.href}
                    to={link.href}
                    className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${
                      isActive(link.href)
                        ? 'text-wire-blue-DEFAULT'
                        : 'text-white/80 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    {link.label}
                  </Link>
                )
              )}
            </div>

            {/* Desktop CTA buttons */}
            <div className="hidden lg:flex items-center gap-3">
              <Link
                to="/admin/login"
                className="px-4 py-2 text-sm font-semibold text-white/70 hover:text-white transition-colors"
              >
                Sign In
              </Link>
              <Link
                to="/connect"
                id="nav-cta-connect"
                className="flex items-center gap-2 px-5 py-2.5 bg-wire-orange-DEFAULT hover:bg-wire-orange-dark text-white font-bold rounded-xl text-sm transition-all shadow-wire-orange hover:shadow-lg hover:-translate-y-px active:translate-y-0"
              >
                <Wifi size={15} />
                Get Internet
              </Link>
            </div>

            {/* Mobile hamburger */}
            <button
              onClick={() => setMobileOpen((v) => !v)}
              className="lg:hidden p-2.5 rounded-xl text-white/80 hover:text-white hover:bg-white/10 transition-colors"
              aria-label={mobileOpen ? 'Close navigation menu' : 'Open navigation menu'}
              aria-expanded={mobileOpen}
            >
              {mobileOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-navy-950/95 backdrop-blur-md lg:hidden overflow-y-auto"
          role="dialog"
          aria-modal="true"
          aria-label="Mobile navigation"
        >
          {/* Spacer for the fixed nav bar */}
          <div className="h-16" />

          <div className="px-6 py-6 space-y-1">
            {NAV_LINKS.map((link) =>
              link.children ? (
                <div key={link.href}>
                  <button
                    onClick={() => setMobileDhosOpen((v) => !v)}
                    className="w-full flex items-center justify-between px-4 py-3.5 rounded-xl text-base font-semibold text-white/80 hover:text-white hover:bg-white/5 transition-colors"
                  >
                    {link.label}
                    <ChevronDown size={16} className={`transition-transform ${mobileDhosOpen ? 'rotate-180' : ''}`} />
                  </button>
                  {mobileDhosOpen && (
                    <div className="ml-4 mt-1 space-y-0.5 border-l-2 border-wire-blue-DEFAULT/30 pl-4">
                      {link.children.map((child) => (
                        <Link
                          key={child.href}
                          to={child.href}
                          className="flex px-3 py-2.5 text-sm text-white/60 hover:text-white transition-colors"
                        >
                          {child.label}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <Link
                  key={link.href}
                  to={link.href}
                  className={`flex px-4 py-3.5 rounded-xl text-base font-semibold transition-colors ${
                    isActive(link.href)
                      ? 'text-wire-blue-DEFAULT bg-wire-blue-DEFAULT/10'
                      : 'text-white/80 hover:text-white hover:bg-white/5'
                  }`}
                >
                  {link.label}
                </Link>
              )
            )}

            {/* Mobile CTAs */}
            <div className="pt-6 space-y-3 border-t border-white/10">
              <Link
                to="/admin/login"
                className="flex justify-center py-3.5 rounded-xl text-sm font-semibold text-white/60 hover:text-white border border-white/10 hover:border-white/20 transition-colors"
              >
                Admin Sign In
              </Link>
              <Link
                to="/connect"
                className="flex items-center justify-center gap-2 py-3.5 bg-wire-orange-DEFAULT hover:bg-wire-orange-dark text-white font-bold rounded-xl text-base transition-all"
              >
                <Wifi size={18} />
                Get Internet Access
              </Link>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
