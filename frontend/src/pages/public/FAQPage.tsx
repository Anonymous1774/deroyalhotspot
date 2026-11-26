import React, { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { SEOHead } from '../../components/SEOHead';

const FAQS = [
  {
    category: 'Getting Connected',
    colour: 'wire-orange',
    items: [
      {
        q: 'How do I connect to De Royal Hotspot?',
        a: 'Open your device Wi-Fi settings, select the De Royal Hotspot network, and connect. No Wi-Fi password is required. Your browser will then open the connection portal automatically.',
      },
      {
        q: 'What if the portal doesn\'t open automatically?',
        a: 'Open your browser and visit deroyalhotspot.name.ng/connect. The portal will load and prompt you to enter your voucher code.',
      },
      {
        q: 'Can I connect multiple devices with one voucher?',
        a: 'Each voucher is associated with one device MAC address at the time of activation. If you need to connect additional devices, each device will require its own voucher.',
      },
    ],
  },
  {
    category: 'Vouchers & Plans',
    colour: 'wire-green',
    items: [
      {
        q: 'How do I get a voucher?',
        a: 'Vouchers are available at the point of access â€” for example, from the hotspot operator or vendor at the location where the network is deployed. Contact us if you need information on where to purchase.',
      },
      {
        q: 'What do I do if my voucher code doesn\'t work?',
        a: 'First, check that you\'ve entered the code exactly as printed â€” the code is not case sensitive but must be complete. Ensure you are connected to the De Royal Hotspot Wi-Fi. If the problem persists, contact support with your voucher code.',
      },
      {
        q: 'When does my voucher session start?',
        a: 'Your session starts at the moment you successfully activate the voucher â€” not when you purchase it. Time counts down from the point of activation.',
      },
      {
        q: 'Can I pause my session and continue later?',
        a: 'Sessions run continuously from activation and cannot be paused. If you disconnect and return within the session duration, your device will be automatically reconnected if it is recognised.',
      },
      {
        q: 'What happens when my session expires?',
        a: 'Your internet access will stop. You will need to activate a new voucher to continue browsing.',
      },
    ],
  },
  {
    category: 'Auto-Reconnect',
    colour: 'wire-blue',
    items: [
      {
        q: 'What is auto-reconnect?',
        a: 'When you first activate a voucher, your device MAC address is registered. On return visits, the system recognises your device and may reconnect you automatically without requiring a new voucher, as long as an active session remains.',
      },
      {
        q: 'My device reconnected without asking â€” is this normal?',
        a: 'Yes. If you have an active session remaining on your account, the system will automatically authenticate your device when it reconnects to the Wi-Fi network.',
      },
    ],
  },
  {
    category: 'Technical & Support',
    colour: 'wire-brown',
    items: [
      {
        q: 'My connection is slow. What should I do?',
        a: 'Connection speed depends on your plan bandwidth profile and the number of active users on the network. Try disconnecting and reconnecting. If the problem continues, contact support.',
      },
      {
        q: 'How do I contact support?',
        a: 'Call us at +234 701 774 1881 or email support@deroyalhotspot.name.ng. Include your voucher code, device type, and a description of the issue.',
      },
      {
        q: 'Is the network secure?',
        a: 'The hotspot uses MikroTik RouterOS for authentication and session management. As with any shared Wi-Fi network, we recommend using HTTPS websites and a VPN for sensitive activity.',
      },
    ],
  },
];

const COLOUR_MAP: Record<string, string> = {
  'wire-orange': 'border-wire-orange-DEFAULT text-wire-orange-DEFAULT bg-wire-orange-DEFAULT',
  'wire-green':  'border-wire-green-DEFAULT text-wire-green-DEFAULT bg-wire-green-DEFAULT',
  'wire-blue':   'border-wire-blue-DEFAULT text-wire-blue-DEFAULT bg-wire-blue-DEFAULT',
  'wire-brown':  'border-wire-brown-DEFAULT text-wire-brown-DEFAULT bg-wire-brown-DEFAULT',
};

const FAQItem: React.FC<{ q: string; a: string; colour: string; idx: number }> = ({ q, a, colour, idx }) => {
  const [open, setOpen] = useState(false);
  const colourClasses = COLOUR_MAP[colour] || '';

  return (
    <div className={`bg-white rounded-xl border ${open ? `border-${colour}-DEFAULT` : 'border-surface-300'} overflow-hidden transition-all`}>
      <button
        id={`faq-item-${idx}`}
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between gap-4 px-6 py-5 text-left"
        aria-expanded={open}
      >
        <span className="font-semibold text-navy-900 text-sm leading-snug">{q}</span>
        <span className="flex-shrink-0">
          {open
            ? <ChevronUp size={16} className={colourClasses.split(' ')[1]} />
            : <ChevronDown size={16} className="text-slate-400" />
          }
        </span>
      </button>
      {open && (
        <div className={`px-6 pb-5 text-sm text-slate-500 leading-relaxed border-t border-surface-200 pt-4`}>
          {a}
        </div>
      )}
    </div>
  );
};

export const FAQPage: React.FC = () => {
  return (
    <>
      <SEOHead
        title="FAQ | De Royal Hotspot"
        description="Frequently asked questions about De Royal Hotspot internet access, vouchers, auto-reconnect, and technical support."
        canonicalPath="/faq"
      />

      {/* Page header */}
      <section className="bg-navy-950 py-16 relative overflow-hidden">
        <div className="wire-bar absolute top-0 left-0 right-0" />
        <div className="absolute inset-0 opacity-[0.03] pointer-events-none"
          style={{ backgroundImage: 'radial-gradient(circle, #3B82F6 1px, transparent 1px)', backgroundSize: '40px 40px' }} />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-4">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-wire-green-DEFAULT/10 border border-wire-green-DEFAULT/25 text-wire-green-DEFAULT text-xs font-bold uppercase tracking-wider">
            <span className="w-2 h-2 rounded-full bg-wire-green-DEFAULT" />
            Help & Information
          </div>
          <h1 className="text-4xl sm:text-5xl font-extrabold text-white tracking-tight">
            Frequently Asked Questions
          </h1>
          <p className="text-white/55 text-lg max-w-lg mx-auto">
            Answers to the most common questions about De Royal Hotspot.
          </p>
        </div>
      </section>

      <section className="py-20 bg-surface-100">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          {FAQS.map((section) => {
            const colourClasses = COLOUR_MAP[section.colour] || '';
            const borderClass = colourClasses.split(' ')[0];
            const textClass   = colourClasses.split(' ')[1];
            return (
              <div key={section.category} className="space-y-4">
                <div className={`flex items-center gap-3 pb-3 border-b-2 ${borderClass}`}>
                  <span className={`w-3 h-3 rounded-full ${colourClasses.split(' ')[2]}`} />
                  <h2 className={`font-extrabold text-lg ${textClass}`}>{section.category}</h2>
                </div>
                <div className="space-y-3">
                  {section.items.map((item, i) => (
                    <FAQItem
                      key={item.q}
                      q={item.q}
                      a={item.a}
                      colour={section.colour}
                      idx={i}
                    />
                  ))}
                </div>
              </div>
            );
          })}

          {/* Still have questions */}
          <div className="bg-navy-950 rounded-2xl border border-white/5 p-8 text-center space-y-4">
            <h3 className="font-extrabold text-white text-xl">Still have a question?</h3>
            <p className="text-white/50 text-sm">Our team is happy to help with anything not covered here.</p>
            <div className="flex flex-wrap justify-center gap-3">
              <a
                href="tel:+2347017741881"
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-wire-orange-DEFAULT hover:bg-wire-orange-dark text-white font-bold rounded-xl text-sm transition-all"
              >
                Call +234 701 774 1881
              </a>
              <a
                href="mailto:support@deroyalhotspot.name.ng"
                className="inline-flex items-center gap-2 px-5 py-2.5 border border-white/15 text-white/70 hover:text-white hover:border-white/25 font-semibold rounded-xl text-sm transition-all"
              >
                Email Support
              </a>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};
