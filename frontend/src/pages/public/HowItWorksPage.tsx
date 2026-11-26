import React from 'react';
import { Link } from 'react-router-dom';
import { Wifi, Ticket, Zap, CheckCircle, ArrowRight } from 'lucide-react';
import { SEOHead } from '../../components/SEOHead';

const STEPS = [
  {
    step: '01',
    icon: Wifi,
    color: 'wire-orange',
    border: 'border-wire-orange-DEFAULT',
    iconColor: 'text-wire-orange-DEFAULT',
    bg: 'bg-wire-orange-DEFAULT/8',
    title: 'Connect to De Royal Hotspot Wi-Fi',
    desc: 'On your device (phone, laptop, or tablet), open your Wi-Fi settings and select the De Royal Hotspot network. The connection will not require a Wi-Fi password.',
    details: [
      'Look for the "De Royal Hotspot" SSID in your Wi-Fi list',
      'No Wi-Fi password is required to connect to the network',
      'Your device will indicate the connection is active',
    ],
  },
  {
    step: '02',
    icon: Zap,
    color: 'wire-green',
    border: 'border-wire-green-DEFAULT',
    iconColor: 'text-wire-green-DEFAULT',
    bg: 'bg-wire-green-DEFAULT/8',
    title: 'Open the Connection Portal',
    desc: 'Once connected to the Wi-Fi, open your browser. The De Royal Hotspot connection portal will open automatically, or you can visit it at deroyalhotspot.name.ng/connect.',
    details: [
      'The portal opens automatically on most devices',
      'If it doesn\'t open, go to deroyalhotspot.name.ng/connect in your browser',
      'You will see a voucher entry form and the available internet plans',
    ],
  },
  {
    step: '03',
    icon: Ticket,
    color: 'wire-blue',
    border: 'border-wire-blue-DEFAULT',
    iconColor: 'text-wire-blue-DEFAULT',
    bg: 'bg-wire-blue-DEFAULT/8',
    title: 'Enter Your Voucher Code',
    desc: 'Enter the voucher code you received. Codes are typically 10 characters and are printed on receipts or provided at the point of purchase.',
    details: [
      'Type or paste the code exactly as printed â€” it is not case sensitive',
      'You can tap the "Paste" button to paste from your clipboard',
      'View the available plans to understand what each voucher provides',
    ],
  },
  {
    step: '04',
    icon: CheckCircle,
    color: 'wire-brown',
    border: 'border-wire-brown-DEFAULT',
    iconColor: 'text-wire-brown-DEFAULT',
    bg: 'bg-wire-brown-DEFAULT/8',
    title: 'Activate Your Access',
    desc: 'Tap "Connect to Internet" to activate the voucher. If the code is valid, your device will be authenticated to the network immediately.',
    details: [
      'Activation takes only a few seconds',
      'If activation fails, verify the code and that you are connected to De Royal Hotspot Wi-Fi',
      'Your device MAC address is registered to allow automatic reconnection',
    ],
  },
  {
    step: '05',
    icon: Zap,
    color: 'wire-orange',
    border: 'border-wire-orange-DEFAULT',
    iconColor: 'text-wire-orange-DEFAULT',
    bg: 'bg-wire-orange-DEFAULT/8',
    title: 'Start Browsing',
    desc: 'Your session begins immediately. Browse freely until your plan duration elapses. When you return, your device may be reconnected automatically without re-entering a code.',
    details: [
      'Your session duration starts from the moment of activation',
      'Registered devices are automatically reconnected on return visits',
      'Contact support if you experience connection issues during your session',
    ],
  },
];

export const HowItWorksPage: React.FC = () => {
  return (
    <>
      <SEOHead
        title="How It Works | De Royal Hotspot"
        description="Learn how to connect to De Royal Hotspot, activate your voucher, and get online in minutes."
        canonicalPath="/how-it-works"
      />

      {/* Page header */}
      <section className="bg-navy-950 py-16 relative overflow-hidden">
        <div className="wire-bar absolute top-0 left-0 right-0" />
        <div className="absolute inset-0 opacity-[0.03] pointer-events-none"
          style={{ backgroundImage: 'radial-gradient(circle, #3B82F6 1px, transparent 1px)', backgroundSize: '40px 40px' }} />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-4">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-wire-orange-DEFAULT/10 border border-wire-orange-DEFAULT/25 text-wire-orange-DEFAULT text-xs font-bold uppercase tracking-wider">
            <span className="w-2 h-2 rounded-full bg-wire-orange-DEFAULT" />
            Simple Process
          </div>
          <h1 className="text-4xl sm:text-5xl font-extrabold text-white tracking-tight">
            How It Works
          </h1>
          <p className="text-white/55 text-lg max-w-xl mx-auto">
            Getting connected to De Royal Hotspot takes under two minutes. Here's exactly what to do.
          </p>
        </div>
      </section>

      {/* Steps */}
      <section className="py-20 bg-surface-100">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          {STEPS.map((step, idx) => {
            const Icon = step.icon;
            return (
              <article
                key={step.step}
                className={`bg-white rounded-2xl border-2 ${step.border} overflow-hidden`}
              >
                <div className="p-6 sm:p-8">
                  <div className="flex flex-col sm:flex-row gap-6">
                    {/* Step number + icon */}
                    <div className="flex flex-row sm:flex-col items-center sm:items-start gap-4 sm:gap-3 flex-shrink-0">
                      <div className={`w-14 h-14 rounded-2xl ${step.bg} flex items-center justify-center`}>
                        <Icon size={26} className={step.iconColor} />
                      </div>
                      <span className={`text-4xl font-black ${step.iconColor} opacity-30`}>{step.step}</span>
                    </div>

                    {/* Content */}
                    <div className="flex-1 space-y-4">
                      <h2 className="text-xl font-extrabold text-navy-900">{step.title}</h2>
                      <p className="text-slate-500 leading-relaxed">{step.desc}</p>
                      <ul className="space-y-2">
                        {step.details.map((d) => (
                          <li key={d} className="flex items-start gap-2.5 text-sm text-slate-500">
                            <CheckCircle size={14} className={`${step.iconColor} flex-shrink-0 mt-0.5`} />
                            {d}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>

                {/* Connector arrow â€” not on last item */}
                {idx < STEPS.length - 1 && (
                  <div className="border-t border-dashed border-slate-100 py-3 px-8 text-center">
                    <span className="text-slate-200 text-xl">â†“</span>
                  </div>
                )}
              </article>
            );
          })}
        </div>

        {/* CTA */}
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 mt-12">
          <div className="bg-navy-950 rounded-2xl p-8 text-center space-y-5 border border-white/5">
            <h3 className="text-2xl font-extrabold text-white">Ready to Connect?</h3>
            <p className="text-white/50 text-sm max-w-sm mx-auto">
              Connect to the De Royal Hotspot Wi-Fi network now and open the portal to get started.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link
                to="/connect"
                className="inline-flex items-center gap-2 px-6 py-3 bg-wire-orange-DEFAULT hover:bg-wire-orange-dark text-white font-bold rounded-xl text-sm transition-all shadow-wire-orange"
              >
                <Wifi size={16} />
                Go to Portal
              </Link>
              <Link
                to="/pricing"
                className="inline-flex items-center gap-2 px-6 py-3 border border-white/15 text-white/70 hover:text-white hover:border-white/30 font-semibold rounded-xl text-sm transition-all"
              >
                View Plans <ArrowRight size={14} />
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};
