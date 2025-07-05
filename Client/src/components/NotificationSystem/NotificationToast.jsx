import React, { useState, useEffect } from 'react';
import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from 'lucide-react';

const NotificationToast = ({ notification, onClose, onAction }) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Show toast after a brief delay
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, 100);

    // Auto-hide after 5 seconds
    const autoHideTimer = setTimeout(() => {
      handleClose();
    }, 5000);

    return () => {
      clearTimeout(timer);
      clearTimeout(autoHideTimer);
    };
  }, []);

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(() => {
      onClose();
    }, 300);
  };

  const handleAction = () => {
    if (notification.action?.type === 'link' && notification.action?.url) {
      window.location.href = notification.action.url;
    }
    onAction && onAction(notification);
    handleClose();
  };

  const getIcon = (type) => {
    switch (type) {
      case 'success':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'warning':
        return <AlertTriangle className="h-5 w-5 text-yellow-500" />;
      case 'error':
        return <AlertCircle className="h-5 w-5 text-red-500" />;
      case 'info':
        return <Info className="h-5 w-5 text-blue-500" />;
      default:
        return <Info className="h-5 w-5 text-gray-500" />;
    }
  };

  const getBorderColor = (type) => {
    switch (type) {
      case 'success':
        return 'border-green-200 bg-green-50';
      case 'warning':
        return 'border-yellow-200 bg-yellow-50';
      case 'error':
        return 'border-red-200 bg-red-50';
      case 'info':
        return 'border-blue-200 bg-blue-50';
      default:
        return 'border-gray-200 bg-white';
    }
  };

  return (
    <div
      className={`fixed top-4 right-4 z-50 max-w-sm w-full transform transition-all duration-300 ${
        isVisible ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'
      }`}
    >
      <div className={`rounded-lg shadow-lg border ${getBorderColor(notification.type)}`}>
        <div className="p-4">
          <div className="flex items-start">
            <div className="flex-shrink-0">
              {getIcon(notification.type)}
            </div>
            <div className="ml-3 flex-1">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-medium text-gray-900">
                  {notification.title}
                </h3>
                <button
                  onClick={handleClose}
                  className="ml-4 flex-shrink-0 text-gray-400 hover:text-gray-600"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
              <div className="mt-1">
                <p className="text-sm text-gray-600">
                  {notification.message}
                </p>
              </div>
              {notification.action?.type === 'link' && (
                <div className="mt-3">
                  <button
                    onClick={handleAction}
                    className="text-sm font-medium text-blue-600 hover:text-blue-800"
                  >
                    {notification.action.label} →
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotificationToast; 