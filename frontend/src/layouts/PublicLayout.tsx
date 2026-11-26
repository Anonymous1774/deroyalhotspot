import React from 'react';
import { PublicNavbar } from '../components/public/PublicNavbar';
import { PublicFooter } from '../components/public/PublicFooter';

interface PublicLayoutProps {
  children: React.ReactNode;
}

export const PublicLayout: React.FC<PublicLayoutProps> = ({ children }) => {
  return (
    <div className="min-h-screen bg-surface-100 flex flex-col font-sans antialiased">
      <PublicNavbar />
      {/* Push content below fixed navbar */}
      <div className="h-16 lg:h-18 flex-shrink-0" />
      <main className="flex-1">
        {children}
      </main>
      <PublicFooter />
    </div>
  );
};
