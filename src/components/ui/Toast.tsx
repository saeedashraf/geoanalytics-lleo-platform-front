'use client';

import { useEffect } from 'react';
import { X, CheckCircle, AlertCircle, AlertTriangle, Info } from 'lucide-react';
import { ToastProps } from '@/types/ui';
import { cn } from '@/utils/cn';

const Toast: React.FC<ToastProps> = ({
  id,
  type,
  title,
  message,
  duration = 5000,
  onClose
}) => {
  useEffect(() => {
    if (duration > 0) {
      const timer = setTimeout(() => {
        onClose(id);
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [duration, id, onClose]);

  const getIcon = () => {
    switch (type) {
      case 'success':
        return <CheckCircle className="w-5 h-5" />;
      case 'error':
        return <AlertCircle className="w-5 h-5" />;
      case 'warning':
        return <AlertTriangle className="w-5 h-5" />;
      case 'info':
        return <Info className="w-5 h-5" />;
      default:
        return <Info className="w-5 h-5" />;
    }
  };

  const getStyles = () => {
    switch (type) {
      case 'success':
        return 'bg-success-50 border-success-200 text-success-900';
      case 'error':
        return 'bg-error-50 border-error-200 text-error-900';
      case 'warning':
        return 'bg-warning-50 border-warning-200 text-warning-900';
      case 'info':
        return 'bg-primary-50 border-primary-200 text-primary-900';
      default:
        return 'bg-primary-50 border-primary-200 text-primary-900';
    }
  };

  const getIconColor = () => {
    switch (type) {
      case 'success':
        return 'text-success-600';
      case 'error':
        return 'text-error-600';
      case 'warning':
        return 'text-warning-600';
      case 'info':
        return 'text-primary-600';
      default:
        return 'text-primary-600';
    }
  };

  return (
    <div
      className={cn(
        'flex items-start space-x-3 p-4 rounded-lg border shadow-lg backdrop-blur-sm animate-slide-up max-w-md',
        getStyles()
      )}
    >
      <div className={cn('flex-shrink-0', getIconColor())}>
        {getIcon()}
      </div>
      
      <div className="flex-1 min-w-0">
        <h4 className="font-semibold text-sm">{title}</h4>
        {message && (
          <p className="text-sm opacity-90 mt-1">{message}</p>
        )}
      </div>
      
      <button
        onClick={() => onClose(id)}
        className="flex-shrink-0 p-1 rounded-md hover:bg-black/10 transition-colors"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
};

export default Toast;