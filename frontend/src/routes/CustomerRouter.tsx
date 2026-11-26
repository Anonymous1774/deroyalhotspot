import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { CustomerAuthProvider, useCustomerAuth } from '../contexts/customer/CustomerAuthContext';
import { CustomerLoginPage }    from '../pages/customer/CustomerLoginPage';
import { CustomerDashboardPage } from '../pages/customer/CustomerDashboardPage';
import { Link } from 'react-router-dom';
import { Wifi, LogOut } from 'lucide-react';

function CustomerLayout({ children }: { children: React.ReactNode }) {
  const { customer, logout } = useCustomerAuth();
  return (
    <div className="min-h-screen bg-slate-50 font-sans">
      <header className="bg-white border-b border-slate-100 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 h-14 flex items-center gap-3">
          <Link to="/" className="flex items-center gap-2 font-extrabold text-navy-900">
            <div className="w-7 h-7 bg-wire-orange rounded-lg flex items-center justify-center">
              <Wifi className="w-4 h-4 text-white" />
            </div>
            De Royal Hotspot
          </Link>
          <div className="flex-1" />
          {customer ? (
            <div className="flex items-center gap-3">
              <span className="text-sm text-slate-600 font-medium">{customer.name}</span>
              <button onClick={logout} className="text-slate-400 hover:text-red-500 transition-colors" title="Sign out">
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <Link to="/login" className="text-sm font-semibold text-wire-blue hover:underline">Sign in</Link>
          )}
        </div>
      </header>
      <main className="max-w-4xl mx-auto px-4 py-8">{children}</main>
    </div>
  );
}

function ProtectedCustomerRoute({ children }: { children: React.ReactNode }) {
  const { customer, loading } = useCustomerAuth();
  if (loading) return <div className="min-h-screen flex items-center justify-center"><div className="w-8 h-8 border-4 border-wire-blue border-t-transparent rounded-full animate-spin" /></div>;
  if (!customer) return <Navigate to="/login" replace />;
  return <CustomerLayout>{children}</CustomerLayout>;
}

export function CustomerRouter() {
  return (
    <CustomerAuthProvider>
      <Routes>
        <Route path="/login"    element={<CustomerLayout><CustomerLoginPage /></CustomerLayout>} />
        <Route path="/register" element={<CustomerLayout><CustomerLoginPage isRegister /></CustomerLayout>} />
        <Route path="/dashboard" element={<ProtectedCustomerRoute><CustomerDashboardPage /></ProtectedCustomerRoute>} />
        <Route path="/"  element={<Navigate to="/dashboard" replace />} />
        <Route path="*"  element={<Navigate to="/login" replace />} />
      </Routes>
    </CustomerAuthProvider>
  );
}
