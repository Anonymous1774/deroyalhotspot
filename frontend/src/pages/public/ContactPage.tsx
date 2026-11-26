import React, { useState } from 'react';
import { Phone, Mail, MessageSquare, CheckCircle, AlertCircle } from 'lucide-react';
import { SEOHead } from '../../components/SEOHead';

export const ContactPage: React.FC = () => {
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' });
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    // Build a mailto: link  no backend wired for contact form yet
    const subject = encodeURIComponent(`[De Royal Hotspot] ${form.subject || 'Enquiry'}`);
    const body = encodeURIComponent(
      `Name: ${form.name}\nEmail: ${form.email}\n\nMessage:\n${form.message}`
    );
    window.location.href = `mailto:support@deroyalhotspot.name.ng?subject=${subject}&body=${body}`;
    setTimeout(() => {
      setSubmitted(true);
      setSubmitting(false);
    }, 800);
  };

  return (
    <>
      <SEOHead
        title="Contact Us | De Royal Hotspot"
        description="Contact De Royal Hotspot support. Call us at +234 701 774 1881 or email support@deroyalhotspot.name.ng."
        canonicalPath="/contact"
      />

      {/* Page header */}
      <section className="bg-navy-950 py-16 relative overflow-hidden">
        <div className="wire-bar absolute top-0 left-0 right-0" />
        <div className="absolute inset-0 opacity-[0.03] pointer-events-none"
          style={{ backgroundImage: 'radial-gradient(circle, #3B82F6 1px, transparent 1px)', backgroundSize: '40px 40px' }} />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-4">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-wire-blue-DEFAULT/10 border border-wire-blue-DEFAULT/25 text-wire-blue-DEFAULT text-xs font-bold uppercase tracking-wider">
            <span className="w-2 h-2 rounded-full bg-wire-blue-DEFAULT" />
            Get in Touch
          </div>
          <h1 className="text-4xl sm:text-5xl font-extrabold text-white tracking-tight">Contact & Support</h1>
          <p className="text-white/55 text-lg max-w-lg mx-auto">
            We're here to help with connection issues, coverage questions, and general enquiries.
          </p>
        </div>
      </section>

      <section className="py-20 bg-surface-100">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-5 gap-10">

            {/* Left: contact info */}
            <div className="lg:col-span-2 space-y-6">
              <div>
                <h2 className="text-2xl font-extrabold text-navy-900 mb-2">Talk to Us</h2>
                <p className="text-slate-500 text-sm leading-relaxed">
                  Reach out by phone or email for the fastest response. We're available to help with connectivity, plans, and service enquiries.
                </p>
              </div>

              <div className="space-y-4">
                <a
                  href="tel:+2347017741881"
                  id="contact-phone-link"
                  className="flex items-center gap-4 p-5 bg-white rounded-2xl border border-surface-300 hover:border-wire-orange-DEFAULT/40 hover:shadow-wire-orange transition-all group"
                >
                  <span className="w-12 h-12 rounded-xl bg-wire-orange-DEFAULT/10 flex items-center justify-center group-hover:bg-wire-orange-DEFAULT/20 transition-colors flex-shrink-0">
                    <Phone size={20} className="text-wire-orange-DEFAULT" />
                  </span>
                  <div>
                    <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider mb-0.5">Phone</p>
                    <p className="font-extrabold text-navy-900">+234 701 774 1881</p>
                  </div>
                </a>

                <a
                  href="mailto:support@deroyalhotspot.name.ng"
                  id="contact-email-link"
                  className="flex items-center gap-4 p-5 bg-white rounded-2xl border border-surface-300 hover:border-wire-blue-DEFAULT/40 hover:shadow-wire-blue transition-all group"
                >
                  <span className="w-12 h-12 rounded-xl bg-wire-blue-DEFAULT/10 flex items-center justify-center group-hover:bg-wire-blue-DEFAULT/20 transition-colors flex-shrink-0">
                    <Mail size={20} className="text-wire-blue-DEFAULT" />
                  </span>
                  <div>
                    <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider mb-0.5">Email</p>
                    <p className="font-extrabold text-navy-900 text-sm break-all">support@deroyalhotspot.name.ng</p>
                  </div>
                </a>
              </div>

              {/* Help topics */}
              <div className="bg-navy-950 rounded-2xl border border-white/5 p-6 space-y-4">
                <h3 className="font-bold text-white text-sm">Common Enquiries</h3>
                <ul className="space-y-2.5">
                  {[
                    'Voucher not activating',
                    'Connection dropping mid-session',
                    'Coverage availability in your area',
                    'Platform (DHOS) partnership enquiries',
                    'Billing and pricing questions',
                  ].map((item) => (
                    <li key={item} className="flex items-center gap-2.5 text-sm text-white/50">
                      <span className="w-1.5 h-1.5 rounded-full bg-wire-orange-DEFAULT flex-shrink-0" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Right: enquiry form */}
            <div className="lg:col-span-3">
              <div className="bg-white rounded-2xl border border-surface-300 p-7 sm:p-9 shadow-small">
                <div className="flex items-center gap-3 mb-7">
                  <div className="w-10 h-10 rounded-xl bg-wire-blue-DEFAULT/10 flex items-center justify-center">
                    <MessageSquare size={18} className="text-wire-blue-DEFAULT" />
                  </div>
                  <div>
                    <h2 className="font-extrabold text-navy-900 text-lg">Send an Enquiry</h2>
                    <p className="text-slate-400 text-xs mt-0.5">We'll reply as soon as possible</p>
                  </div>
                </div>

                {submitted ? (
                  <div className="py-10 text-center space-y-4">
                    <div className="w-16 h-16 mx-auto rounded-2xl bg-wire-green-DEFAULT/10 flex items-center justify-center">
                      <CheckCircle size={32} className="text-wire-green-DEFAULT" />
                    </div>
                    <h3 className="font-extrabold text-navy-900 text-xl">Message Sent</h3>
                    <p className="text-slate-500 text-sm max-w-xs mx-auto">
                      Your email client should have opened with the message pre-filled. Send it to reach our support team.
                    </p>
                    <button
                      onClick={() => { setSubmitted(false); setForm({ name: '', email: '', subject: '', message: '' }); }}
                      className="text-wire-blue-DEFAULT text-sm font-semibold hover:underline"
                    >
                      Send another message
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-5" noValidate>
                    <div className="grid sm:grid-cols-2 gap-5">
                      <div>
                        <label htmlFor="contact-name" className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                          Your Name *
                        </label>
                        <input
                          id="contact-name"
                          name="name"
                          type="text"
                          required
                          value={form.name}
                          onChange={handleChange}
                          placeholder="e.g. John Adeyemi"
                          className="w-full px-4 py-3 rounded-xl border border-surface-300 bg-surface-100 text-navy-900 placeholder:text-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-wire-blue-DEFAULT focus:border-transparent transition-all"
                        />
                      </div>
                      <div>
                        <label htmlFor="contact-email" className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                          Email Address *
                        </label>
                        <input
                          id="contact-email"
                          name="email"
                          type="email"
                          required
                          value={form.email}
                          onChange={handleChange}
                          placeholder="you@example.com"
                          className="w-full px-4 py-3 rounded-xl border border-surface-300 bg-surface-100 text-navy-900 placeholder:text-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-wire-blue-DEFAULT focus:border-transparent transition-all"
                        />
                      </div>
                    </div>

                    <div>
                      <label htmlFor="contact-subject" className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                        Subject *
                      </label>
                      <select
                        id="contact-subject"
                        name="subject"
                        required
                        value={form.subject}
                        onChange={handleChange}
                        className="w-full px-4 py-3 rounded-xl border border-surface-300 bg-surface-100 text-navy-900 text-sm focus:outline-none focus:ring-2 focus:ring-wire-blue-DEFAULT focus:border-transparent transition-all appearance-none"
                      >
                        <option value="">Select a subjectâ€¦</option>
                        <option value="Voucher Issue">Voucher Issue</option>
                        <option value="Connection Problem">Connection Problem</option>
                        <option value="Coverage Enquiry">Coverage Enquiry</option>
                        <option value="Pricing & Plans">Pricing & Plans</option>
                        <option value="DHOS Platform Partnership">DHOS Platform Partnership</option>
                        <option value="General Enquiry">General Enquiry</option>
                      </select>
                    </div>

                    <div>
                      <label htmlFor="contact-message" className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                        Message *
                      </label>
                      <textarea
                        id="contact-message"
                        name="message"
                        required
                        rows={5}
                        value={form.message}
                        onChange={handleChange}
                        placeholder="Describe your issue or question in detailâ€¦"
                        className="w-full px-4 py-3 rounded-xl border border-surface-300 bg-surface-100 text-navy-900 placeholder:text-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-wire-blue-DEFAULT focus:border-transparent transition-all resize-none"
                      />
                    </div>

                    <div className="flex items-start gap-2 text-xs text-slate-400 bg-amber-50 border border-amber-200 rounded-xl p-3">
                      <AlertCircle size={12} className="text-amber-500 flex-shrink-0 mt-0.5" />
                      <span>Clicking Send will open your email client. Alternatively, email us directly at <span className="font-semibold text-amber-700">support@deroyalhotspot.name.ng</span></span>
                    </div>

                    <button
                      type="submit"
                      disabled={submitting || !form.name || !form.email || !form.subject || !form.message}
                      id="contact-submit-btn"
                      className="w-full py-3.5 bg-wire-orange-DEFAULT hover:bg-wire-orange-dark disabled:bg-slate-200 disabled:text-slate-400 text-white font-extrabold rounded-xl text-sm transition-all shadow-wire-orange hover:shadow-lg min-h-[48px]"
                    >
                      {submitting ? 'Opening emailâ€¦' : 'Send Message'}
                    </button>
                  </form>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};
