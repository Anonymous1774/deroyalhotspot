import { useState, useEffect } from 'react';
import { CreditCard, Calendar, CheckCircle, XCircle, Clock, AlertCircle } from 'lucide-react';
import ispApi from '../../services/ispApi';
import { useIspAuth } from '../../contexts/isp/IspAuthContext';

interface Subscription {
  id: string;
  status: string;
  startDate: string;
  endDate?: string;
  trialEndDate?: string;
  plan?: {
    name: string;
    price: number;
    billingCycle: string;
    routerLimit: number;
    staffLimit: number;
    voucherLimit?: number;
    description?: string;
  };
}

export function IspSubscriptionPage() {
  useIspAuth();
  const [sub, setSub] = useState<Subscription | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    ispApi.get('/tenants/me')
      .then(r => setSub(r.data.data?.subscription || null))
      .catch(() => setError('Failed to load subscription details.'))
      .finally(() => setLoading(false));
  }, []);

  const statusConfig: Record<string, { icon: typeof CheckCircle; color: string; label: string }> = {
    TRIAL: { icon: Clock, color: 'text-amber-500', label: 'Free Trial' },
    ACTIVE: { icon: CheckCircle, color: 'text-wire-green', label: 'Active' },
    EXPIRED: { icon: XCircle, color: 'text-red-500', label: 'Expired' },
    SUSPENDED: { icon: AlertCircle, color: 'text-red-600', label: 'Suspended' },
    CANCELLED: { icon: XCircle, color: 'text-slate-400', label: 'Cancelled' },
  };

  const sc = statusConfig[sub?.status || ''] || statusConfig.TRIAL;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-navy-900">Subscription</h1>
        <p className="text-sm text-slate-500 mt-1">Your DHOS platform subscription status</p>
      </div>

      {error && (
        <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-3 text-sm">
          <AlertCircle className="w-4 h-4 shrink-0" />{error}
        </div>
      )}

      {loading ? (
        <div className="bg-white rounded-xl border border-slate-100 p-8 text-center">
          <div className="w-8 h-8 border-4 border-wire-blue border-t-transparent rounded-full animate-spin mx-auto" />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Status Card */}
          <div className="bg-white rounded-xl border border-slate-100 p-6">
            <div className="flex items-center gap-3 mb-4">
              <CreditCard className="w-5 h-5 text-wire-blue" />
              <h2 className="font-semibold text-navy-900">Current Plan</h2>
            </div>
            <div className="flex items-center gap-2 mb-2">
              <sc.icon className={`w-5 h-5 ${sc.color}`} />
              <span className={`font-semibold text-lg ${sc.color}`}>{sc.label}</span>
            </div>
            <p className="text-2xl font-bold text-navy-900 mt-2">{sub?.plan?.name || 'Trial Plan'}</p>
            {sub?.plan?.price !== undefined && (
              <p className="text-sm text-slate-500 mt-1">
                ₦{sub.plan.price.toLocaleString()} / {sub.plan.billingCycle?.toLowerCase() || 'month'}
              </p>
            )}
            {sub?.plan?.description && (
              <p className="text-sm text-slate-400 mt-2">{sub.plan.description}</p>
            )}
          </div>

          {/* Plan Limits */}
          <div className="bg-white rounded-xl border border-slate-100 p-6">
            <h2 className="font-semibold text-navy-900 mb-4">Plan Limits</h2>
            {sub?.plan ? (
              <div className="space-y-3">
                {[
                  { label: 'Router Limit', value: sub.plan.routerLimit === -1 ? 'Unlimited' : sub.plan.routerLimit },
                  { label: 'Staff Limit', value: sub.plan.staffLimit === -1 ? 'Unlimited' : sub.plan.staffLimit },
                  { label: 'Voucher Limit', value: sub.plan.voucherLimit === -1 || !sub.plan.voucherLimit ? 'Unlimited' : sub.plan.voucherLimit },
                ].map(item => (
                  <div key={item.label} className="flex items-center justify-between py-2 border-b border-slate-50 last:border-0">
                    <span className="text-sm text-slate-600">{item.label}</span>
                    <span className="text-sm font-semibold text-navy-900">{item.value}</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-slate-400">Trial plan — unlimited access during trial period.</p>
            )}
          </div>

          {/* Dates */}
          <div className="bg-white rounded-xl border border-slate-100 p-6">
            <div className="flex items-center gap-3 mb-4">
              <Calendar className="w-5 h-5 text-wire-blue" />
              <h2 className="font-semibold text-navy-900">Subscription Dates</h2>
            </div>
            <div className="space-y-3">
              {sub?.status === 'TRIAL' && sub.trialEndDate && (
                <div className="flex items-center justify-between py-2 border-b border-slate-50">
                  <span className="text-sm text-slate-600">Trial Ends</span>
                  <span className="text-sm font-semibold text-amber-600">{new Date(sub.trialEndDate).toLocaleDateString()}</span>
                </div>
              )}
              {sub?.startDate && (
                <div className="flex items-center justify-between py-2 border-b border-slate-50">
                  <span className="text-sm text-slate-600">Start Date</span>
                  <span className="text-sm font-semibold text-navy-900">{new Date(sub.startDate).toLocaleDateString()}</span>
                </div>
              )}
              {sub?.endDate && (
                <div className="flex items-center justify-between py-2">
                  <span className="text-sm text-slate-600">Renewal Date</span>
                  <span className="text-sm font-semibold text-navy-900">{new Date(sub.endDate).toLocaleDateString()}</span>
                </div>
              )}
            </div>
          </div>

          {/* Upgrade / Contact */}
          <div className="bg-navy-950 rounded-xl p-6 text-white">
            <h2 className="font-semibold text-lg mb-2">Need a different plan?</h2>
            <p className="text-slate-400 text-sm mb-4">
              Contact us to upgrade your subscription, increase your limits, or discuss custom pricing for your business.
            </p>
            <a href="mailto:support@deroyalhotspot.name.ng"
              className="inline-flex items-center gap-2 bg-wire-orange text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-wire-orange/90 transition-colors">
              Contact Support
            </a>
          </div>
        </div>
      )}
    </div>
  );
}
