import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight, Server, Ticket, Wifi, Zap } from 'lucide-react';
import { useIspAuth } from '../../contexts/isp/IspAuthContext';

const STEPS = [
  { icon: Server,  title: 'Connect your router',  desc: 'Add your MikroTik router details so DHOS can manage it.',  to: '/routers',  cta: 'Add Router' },
  { icon: Zap,     title: 'Create internet plans', desc: 'Define the packages your customers can purchase.',          to: '/plans',    cta: 'Create Plans' },
  { icon: Ticket,  title: 'Generate vouchers',     desc: 'Generate voucher codes for your customers to activate.',   to: '/vouchers', cta: 'Generate Vouchers' },
];

export function IspOnboardingPage() {
  const { user, tenant } = useIspAuth();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-navy-950 font-sans px-4 py-12 flex flex-col items-center">
      <div className="wire-bar h-1 w-20 rounded-full mb-8 mx-auto" />

      <div className="max-w-xl w-full text-center mb-10">
        <div className="w-14 h-14 bg-wire-orange/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <Wifi size={26} className="text-wire-orange" />
        </div>
        <h1 className="text-white font-extrabold text-3xl mb-2">
          Welcome to DHOS, {user?.fullName?.split(' ')[0] ?? 'there'}!
        </h1>
        <p className="text-slate-400 text-base">
          Your workspace <span className="text-white font-semibold">{tenant?.name}</span> is ready. Complete these three steps to go live.
        </p>
      </div>

      <div className="max-w-xl w-full space-y-4 mb-10">
        {STEPS.map((step, i) => (
          <div key={step.title} className="bg-navy-900 border border-navy-800 rounded-2xl p-6 flex items-start gap-4">
            <div className="w-10 h-10 bg-navy-800 rounded-xl flex items-center justify-center shrink-0">
              <step.icon size={18} className="text-wire-orange" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-slate-500 text-xs font-bold">STEP {i + 1}</span>
              </div>
              <h3 className="text-white font-bold text-base mb-1">{step.title}</h3>
              <p className="text-slate-400 text-sm">{step.desc}</p>
            </div>
            <Link
              to={step.to}
              className="flex items-center gap-1.5 text-wire-orange hover:text-orange-400 text-sm font-bold shrink-0 transition-colors"
            >
              {step.cta} <ArrowRight size={13} />
            </Link>
          </div>
        ))}
      </div>

      <button
        onClick={() => navigate('/dashboard')}
        className="text-slate-400 hover:text-white text-sm font-medium transition-colors"
      >
        Skip for now → Go to dashboard
      </button>
    </div>
  );
}
