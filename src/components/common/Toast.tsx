import React, { useState, useEffect } from 'react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

export interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'info';
  message: string;
}

// Global listener for toast events
type Listener = (toast: ToastMessage) => void;
const listeners: Listener[] = [];

export const showToast = (message: string, type: 'success' | 'error' | 'info' = 'success') => {
  const toast: ToastMessage = {
    id: 't-' + Math.random().toString(36).substring(2, 9),
    type,
    message,
  };
  listeners.forEach((l) => l(toast));
};

export const ToastContainer: React.FC = () => {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  useEffect(() => {
    const handleAdd = (t: ToastMessage) => {
      setToasts((prev) => [...prev, t]);
      setTimeout(() => {
        setToasts((prev) => prev.filter((item) => item.id !== t.id));
      }, 4000);
    };

    listeners.push(handleAdd);
    return () => {
      const idx = listeners.indexOf(handleAdd);
      if (idx > -1) listeners.splice(idx, 1);
    };
  }, []);

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  return (
    <div className="toast-container" aria-live="polite">
      {toasts.map((t) => (
        <div
          key={t.id}
          className="toast"
          style={{
            borderLeftColor:
              t.type === 'success' ? '#10B981' : t.type === 'error' ? '#EF4444' : '#38BDF8',
          }}
        >
          {t.type === 'success' && <CheckCircle2 size={20} color="#10B981" />}
          {t.type === 'error' && <AlertCircle size={20} color="#EF4444" />}
          {t.type === 'info' && <Info size={20} color="#38BDF8" />}
          <span style={{ fontSize: '0.9rem', color: '#1F2937', flex: 1, fontWeight: 500 }}>
            {t.message}
          </span>
          <button
            onClick={() => removeToast(t.id)}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: '#9CA3AF',
              padding: '2px',
            }}
          >
            <X size={16} />
          </button>
        </div>
      ))}
    </div>
  );
};
