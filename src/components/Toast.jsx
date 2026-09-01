import React from 'react';
import { useApp } from '../context/AppContext';
import { CheckCircle, AlertCircle, AlertTriangle, Info, X } from 'lucide-react';

const iconMap = {
  success: CheckCircle,
  error: AlertCircle,
  warning: AlertTriangle,
  info: Info,
};

const Toast = () => {
  const { toasts, dismissToast } = useApp();

  if (toasts.length === 0) return null;

  return (
    <div className="toast-container">
      {toasts.map(toast => {
        const Icon = iconMap[toast.type] || Info;
        return (
          <div key={toast.id} className={`dw-toast dw-toast-${toast.type}`}>
            <Icon className="dw-toast-icon" />
            <span className="dw-toast-message">{toast.message}</span>
            <button className="dw-toast-close" onClick={() => dismissToast(toast.id)}>
              <X size={14} />
            </button>
          </div>
        );
      })}
    </div>
  );
};

export default Toast;
