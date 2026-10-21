import React, { createContext, useContext, useState, useCallback } from 'react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

export type ToastType = 'success' | 'error' | 'info';

interface Toast {
  id: string;
  type: ToastType;
  title: string;
  message?: string;
}

interface ToastContextType {
  showToast: (title: string, message?: string, type?: ToastType) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const showToast = useCallback((title: string, message?: string, type: ToastType = 'success') => {
    const id = `${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    const newToast: Toast = { id, type, title, message };
    setToasts(prev => [...prev, newToast]);

    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 4500);
  }, []);

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none px-4">
        {toasts.map(toast => (
          <div
            key={toast.id}
            className={`pointer-events-auto flex items-start gap-3 p-4 rounded-xl shadow-elevation border transition-all duration-300 animate-slide-up ${
              toast.type === 'success'
                ? 'bg-white border-[#8CBF66] text-[#202B24]'
                : toast.type === 'error'
                ? 'bg-white border-[#C94B45] text-[#202B24]'
                : 'bg-white border-[#4F8A52] text-[#202B24]'
            }`}
          >
            {toast.type === 'success' && <CheckCircle2 className="w-5 h-5 text-[#2F855A] shrink-0 mt-0.5" />}
            {toast.type === 'error' && <AlertCircle className="w-5 h-5 text-[#C94B45] shrink-0 mt-0.5" />}
            {toast.type === 'info' && <Info className="w-5 h-5 text-[#4F8A52] shrink-0 mt-0.5" />}
            <div className="flex-1 min-w-0">
              <h4 className="text-sm font-semibold text-[#202B24]">{toast.title}</h4>
              {toast.message && <p className="text-xs text-[#66736A] mt-0.5 leading-relaxed">{toast.message}</p>}
            </div>
            <button
              onClick={() => removeToast(toast.id)}
              className="text-[#66736A] hover:text-[#202B24] p-1 rounded-md transition-colors"
              aria-label="Close"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) throw new Error('useToast must be used within ToastProvider');
  return context;
};
