import React from 'react';
import { SEOHead } from '../../components/SEOHead';

const Section: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
  <div className="space-y-3">
    <h2 className="text-lg font-extrabold text-navy-900">{title}</h2>
    <div className="text-slate-500 text-sm leading-relaxed space-y-2">{children}</div>
  </div>
);

export const TermsPage: React.FC = () => {
  const updated = 'November 2026';
  return (
    <>
      <SEOHead
        title="Terms & Conditions | De Royal Hotspot"
        description="Terms and conditions for using De Royal Hotspot internet access services."
        canonicalPath="/terms"
      />

      <section className="bg-navy-950 py-14 relative">
        <div className="wire-bar absolute top-0 left-0 right-0" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-3">
          <h1 className="text-4xl font-extrabold text-white">Terms & Conditions</h1>
          <p className="text-white/40 text-sm">Last updated: {updated}</p>
        </div>
      </section>

      <section className="py-16 bg-surface-100">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 bg-white rounded-2xl border border-surface-300 p-8 sm:p-12 space-y-10">

          <Section title="1. Acceptance of Terms">
            <p>By accessing or using the De Royal Hotspot internet service, you agree to be bound by these Terms and Conditions. If you do not agree with any part of these terms, you must not use the service.</p>
          </Section>

          <Section title="2. Use of Service">
            <p>De Royal Hotspot provides internet access through a voucher-based hotspot system. By activating a voucher, you are granted temporary internet access for the duration specified in your chosen plan.</p>
            <p>You agree to use the service only for lawful purposes. You must not use the service to:</p>
            <ul className="list-disc list-inside space-y-1 pl-2">
              <li>Transmit unlawful, harmful, or offensive content</li>
              <li>Attempt to breach the security of the network</li>
              <li>Interfere with or disrupt the service for other users</li>
              <li>Engage in any activity that violates applicable law</li>
            </ul>
          </Section>

          <Section title="3. Voucher Activation">
            <p>Vouchers are non-transferable and single-use. Each voucher is associated with one device MAC address at the time of activation. Sessions begin at activation and cannot be paused, transferred, or refunded once used.</p>
            <p>De Royal Hotspot is not responsible for lost or stolen voucher codes.</p>
          </Section>

          <Section title="4. Network Performance">
            <p>De Royal Hotspot makes reasonable efforts to maintain a reliable and consistent service. However, we do not guarantee uninterrupted, error-free, or specific-speed internet access. Network performance may vary based on the number of connected users, network conditions, and other factors.</p>
          </Section>

          <Section title="5. Limitation of Liability">
            <p>To the fullest extent permitted by law, De Royal Hotspot shall not be liable for any indirect, incidental, or consequential damages arising from the use or inability to use the service, including but not limited to data loss, service interruptions, or unauthorised access to data transmitted over the network.</p>
          </Section>

          <Section title="6. Privacy">
            <p>Your use of the service is also governed by our <a href="/privacy" className="text-wire-blue-DEFAULT hover:underline">Privacy Policy</a>, which is incorporated into these Terms by reference.</p>
          </Section>

          <Section title="7. Changes to Terms">
            <p>De Royal Hotspot reserves the right to update these Terms at any time. Continued use of the service after changes are posted constitutes acceptance of the revised Terms.</p>
          </Section>

          <Section title="8. Contact">
            <p>For questions about these Terms, contact us at <a href="mailto:support@deroyalhotspot.name.ng" className="text-wire-blue-DEFAULT hover:underline">support@deroyalhotspot.name.ng</a> or call <a href="tel:+2347017741881" className="text-wire-blue-DEFAULT hover:underline">+234 701 774 1881</a>.</p>
          </Section>
        </div>
      </section>
    </>
  );
};
