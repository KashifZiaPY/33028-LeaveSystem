import React, { createContext, useContext, useState, useCallback } from 'react';
import { CheckCircle2, AlertCircle, Info, AlertTriangle, X } from 'lucide-react';

export type ToastType = 'success' | 'error' | 'info' | 'warning';

export interface Toast {
  id: string;
  type: ToastType;
  message: string;
  title?: string;
  duration?: number;
}

interface ToastContextValue {
  showToast: (message: string, type?: ToastType, title?: string, duration?: number) => void;
  showSuccess: (message: string, title?: string) => void;
  showError: (message: string, title?: string) => void;
  showInfo: (message: string, title?: string) => void;
  showWarning: (message: string, title?: string) => void;
  dismissToast: (id: string) => void;
}

const ToastContext = createContext<ToastContextValue | undefined>(undefined);

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const dismissToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const showToast = useCallback(
    (message: string, type: ToastType = 'info', title?: string, duration: number = 4500) => {
      const id = Math.random().toString(36).substring(2, 9);
      const newToast: Toast = { id, type, message, title, duration };

      setToasts((prev) => [...prev, newToast]);

      if (duration > 0) {
        setTimeout(() => {
          dismissToast(id);
        }, duration);
      }
    },
    [dismissToast]
  );

  const showSuccess = useCallback((message: string, title?: string) => {
    showToast(message, 'success', title || 'Success');
  }, [showToast]);

  const showError = useCallback((message: string, title?: string) => {
    showToast(message, 'error', title || 'Error');
  }, [showToast]);

  const showInfo = useCallback((message: string, title?: string) => {
    showToast(message, 'info', title || 'Notice');
  }, [showToast]);

  const showWarning = useCallback((message: string, title?: string) => {
    showToast(message, 'warning', title || 'Warning');
  }, [showToast]);

  return (
    <ToastContext.Provider
      value={{ showToast, showSuccess, showError, showInfo, showWarning, dismissToast }}
    >
      {children}
      
      {/* Toast container in top-right / mobile top */}
      <div 
        aria-live="assertive" 
        className="fixed top-4 right-4 left-4 sm:left-auto sm:w-96 z-50 pointer-events-none flex flex-col gap-2.5 max-h-screen overflow-hidden"
      >
        {toasts.map((toast) => {
          let bg = 'bg-white border-slate-200 text-slate-800 shadow-xl';
          let icon = <Info className="w-5 h-5 text-indigo-700 shrink-0" />;

          if (toast.type === 'success') {
            bg = 'bg-emerald-50 border-emerald-300 text-emerald-950 shadow-emerald-900/10';
            icon = <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />;
          } else if (toast.type === 'error') {
            bg = 'bg-rose-50 border-rose-300 text-rose-950 shadow-rose-900/10';
            icon = <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />;
          } else if (toast.type === 'warning') {
            bg = 'bg-amber-50 border-amber-300 text-amber-950 shadow-amber-900/10';
            icon = <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0" />;
          } else {
            bg = 'bg-indigo-50 border-indigo-200 text-indigo-950 shadow-indigo-900/10';
            icon = <Info className="w-5 h-5 text-indigo-600 shrink-0" />;
          }

          return (
            <div
              key={toast.id}
              className={`pointer-events-auto border rounded-xl p-3.5 flex items-start gap-3 shadow-lg transition-all transform duration-200 translate-y-0 ${bg}`}
              role="alert"
            >
              {icon}
              <div className="flex-1 min-w-0 pr-1">
                {toast.title && (
                  <h4 className="text-xs font-bold tracking-wide uppercase opacity-90 mb-0.5">
                    {toast.title}
                  </h4>
                )}
                <p className="text-sm font-medium leading-snug break-words">
                  {toast.message}
                </p>
              </div>
              <button
                onClick={() => dismissToast(toast.id)}
                className="text-slate-400 hover:text-slate-700 p-1 rounded-lg transition-colors -mr-1 -mt-1"
                aria-label="Close notification"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};
