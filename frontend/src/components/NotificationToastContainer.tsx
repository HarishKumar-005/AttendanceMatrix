import React, { useEffect } from 'react';
import { ShieldAlert, AlertTriangle, TrendingUp, Info, X, ExternalLink } from 'lucide-react';
import { ToastItem } from '../hooks/useNotifications';
import { NotificationSeverity } from '../api/client';

interface NotificationToastContainerProps {
  toasts: ToastItem[];
  onDismiss: (toastId: string) => void;
  onSelectStudent?: (studentId: string, studentName: string, studentCode: string, classSection: string) => void;
}

export const NotificationToastContainer: React.FC<NotificationToastContainerProps> = ({
  toasts,
  onDismiss,
  onSelectStudent,
}) => {
  useEffect(() => {
    if (toasts.length > 0) {
      const timer = setTimeout(() => {
        onDismiss(toasts[0].id);
      }, 6000);
      return () => clearTimeout(timer);
    }
  }, [toasts, onDismiss]);

  if (toasts.length === 0) return null;

  const getSeverityIcon = (severity: NotificationSeverity) => {
    switch (severity) {
      case 'critical':
        return <ShieldAlert style={{ width: '1.25rem', height: '1.25rem', color: '#f43f5e' }} />;
      case 'warning':
        return <AlertTriangle style={{ width: '1.25rem', height: '1.25rem', color: '#f59e0b' }} />;
      case 'recovery':
        return <TrendingUp style={{ width: '1.25rem', height: '1.25rem', color: '#10b981' }} />;
      case 'info':
      default:
        return <Info style={{ width: '1.25rem', height: '1.25rem', color: '#6366f1' }} />;
    }
  };

  return (
    <div className="toast-container-wrapper">
      {toasts.map((toast) => {
        const item = toast.notification;

        return (
          <div key={toast.id} className={`toast-card toast-severity-${item.severity}`}>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.625rem' }}>
              <div style={{ flexShrink: 0, marginTop: '0.125rem' }}>{getSeverityIcon(item.severity)}</div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: '0.8125rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.125rem' }}>
                  {item.title}
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', lineHeight: 1.3, marginBottom: '0.375rem' }}>
                  {item.message}
                </div>

                {item.student_id && onSelectStudent && (
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => {
                      onDismiss(toast.id);
                      onSelectStudent(
                        item.student_id!,
                        item.student_name || 'Student',
                        item.student_code || '',
                        item.class_section || ''
                      );
                    }}
                    style={{ padding: '0.1875rem 0.5rem', fontSize: '0.6875rem', minHeight: '24px' }}
                  >
                    <ExternalLink style={{ width: '0.6875rem', height: '0.6875rem', color: 'var(--primary)' }} />
                    View Student →
                  </button>
                )}
              </div>

              <button
                type="button"
                className="btn btn-secondary drawer-close-btn"
                onClick={() => onDismiss(toast.id)}
                title="Dismiss toast"
              >
                <X style={{ width: '0.75rem', height: '0.75rem' }} />
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
};
