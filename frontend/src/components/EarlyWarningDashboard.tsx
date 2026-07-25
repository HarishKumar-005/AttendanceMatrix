import React from 'react';
import {
  ShieldAlert,
  AlertTriangle,
  TrendingUp,
  Bell,
  ExternalLink,
  RotateCcw,
  CheckCircle2,
} from 'lucide-react';
import { TeacherNotification, NotificationAnalytics } from '../api/client';

interface EarlyWarningDashboardProps {
  notifications: TeacherNotification[];
  analytics: NotificationAnalytics | null;
  loading: boolean;
  error: string | null;
  onRefresh: () => void;
  onSelectStudent: (studentId: string, studentName: string, studentCode: string, classSection: string) => void;
}

export const EarlyWarningDashboard: React.FC<EarlyWarningDashboardProps> = ({
  notifications,
  analytics,
  loading: _loading,
  error: _error,
  onRefresh,
  onSelectStudent,
}) => {
  const criticalNotifications = notifications.filter((n) => n.severity === 'critical');
  const warningNotifications = notifications.filter((n) => n.severity === 'warning');
  const recoveryNotifications = notifications.filter((n) => n.severity === 'recovery');

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      {/* Overview Analytics Cards */}
      <div className="kpi-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.75rem' }}>
        {/* Critical Alerts */}
        <div className="glass-panel" style={{ padding: '0.75rem 1rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <div style={{ fontSize: '0.6875rem', fontWeight: 500, color: 'var(--text-muted)' }}>Critical Alerts</div>
            <div style={{ fontSize: '1.25rem', fontWeight: 700, color: '#f43f5e', marginTop: '0.125rem' }}>
              {analytics?.critical_count || criticalNotifications.length}
            </div>
          </div>
          <div style={{ width: '2rem', height: '2rem', borderRadius: 'var(--radius-sm)', background: 'rgba(244, 63, 94, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <ShieldAlert style={{ width: '1rem', height: '1rem', color: '#f43f5e' }} />
          </div>
        </div>

        {/* Near Threshold */}
        <div className="glass-panel" style={{ padding: '0.75rem 1rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <div style={{ fontSize: '0.6875rem', fontWeight: 500, color: 'var(--text-muted)' }}>Near Threshold</div>
            <div style={{ fontSize: '1.25rem', fontWeight: 700, color: '#f59e0b', marginTop: '0.125rem' }}>
              {analytics?.students_near_threshold_count || warningNotifications.length}
            </div>
          </div>
          <div style={{ width: '2rem', height: '2rem', borderRadius: 'var(--radius-sm)', background: 'rgba(245, 158, 11, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <AlertTriangle style={{ width: '1rem', height: '1rem', color: '#f59e0b' }} />
          </div>
        </div>

        {/* Recovered */}
        <div className="glass-panel" style={{ padding: '0.75rem 1rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <div style={{ fontSize: '0.6875rem', fontWeight: 500, color: 'var(--text-muted)' }}>Recovered</div>
            <div style={{ fontSize: '1.25rem', fontWeight: 700, color: '#10b981', marginTop: '0.125rem' }}>
              {analytics?.recovered_students_count || recoveryNotifications.length}
            </div>
          </div>
          <div style={{ width: '2rem', height: '2rem', borderRadius: 'var(--radius-sm)', background: 'rgba(16, 185, 129, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <TrendingUp style={{ width: '1rem', height: '1rem', color: '#10b981' }} />
          </div>
        </div>

        {/* Pending Alerts */}
        <div className="glass-panel" style={{ padding: '0.75rem 1rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <div style={{ fontSize: '0.6875rem', fontWeight: 500, color: 'var(--text-muted)' }}>Unread Alerts</div>
            <div style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--primary)', marginTop: '0.125rem' }}>
              {analytics?.unread_count || 0}
            </div>
          </div>
          <div style={{ width: '2rem', height: '2rem', borderRadius: 'var(--radius-sm)', background: 'rgba(99, 102, 241, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Bell style={{ width: '1rem', height: '1rem', color: 'var(--primary)' }} />
          </div>
        </div>
      </div>

      {/* Main Grid: Critical & Near Threshold Panels */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }} className="form-row">
        {/* Section 1: Critical Early Warning Alerts */}
        <div className="glass-panel" style={{ padding: '1rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.625rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
              <ShieldAlert style={{ width: '1rem', height: '1rem', color: '#f43f5e' }} />
              <h3 style={{ fontSize: '0.9375rem', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>
                Critical Defaulter Alerts ({criticalNotifications.length})
              </h3>
            </div>
            <button type="button" className="btn btn-secondary" onClick={onRefresh} style={{ padding: '0.25rem 0.5rem', fontSize: '0.6875rem', minHeight: '26px' }}>
              <RotateCcw style={{ width: '0.75rem', height: '0.75rem' }} />
            </button>
          </div>

          {criticalNotifications.length === 0 ? (
            <div style={{ padding: '1.5rem', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.8125rem' }}>
              No critical dropout alerts currently flagged.
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {criticalNotifications.map((n) => (
                <div
                  key={n.id}
                  style={{
                    padding: '0.75rem',
                    borderRadius: 'var(--radius-sm)',
                    background: 'rgba(244, 63, 94, 0.06)',
                    border: '1px solid rgba(244, 63, 94, 0.2)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.375rem',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <span style={{ fontWeight: 700, fontSize: '0.8125rem', color: 'var(--text-primary)' }}>
                      {n.student_name} <span style={{ color: 'var(--text-muted)', fontWeight: 500 }}>({n.class_section})</span>
                    </span>
                    <span className="badge badge-warning">Critical</span>
                  </div>

                  <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                    {n.message}
                  </div>

                  {n.recommendation && (
                    <div style={{ fontSize: '0.6875rem', color: '#fda4af', background: 'rgba(244, 63, 94, 0.1)', padding: '0.25rem 0.5rem', borderRadius: '4px' }}>
                      💡 {n.recommendation}
                    </div>
                  )}

                  {n.student_id && (
                    <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '0.25rem' }}>
                      <button
                        type="button"
                        className="btn btn-secondary"
                        onClick={() => onSelectStudent(n.student_id!, n.student_name || 'Student', n.student_code || '', n.class_section || '')}
                        style={{ padding: '0.25rem 0.5rem', fontSize: '0.6875rem', minHeight: '26px' }}
                      >
                        <ExternalLink style={{ width: '0.6875rem', height: '0.6875rem', color: 'var(--primary)' }} />
                        Inspect Student Profile
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Section 2: Approaching Threshold Warnings */}
        <div className="glass-panel" style={{ padding: '1rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.625rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
              <AlertTriangle style={{ width: '1rem', height: '1rem', color: '#f59e0b' }} />
              <h3 style={{ fontSize: '0.9375rem', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>
                Students Near Threshold ({warningNotifications.length})
              </h3>
            </div>
          </div>

          {warningNotifications.length === 0 ? (
            <div style={{ padding: '1.5rem', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.8125rem' }}>
              No students currently 1 absence away from threshold.
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {warningNotifications.map((n) => (
                <div
                  key={n.id}
                  style={{
                    padding: '0.75rem',
                    borderRadius: 'var(--radius-sm)',
                    background: 'rgba(245, 158, 11, 0.06)',
                    border: '1px solid rgba(245, 158, 11, 0.2)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.375rem',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <span style={{ fontWeight: 700, fontSize: '0.8125rem', color: 'var(--text-primary)' }}>
                      {n.student_name} <span style={{ color: 'var(--text-muted)', fontWeight: 500 }}>({n.class_section})</span>
                    </span>
                    <span className="badge badge-excused">Near Risk</span>
                  </div>

                  <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                    {n.message}
                  </div>

                  {n.student_id && (
                    <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '0.25rem' }}>
                      <button
                        type="button"
                        className="btn btn-secondary"
                        onClick={() => onSelectStudent(n.student_id!, n.student_name || 'Student', n.student_code || '', n.class_section || '')}
                        style={{ padding: '0.25rem 0.5rem', fontSize: '0.6875rem', minHeight: '26px' }}
                      >
                        <ExternalLink style={{ width: '0.6875rem', height: '0.6875rem', color: 'var(--primary)' }} />
                        Inspect Student Profile
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Section 3: Recovered Students Progress */}
      {recoveryNotifications.length > 0 && (
        <div className="glass-panel" style={{ padding: '1rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.625rem' }}>
            <TrendingUp style={{ width: '1rem', height: '1rem', color: '#10b981' }} />
            <h3 style={{ fontSize: '0.9375rem', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>
              Recently Recovered Students ({recoveryNotifications.length})
            </h3>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.5rem' }} className="form-row">
            {recoveryNotifications.map((n) => (
              <div
                key={n.id}
                style={{
                  padding: '0.625rem 0.75rem',
                  borderRadius: 'var(--radius-sm)',
                  background: 'rgba(16, 185, 129, 0.06)',
                  border: '1px solid rgba(16, 185, 129, 0.2)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}
              >
                <div>
                  <div style={{ fontWeight: 600, fontSize: '0.8125rem', color: 'var(--text-primary)' }}>
                    {n.student_name} <span style={{ color: 'var(--text-muted)' }}>({n.class_section})</span>
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '0.125rem' }}>
                    {n.message}
                  </div>
                </div>

                <span className="badge badge-present" style={{ gap: '0.25rem', flexShrink: 0 }}>
                  <CheckCircle2 style={{ width: '0.75rem', height: '0.75rem' }} />
                  Recovered
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
