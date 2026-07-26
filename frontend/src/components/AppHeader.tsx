import React from 'react';
import { GraduationCap, CheckSquare, History, ShieldAlert, Plus } from 'lucide-react';
import { ActiveTabMode } from '../hooks/useAttendance';
import { SummaryMetrics, TeacherNotification } from '../api/client';
import { NotificationBell } from './NotificationBell';

export type CombinedTabMode = ActiveTabMode | 'early-warning';

interface AppHeaderProps {
  activeTab: CombinedTabMode;
  onTabChange: (tab: CombinedTabMode) => void;
  metrics: SummaryMetrics;
  onOpenAddModal: () => void;
  notifications: TeacherNotification[];
  unreadCount: number;
  loadingNotifs: boolean;
  errorNotifs: string | null;
  isNotifOpen: boolean;
  notifActiveTab: 'all' | 'unread';
  onNotifToggle: () => void;
  onNotifClose: () => void;
  onNotifTabChange: (tab: 'all' | 'unread') => void;
  onMarkRead: (id: string) => void;
  onMarkAllRead: () => void;
  onDismissNotif: (id: string) => void;
  onClearAllNotifs: () => void;
  onRefreshNotifs: () => void;
  onSelectStudent?: (studentId: string, studentName: string, studentCode: string, classSection: string) => void;
}

export const AppHeader: React.FC<AppHeaderProps> = ({
  activeTab,
  onTabChange,
  metrics: _metrics,
  onOpenAddModal,
  notifications,
  unreadCount,
  loadingNotifs,
  errorNotifs,
  isNotifOpen,
  notifActiveTab,
  onNotifToggle,
  onNotifClose,
  onNotifTabChange,
  onMarkRead,
  onMarkAllRead,
  onDismissNotif,
  onClearAllNotifs,
  onRefreshNotifs,
  onSelectStudent,
}) => {
  return (
    <header className="glass-panel app-header" style={{ padding: '0.875rem 1.25rem', marginBottom: '1rem' }}>
      <div className="app-header-content" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
        {/* Brand & Subtitle */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', minWidth: 0, maxWidth: '100%' }}>
          <GraduationCap style={{ width: '1.25rem', height: '1.25rem', color: 'var(--primary)', flexShrink: 0 }} />
          <div style={{ minWidth: 0 }}>
            <h1 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#ffffff', lineHeight: 1.2 }}>
              AttendanceMatrix
            </h1>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.125rem', overflowWrap: 'break-word', lineHeight: 1.3 }}>
              Smart school attendance &amp; 30-day early-warning register
            </p>
          </div>
        </div>

        {/* Mode Switcher Tabs, Risk Alerts Bell, & Quick Action */}
        <div className="app-header-actions" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', maxWidth: '100%' }}>
          <div className="nav-tab-group">
            <button
              type="button"
              className={`nav-tab-btn ${activeTab === 'workspace' ? 'active' : ''}`}
              onClick={() => onTabChange('workspace')}
              title="Daily Attendance Register"
            >
              <CheckSquare style={{ width: '0.875rem', height: '0.875rem', flexShrink: 0 }} />
              <span className="tab-label-desktop">Daily Register</span>
              <span className="tab-label-mobile">Register</span>
            </button>

            <button
              type="button"
              className={`nav-tab-btn ${activeTab === 'history' ? 'active' : ''}`}
              onClick={() => onTabChange('history')}
              title="Attendance Audit & Log History"
            >
              <History style={{ width: '0.875rem', height: '0.875rem', flexShrink: 0 }} />
              <span className="tab-label-desktop">Attendance History</span>
              <span className="tab-label-mobile">History</span>
            </button>

            <button
              type="button"
              className={`nav-tab-btn ${activeTab === 'early-warning' ? 'active' : ''}`}
              onClick={() => onTabChange('early-warning')}
              title="Dropout Early Warning Center & Defaulters"
            >
              <ShieldAlert style={{ width: '0.875rem', height: '0.875rem', color: activeTab === 'early-warning' ? '#ffffff' : '#f43f5e', flexShrink: 0 }} />
              <span className="tab-label-desktop">Early Warning Center</span>
              <span className="tab-label-mobile">Warnings</span>
            </button>
          </div>

          {/* Teacher Notification Bell */}
          <NotificationBell
            notifications={notifications}
            unreadCount={unreadCount}
            loading={loadingNotifs}
            error={errorNotifs}
            isOpen={isNotifOpen}
            activeTab={notifActiveTab}
            onToggle={onNotifToggle}
            onClose={onNotifClose}
            onTabChange={onNotifTabChange}
            onMarkRead={onMarkRead}
            onMarkAllRead={onMarkAllRead}
            onDismiss={onDismissNotif}
            onClearAll={onClearAllNotifs}
            onRefresh={onRefreshNotifs}
            onSelectStudent={onSelectStudent}
          />

          {activeTab === 'history' && (
            <button className="btn btn-secondary" onClick={onOpenAddModal} style={{ padding: '0.375rem 0.75rem', fontSize: '0.8125rem' }}>
              <Plus style={{ width: '0.875rem', height: '0.875rem' }} />
              Single Log
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
