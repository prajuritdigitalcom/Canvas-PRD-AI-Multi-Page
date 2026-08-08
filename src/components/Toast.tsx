import React from 'react';
import { AlertCircle, CheckCircle2, AlertTriangle, Info, X, RefreshCw } from 'lucide-react';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface ToastProps {
  message: string;
  type?: ToastType;
  onClose: () => void;
  onRetry?: () => void;
}

export const Toast: React.FC<ToastProps> = ({
  message,
  type = 'info',
  onClose,
  onRetry,
}) => {
  const getIcon = () => {
    switch (type) {
      case 'success':
        return <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />;
      case 'error':
        return <AlertCircle className="w-5 h-5 text-red-500 shrink-0" />;
      case 'warning':
        return <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0" />;
      default:
        return <Info className="w-5 h-5 text-blue-500 shrink-0" />;
    }
  };

  const getBorderColor = () => {
    switch (type) {
      case 'success':
        return 'border-emerald-200 bg-emerald-50 text-emerald-900';
      case 'error':
        return 'border-red-200 bg-red-50 text-red-900';
      case 'warning':
        return 'border-amber-200 bg-amber-50 text-amber-900';
      default:
        return 'border-slate-200 bg-white text-slate-900';
    }
  };

  return (
    <div className="fixed bottom-5 right-5 z-50 max-w-md w-full p-1 animate-in fade-in slide-in-from-bottom-5 duration-200">
      <div
        className={`flex items-start gap-3 p-4 rounded-2xl border shadow-xl ${getBorderColor()}`}
      >
        {getIcon()}
        <div className="flex-1 text-xs leading-relaxed font-medium pt-0.5">
          {message}
          {onRetry && (
            <div className="mt-2">
              <button
                type="button"
                onClick={onRetry}
                className="inline-flex items-center gap-1 px-3 py-1 rounded-lg bg-[#fe4c6f] hover:bg-[#e03b5b] text-white font-bold text-xs shadow-xs transition-all cursor-pointer"
              >
                <RefreshCw className="w-3 h-3" />
                <span>Coba Lagi</span>
              </button>
            </div>
          )}
        </div>
        <button
          type="button"
          onClick={onClose}
          className="p-1 rounded-lg hover:bg-black/5 text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
