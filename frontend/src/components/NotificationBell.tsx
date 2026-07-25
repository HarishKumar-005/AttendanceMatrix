import React, { useRef, useEffect } from 'react';
import ReactDOM from 'react-dom';
import {
  Bell,
  Check,
  CheckCheck,
  Trash2,
  AlertTriangle,
  ShieldAlert,
  TrendingUp,
  Info,
  X,
  ExternalLink,
  RotateCcw,
} from 'lucide-react';
import { TeacherNotification, NotificationSeverity } from '../api/client';

interface NotificationBellProps {
  notifications: TeacherNotification[];
  unreadCount: number;
  loading: boolean;
  error: string | null;
  isOpen: boolean;
  activeTab: 'all' | 'unread';
  onToggle: () => void;
  onClose: () => void;
  onTabChange: (tab: 'all' | 'unread') => void;
  onMarkRead: (id: string) => void;
  onMarkAllRead: () => void;
  onDismiss: (id: string) => void;
  onClearAll: () => void;
  onRefresh: () => void;
  onSelectStudent?: (studentId: string, studentName: string, studentCode: string, classSection: string) => void;
}

export const NotificationBell: React.FC<NotificationBellProps> = ({
  notifications,
  unreadCount,
  loading,
  error,
  isOpen,
  activeTab,
  onToggle,
  onClose,
  onTabChange,
  onMarkRead,
  onMarkAllRead,
  onDismiss,
  onClearAll,
  onRefresh,
  onSelectStudent,
}) => {
  const panelRef = useRef<HTMLDivElement>(null);

  // Close panel on outside click or Escape key
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (isOpen && panelRef.current && !panelRef.current.contains(e.target as Node)) {
        const targetEl = e.target as HTMLElement;
        if (!targetEl.closest('.notif-bell-btn')) {
          onClose();
        }
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (isOpen && e.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleOutsideClick);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  const getSeverityIcon = (severity: NotificationSeverity) => {
    switch (severity) {
      case 'critical':
        return <ShieldAlert style={{ width: '1rem', height: '1rem', color: '#f43f5e' }} />;
      case 'warning':
        return <AlertTriangle style={{ width: '1rem', height: '1rem', color: '#f59e0b' }} />;
      case 'recovery':
        return <TrendingUp style={{ width: '1rem', height: '1rem', color: '#10b981' }} />;
      case 'info':
      default:
        return <Info style={{ width: '1rem', height: '1rem', color: '#6366f1' }} />;
    }
  };

  const getSeverityBadge = (severity: NotificationSeverity) => {
    switch (severity) {
      case 'critical':
        return <span className="badge badge-warning" style={{ background: 'rgba(244, 63, 94, 0.15)', color: '#fda4af' }}>Critical</span>;
      case 'warning':
        return <span className="badge badge-excused">Approaching</span>;
      case 'recovery':
        return <span className="badge badge-present">Recovered</span>;
      case 'info':
      default:
        return <span className="badge" style={{ background: 'rgba(99, 102, 241, 0.15)', color: '#a5b4fc' }}>Info</span>;
    }
  };

  const formatTimeAgo = (dateStr: string) => {
    const created = new Date(dateStr).getTime();
    const diffSeconds = Math.floor((Date.now() - created) / 1000);
    if (diffSeconds < 60) return 'Just now';
    if (diffSeconds < 3600) return `${Math.floor(diffSeconds / 60)}m ago`;
    if (diffSeconds < 86400) return `${Math.floor(diffSeconds / 3600)}h ago`;
    return `${Math.floor(diffSeconds / 86400)}d ago`;
  };

  const renderDropdownOverlay = () => {
    if (!isOpen) return null;

    return ReactDOM.createPortal(
      <>
        {/* Backdrop Layer */}
        <div
          className="notif-backdrop"
          onClick={onClose}
          aria-hidden="true"
        />

        {/* Notification Dropdown Panel / Bottom Sheet */}
        <div ref={panelRef} className="notif-panel-container glass-panel">
          {/* Panel Header */}
          <div className="notif-panel-header">
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Bell style={{ width: '1rem', height: '1rem', color: 'var(--primary)' }} />
              <h3 style={{ fontSize: '0.9375rem', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>
                Early Warning Alerts
              </h3>
              {unreadCount > 0 && (
                <span className="badge badge-warning" style={{ fontSize: '0.6875rem' }}>
                  {unreadCount} New
                </span>
              )}
            </div>

            <button type="button" className="btn btn-secondary drawer-close-btn" onClick={onClose} title="Close notifications">
              <X style={{ width: '0.875rem', height: '0.875rem' }} />
            </button>
          </div>

          {/* Controls Bar: Tabs & Quick Actions */}
          <div className="notif-controls-bar">
            <div className="nav-tab-group" style={{ padding: '0.125rem' }}>
              <button
                type="button"
                className={`nav-tab-btn ${activeTab === 'all' ? 'active' : ''}`}
                onClick={() => onTabChange('all')}
                style={{ padding: '0.25rem 0.625rem', fontSize: '0.75rem', minHeight: '28px' }}
              >
                All ({notifications.length})
              </button>
              <button
                type="button"
                className={`nav-tab-btn ${activeTab === 'unread' ? 'active' : ''}`}
                onClick={() => onTabChange('unread')}
                style={{ padding: '0.25rem 0.625rem', fontSize: '0.75rem', minHeight: '28px' }}
              >
                Unread ({unreadCount})
              </button>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
              {unreadCount > 0 && (
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={onMarkAllRead}
                  style={{ padding: '0.25rem 0.5rem', fontSize: '0.6875rem', minHeight: '28px' }}
                  title="Mark all as read"
                >
                  <CheckCheck style={{ width: '0.75rem', height: '0.75rem', color: 'var(--present)' }} />
                  Read All
                </button>
              )}

              {notifications.length > 0 && (
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={onClearAll}
                  style={{ padding: '0.25rem 0.5rem', fontSize: '0.6875rem', minHeight: '28px' }}
                  title="Clear all active notifications"
                >
                  <Trash2 style={{ width: '0.75rem', height: '0.75rem', color: 'var(--text-muted)' }} />
                  Clear
                </button>
              )}
            </div>
          </div>

          {/* Body: 4 Explicit UI States */}
          <div className="notif-panel-body">
            {/* State 1: Loading */}
            {loading && (
              <div style={{ padding: '1rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {[1, 2, 3].map((i) => (
                  <div key={i} className="skeleton" style={{ height: '70px', width: '100%' }} />
                ))}
              </div>
            )}

            {/* State 2: Error */}
            {!loading && error && (
              <div style={{ padding: '1.5rem', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}>
                <AlertTriangle style={{ width: '1.5rem', height: '1.5rem', color: '#f43f5e' }} />
                <div style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>{error}</div>
                <button type="button" className="btn btn-secondary" onClick={onRefresh} style={{ padding: '0.375rem 0.75rem', fontSize: '0.75rem' }}>
                  <RotateCcw style={{ width: '0.75rem', height: '0.75rem' }} />
                  Retry Connection
                </button>
              </div>
            )}

            {/* State 3: Empty */}
            {!loading && !error && notifications.length === 0 && (
              <div style={{ padding: '2rem 1rem', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}>
                <div style={{ width: '2.5rem', height: '2.5rem', borderRadius: '50%', backgroundColor: 'rgba(99, 102, 241, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Bell style={{ width: '1.25rem', height: '1.25rem', color: 'var(--primary)' }} />
                </div>
                <div style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                  No notifications yet
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  {activeTab === 'unread' ? 'You have caught up with all unread warning alerts!' : 'Student risk transitions will appear here automatically.'}
                </div>
              </div>
            )}

            {/* State 4: Success List */}
            {!loading && !error && notifications.length > 0 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
                {notifications.map((item) => (
                  <div
                    key={item.id}
                    className={`notif-card ${!item.is_read ? 'notif-unread' : ''}`}
                    style={{
                      padding: '0.75rem',
                      borderRadius: 'var(--radius-sm)',
                      background: !item.is_read ? 'rgba(99, 102, 241, 0.08)' : 'rgba(15, 23, 42, 0.4)',
                      border: !item.is_read ? '1px solid rgba(99, 102, 241, 0.3)' : '1px solid var(--border-color)',
                      transition: 'background-color 0.15s ease',
                      position: 'relative',
                    }}
                  >
                    {/* Header Row: Severity Icon, Title, Time, Badge */}
                    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '0.5rem', marginBottom: '0.375rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
                        {getSeverityIcon(item.severity)}
                        <span style={{ fontSize: '0.8125rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                          {item.title}
                        </span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
                        <span style={{ fontSize: '0.6875rem', color: 'var(--text-muted)' }}>
                          {formatTimeAgo(item.created_at)}
                        </span>
                        {getSeverityBadge(item.severity)}
                      </div>
                    </div>

                    {/* Message Body */}
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', lineHeight: 1.4, marginBottom: '0.5rem' }}>
                      {item.message}
                    </div>

                    {/* Teacher Action Recommendation */}
                    {item.recommendation && (
                      <div
                        style={{
                          fontSize: '0.6875rem',
                          color: '#a5b4fc',
                          background: 'rgba(99, 102, 241, 0.08)',
                          padding: '0.375rem 0.5rem',
                          borderRadius: 'var(--radius-sm)',
                          borderLeft: '2px solid var(--primary)',
                          marginBottom: '0.5rem',
                        }}
                      >
                        <strong>Recommendation:</strong> {item.recommendation}
                      </div>
                    )}

                    {/* Quick Actions Footer */}
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '0.25rem', paddingTop: '0.375rem', borderTop: '1px solid rgba(255, 255, 255, 0.04)' }}>
                      <div>
                        {item.student_id && onSelectStudent && (
                          <button
                            type="button"
                            className="btn btn-secondary"
                            onClick={() => {
                              onClose();
                              onSelectStudent(
                                item.student_id!,
                                item.student_name || 'Student',
                                item.student_code || '',
                                item.class_section || ''
                              );
                            }}
                            style={{ padding: '0.1875rem 0.5rem', fontSize: '0.6875rem', minHeight: '26px' }}
                          >
                            <ExternalLink style={{ width: '0.6875rem', height: '0.6875rem', color: 'var(--primary)' }} />
                            View Student
                          </button>
                        )}
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                        {!item.is_read && (
                          <button
                            type="button"
                            className="btn btn-secondary"
                            onClick={() => onMarkRead(item.id)}
                            style={{ padding: '0.1875rem 0.375rem', fontSize: '0.6875rem', minHeight: '26px' }}
                            title="Mark as read"
                          >
                            <Check style={{ width: '0.6875rem', height: '0.6875rem', color: 'var(--present)' }} />
                          </button>
                        )}

                        <button
                          type="button"
                          className="btn btn-secondary"
                          onClick={() => onDismiss(item.id)}
                          style={{ padding: '0.1875rem 0.375rem', fontSize: '0.6875rem', minHeight: '26px' }}
                          title="Dismiss notification"
                        >
                          <X style={{ width: '0.6875rem', height: '0.6875rem' }} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </>,
      document.body
    );
  };

  return (
    <div style={{ position: 'relative', display: 'inline-block' }}>
      {/* Bell Button */}
      <button
        type="button"
        className="btn btn-secondary notif-bell-btn"
        onClick={onToggle}
        title="Early Warning Notification Center"
        aria-label="Early Warning Notifications"
        style={{
          position: 'relative',
          padding: '0.4375rem 0.625rem',
          minHeight: '36px',
          display: 'flex',
          alignItems: 'center',
          gap: '0.375rem',
        }}
      >
        <Bell style={{ width: '1.125rem', height: '1.125rem', color: unreadCount > 0 ? 'var(--primary)' : 'var(--text-secondary)' }} />
        <span style={{ fontSize: '0.75rem', fontWeight: 600, display: 'none' }} className="bell-label-desktop">
          Alerts
        </span>

        {unreadCount > 0 && (
          <span className="notif-badge-pulse" title={`${unreadCount} unread early warning alerts`}>
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {/* Render Dropdown via React Portal */}
      {renderDropdownOverlay()}
    </div>
  );
};
