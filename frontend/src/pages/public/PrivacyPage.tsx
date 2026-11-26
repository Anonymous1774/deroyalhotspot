import React from 'react';
import { SEOHead } from '../../components/SEOHead';

const Section: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
  <div className="space-y-3">
    <h2 className="text-lg font-extrabold text-navy-900">{title}</h2>
    <div className="text-slate-500 text-sm leading-relaxed space-y-2">{children}</div>
  </div>
);

export const PrivacyPage: React.FC = () => {
  const updated = 'November 2026';
  return (
    <>
      <SEOHead
        title="Privacy Policy | De Royal Hotspot"
        description="Privacy policy for De Royal Hotspot  how we collect, use, and protect your data."
        canonicalPath="/privacy"
      />

      <section className="bg-navy-950 py-14 relative">
        <div className="wire-bar absolute top-0 left-0 right-0" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-3">
          <h1 className="text-4xl font-extrabold text-white">Privacy Policy</h1>
          <p className="text-white/40 text-sm">Last updated: {updated}</p>
        </div>
      </section>

      <section className="py-16 bg-surface-100">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 bg-white rounded-2xl border border-surface-300 p-8 sm:p-12 space-y-10">

          <Section title="1. Introduction">
            <p>De Royal Hotspot ("we", "us", or "our") is committed to protecting your privacy. This policy explains what data we collect when you use our hotspot service, how we use it, and how we protect it.</p>
          </Section>

          <Section title="2. Data We Collect">
            <p>When you use the De Royal Hotspot internet service, we may collect the following:</p>
            <ul className="list-disc list-inside space-y-1 pl-2">
              <li><strong>Device MAC address</strong>  used to authenticate and reconnect your device</li>
              <li><strong>IP address</strong>  assigned by the hotspot during your session</li>
              <li><strong>Voucher code</strong>  to track session activation and usage</li>
              <li><strong>Session data</strong>  including connection time, session duration, and data usage</li>
            </ul>
            <p>We do not collect your name, email address, payment details, or browsing history unless you voluntarily provide contact information through our support channels.</p>
          </Section>

          <Section title="3. How We Use Your Data">
            <p>Collected data is used exclusively to:</p>
            <ul className="list-disc list-inside space-y-1 pl-2">
              <li>Authenticate and manage your hotspot session</li>
              <li>Enable automatic device reconnection during active sessions</li>
              <li>Monitor network performance and prevent abuse</li>
              <li>Comply with applicable legal obligations</li>
            </ul>
          </Section>

          <Section title="4. Data Retention">
            <p>Session data, MAC addresses, and voucher activity are retained for a period sufficient to maintain network operations, resolve disputes, and comply with legal requirements. This data is not sold or shared with third parties for marketing purposes.</p>
          </Section>

          <Section title="5. Data Security">
            <p>We implement reasonable technical and administrative measures to protect data stored in our systems. However, no internet service or wireless network can guarantee complete security, and you use the service at your own risk.</p>
          </Section>

          <Section title="6. Third-Party Services">
            <p>The network uses MikroTik RouterOS for hotspot management. No personal data is shared with third parties beyond what is required to operate the service.</p>
          </Section>

          <Section title="7. Your Rights">
            <p>You may contact us to request information about what data we hold relating to your session activity, or to request deletion where technically feasible. Contact us at <a href="mailto:support@deroyalhotspot.name.ng" className="text-wire-blue-DEFAULT hover:underline">support@deroyalhotspot.name.ng</a>.</p>
          </Section>

          <Section title="8. Changes to This Policy">
            <p>This Privacy Policy may be updated from time to time. The "Last updated" date at the top of this page will reflect any changes. Continued use of the service constitutes acceptance of the revised policy.</p>
          </Section>

          <Section title="9. Contact">
            <p>For privacy-related enquiries, contact us at <a href="mailto:support@deroyalhotspot.name.ng" className="text-wire-blue-DEFAULT hover:underline">support@deroyalhotspot.name.ng</a> or call <a href="tel:+2347017741881" className="text-wire-blue-DEFAULT hover:underline">+234 701 774 1881</a>.</p>
          </Section>
        </div>
      </section>
    </>
  );
};
