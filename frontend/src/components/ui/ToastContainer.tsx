import React from 'react';
import { useToast, ToastType } from '../../contexts/ToastContext';
import { CheckCircle, AlertCircle, Info, AlertTriangle, X } from 'lucide-react';

const getToastIcon = (type: ToastType) => {
  switch (type) {
    case 'success':
      return <CheckCircle className="text-emerald-500 flex-shrink-0" size={20} />;
    case 'error':
      return <AlertCircle className="text-red-500 flex-shrink-0" size={20} />;
    case 'warning':
      return <AlertTriangle className="text-amber-500 flex-shrink-0" size={20} />;
    case 'info':
    default:
      return <Info className="text-blue-500 flex-shrink-0" size={20} />;
  }
};

const getBorderColor = (type: ToastType) => {
  switch (type) {
    case 'success': return 'border-emerald-500/30';
    case 'error': return 'border-red-500/30';
    case 'warning': return 'border-amber-500/30';
    case 'info': default: return 'border-blue-500/30';
  }
};

export const ToastContainer: React.FC = () => {
  const { toasts, removeToast } = useToast();

  if (toasts.length === 0) return null;

  return (
    <div className="fixed top-5 right-5 z-50 flex flex-col gap-3 max-w-sm w-full pointer-events-none">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`pointer-events-auto flex items-start gap-3 p-4 rounded-xl shadow-xl backdrop-blur-md bg-white/90 dark:bg-slate-900/90 text-slate-800 dark:text-slate-100 border ${getBorderColor(toast.type)} animate-scale-in transition-all`}
        >
          {getToastIcon(toast.type)}
          <div className="flex-1 min-w-0">
            <h4 className="text-sm font-bold leading-tight">{toast.title}</h4>
            {toast.message && (
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                {toast.message}
              </p>
            )}
          </div>
          <button
            onClick={() => removeToast(toast.id)}
            aria-label="Close notification"
            className="min-h-[44px] min-w-[44px] -m-2 flex items-center justify-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
          >
            <X size={16} />
          </button>
        </div>
      ))}
    </div>
  );
};
