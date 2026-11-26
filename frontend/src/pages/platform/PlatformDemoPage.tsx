import React, { useState } from 'react';
import { CheckCircle, AlertCircle, MessageSquare, ArrowRight } from 'lucide-react';
import { SEOHead } from '../../components/SEOHead';

export const PlatformDemoPage: React.FC = () => {
  const [form, setForm] = useState({
    name: '', email: '', phone: '', organisation: '', useCase: '', message: ''
  });
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    const subject = encodeURIComponent(`[DHOS Platform Enquiry] ${form.organisation || form.name}`);
    const body = encodeURIComponent(
      `Name: ${form.name}\nEmail: ${form.email}\nPhone: ${form.phone}\nOrganisation: ${form.organisation}\nUse Case: ${form.useCase}\n\nMessage:\n${form.message}`
    );
    window.location.href = `mailto:support@deroyalhotspot.name.ng?subject=${subject}&body=${body}`;
    setTimeout(() => { setSubmitted(true); setSubmitting(false); }, 800);
  };

  const isValid = form.name && form.email && form.useCase && form.message;

  return (
    <>
      <SEOHead
        title="Request a Demo | DHOS | De Royal Hotspot"
        description="Enquire about deploying DHOS for your hotspot network. Submit your details and we'll get back to you."
        canonicalPath="/platform/demo"
      />

      {/* Page header */}
      <section className="bg-hero-gradient py-16 relative overflow-hidden">
        <div className="wire-bar absolute top-0 left-0 right-0" />
        <div className="absolute inset-0 opacity-[0.03] pointer-events-none"
          style={{ backgroundImage: 'radial-gradient(circle, #3B82F6 1px, transparent 1px)', backgroundSize: '40px 40px' }} />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-4">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-wire-orange-DEFAULT/10 border border-wire-orange-DEFAULT/25 text-wire-orange-DEFAULT text-xs font-bold uppercase tracking-wider">
            <span className="w-2 h-2 rounded-full bg-wire-orange-DEFAULT" />
            Platform Enquiry
          </div>
          <h1 className="text-4xl sm:text-5xl font-extrabold text-white tracking-tight">
            Request a Demo
          </h1>
          <p className="text-white/55 text-lg max-w-xl mx-auto">
            Interested in DHOS for your hotspot network? Share your details and we'll get in touch to discuss your requirements.
          </p>
        </div>
      </section>

      <section className="py-20 bg-surface-100">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-5 gap-10">
            {/* Left sidebar */}
            <div className="lg:col-span-2 space-y-6">
              <div>
                <h2 className="text-2xl font-extrabold text-navy-900 mb-2">What to Expect</h2>
                <p className="text-slate-500 text-sm leading-relaxed">
                  After submitting this form, our team will review your requirements and reach out to discuss how DHOS can be deployed for your use case.
                </p>
              </div>

              <div className="space-y-4">
                {[
                  { step: '01', colour: 'text-wire-orange-DEFAULT border-wire-orange-DEFAULT/30', title: 'Submit this form', desc: 'Tell us about your network and what you need.' },
                  { step: '02', colour: 'text-wire-green-DEFAULT border-wire-green-DEFAULT/30',  title: 'We review and respond', desc: 'We\'ll contact you to discuss your setup and requirements.' },
                  { step: '03', colour: 'text-wire-blue-DEFAULT border-wire-blue-DEFAULT/30',   title: 'Technical walkthrough', desc: 'We\'ll walk you through DHOS and confirm compatibility with your infrastructure.' },
                ].map((s) => (
                  <div key={s.step} className={`flex gap-4 p-4 bg-white rounded-xl border ${s.colour.split(' ')[1]}`}>
                    <span className={`text-xl font-black ${s.colour.split(' ')[0]} opacity-50`}>{s.step}</span>
                    <div>
                      <p className="font-bold text-navy-900 text-sm">{s.title}</p>
                      <p className="text-xs text-slate-400 mt-0.5">{s.desc}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="bg-navy-950 rounded-2xl border border-white/5 p-6 space-y-3">
                <p className="text-white/40 text-xs font-bold uppercase tracking-wider">Or contact us directly</p>
                <a href="tel:+2347017741881" className="block text-sm text-white/70 hover:text-white transition-colors">
                  ðŸ“ž +234 701 774 1881
                </a>
                <a href="mailto:support@deroyalhotspot.name.ng" className="block text-sm text-white/70 hover:text-white transition-colors break-all">
                  âœ‰ï¸ support@deroyalhotspot.name.ng
                </a>
              </div>
            </div>

            {/* Right form */}
            <div className="lg:col-span-3">
              <div className="bg-white rounded-2xl border border-surface-300 p-7 sm:p-9 shadow-small">
                <div className="flex items-center gap-3 mb-7">
                  <div className="w-10 h-10 rounded-xl bg-wire-orange-DEFAULT/10 flex items-center justify-center">
                    <MessageSquare size={18} className="text-wire-orange-DEFAULT" />
                  </div>
                  <div>
                    <h2 className="font-extrabold text-navy-900 text-lg">DHOS Platform Enquiry</h2>
                    <p className="text-slate-400 text-xs mt-0.5">All fields marked * are required</p>
                  </div>
                </div>

                {submitted ? (
                  <div className="py-10 text-center space-y-4">
                    <div className="w-16 h-16 mx-auto rounded-2xl bg-wire-green-DEFAULT/10 flex items-center justify-center">
                      <CheckCircle size={32} className="text-wire-green-DEFAULT" />
                    </div>
                    <h3 className="font-extrabold text-navy-900 text-xl">Enquiry Sent</h3>
                    <p className="text-slate-500 text-sm max-w-xs mx-auto">
                      Your email client opened with the enquiry pre-filled. Send it and we'll get back to you as soon as possible.
                    </p>
                    <button
                      onClick={() => { setSubmitted(false); setForm({ name: '', email: '', phone: '', organisation: '', useCase: '', message: '' }); }}
                      className="text-wire-orange-DEFAULT text-sm font-semibold hover:underline"
                    >
                      Submit another enquiry
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-5" noValidate>
                    <div className="grid sm:grid-cols-2 gap-5">
                      <div>
                        <label htmlFor="demo-name" className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Your Name *</label>
                        <input id="demo-name" name="name" type="text" required value={form.name} onChange={handleChange}
                          placeholder="e.g. Chukwuemeka Obi"
                          className="w-full px-4 py-3 rounded-xl border border-surface-300 bg-surface-100 text-navy-900 placeholder:text-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-wire-orange-DEFAULT focus:border-transparent transition-all" />
                      </div>
                      <div>
                        <label htmlFor="demo-email" className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Email Address *</label>
                        <input id="demo-email" name="email" type="email" required value={form.email} onChange={handleChange}
                          placeholder="you@company.com"
                          className="w-full px-4 py-3 rounded-xl border border-surface-300 bg-surface-100 text-navy-900 placeholder:text-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-wire-orange-DEFAULT focus:border-transparent transition-all" />
                      </div>
                    </div>

                    <div className="grid sm:grid-cols-2 gap-5">
                      <div>
                        <label htmlFor="demo-phone" className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Phone Number</label>
                        <input id="demo-phone" name="phone" type="tel" value={form.phone} onChange={handleChange}
                          placeholder="+234 ..."
                          className="w-full px-4 py-3 rounded-xl border border-surface-300 bg-surface-100 text-navy-900 placeholder:text-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-wire-orange-DEFAULT focus:border-transparent transition-all" />
                      </div>
                      <div>
                        <label htmlFor="demo-org" className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Organisation / Business</label>
                        <input id="demo-org" name="organisation" type="text" value={form.organisation} onChange={handleChange}
                          placeholder="e.g. ABC Networks"
                          className="w-full px-4 py-3 rounded-xl border border-surface-300 bg-surface-100 text-navy-900 placeholder:text-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-wire-orange-DEFAULT focus:border-transparent transition-all" />
                      </div>
                    </div>

                    <div>
                      <label htmlFor="demo-usecase" className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Use Case *</label>
                      <select id="demo-usecase" name="useCase" required value={form.useCase} onChange={handleChange}
                        className="w-full px-4 py-3 rounded-xl border border-surface-300 bg-surface-100 text-navy-900 text-sm focus:outline-none focus:ring-2 focus:ring-wire-orange-DEFAULT focus:border-transparent transition-all appearance-none">
                        <option value="">Select your use caseâ€¦</option>
                        <option value="Campus / Estate Wi-Fi">Campus / Estate Wi-Fi</option>
                        <option value="Event / Venue Hotspot">Event / Venue Hotspot</option>
                        <option value="Community Network">Community Network</option>
                        <option value="ISP Hotspot Add-On">ISP Hotspot Add-On</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>

                    <div>
                      <label htmlFor="demo-message" className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Tell Us About Your Network *</label>
                      <textarea id="demo-message" name="message" required rows={5} value={form.message} onChange={handleChange}
                        placeholder="Describe your current setup, number of routers, expected users, and what you're looking to achieve with DHOSâ€¦"
                        className="w-full px-4 py-3 rounded-xl border border-surface-300 bg-surface-100 text-navy-900 placeholder:text-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-wire-orange-DEFAULT focus:border-transparent transition-all resize-none" />
                    </div>

                    <div className="flex items-start gap-2 text-xs text-slate-400 bg-amber-50 border border-amber-200 rounded-xl p-3">
                      <AlertCircle size={12} className="text-amber-500 flex-shrink-0 mt-0.5" />
                      <span>Clicking Send will open your email client. Alternatively, email <span className="font-semibold text-amber-700">support@deroyalhotspot.name.ng</span> directly.</span>
                    </div>

                    <button
                      type="submit"
                      disabled={submitting || !isValid}
                      id="demo-submit-btn"
                      className="w-full py-3.5 bg-wire-orange-DEFAULT hover:bg-wire-orange-dark disabled:bg-slate-200 disabled:text-slate-400 text-white font-extrabold rounded-xl text-sm transition-all shadow-wire-orange hover:shadow-lg min-h-[48px] flex items-center justify-center gap-2"
                    >
                      {submitting ? 'Opening emailâ€¦' : (
                        <>Send Enquiry <ArrowRight size={15} /></>
                      )}
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
