import React, { useState, useEffect } from 'react';
import { X, Loader2, AlertTriangle, RefreshCw, Edit2 } from 'lucide-react';
import { AttendanceRecord, StudentSummary, fetchStudentSummary } from '../api/client';

interface StudentDetailDrawerProps {
  studentId: string | null;
  studentName: string;
  studentCode: string;
  classSection: string;
  records: AttendanceRecord[];
  onClose: () => void;
  onEditRecord: (record: AttendanceRecord) => void;
}

type DrawerState = 'loading' | 'error' | 'success';

export const StudentDetailDrawer: React.FC<StudentDetailDrawerProps> = ({
  studentId,
  studentName,
  studentCode,
  classSection,
  records,
  onClose,
  onEditRecord,
}) => {
  const [summary, setSummary] = useState<StudentSummary | null>(null);
  const [drawerState, setDrawerState] = useState<DrawerState>('loading');
  const [errorMessage, setErrorMessage] = useState('');

  const isOpen = studentId !== null;

  useEffect(() => {
    if (!studentId) {
      setSummary(null);
      return;
    }

    let cancelled = false;
    const loadSummary = async () => {
      setDrawerState('loading');
      setErrorMessage('');
      try {
        const data = await fetchStudentSummary(studentId);
        if (!cancelled) {
          setSummary(data);
          setDrawerState('success');
        }
      } catch (err: unknown) {
        if (!cancelled) {
          const msg = err instanceof Error ? err.message : 'Failed to load student summary';
          setErrorMessage(msg);
          setDrawerState('error');
        }
      }
    };

    loadSummary();
    return () => { cancelled = true; };
  }, [studentId]);

  // Filter records for this student
  const studentRecords = records.filter((r) => r.student_id === studentId);

  const handleRetry = () => {
    if (studentId) {
      setDrawerState('loading');
      fetchStudentSummary(studentId)
        .then((data) => {
          setSummary(data);
          setDrawerState('success');
        })
        .catch((err: unknown) => {
          const msg = err instanceof Error ? err.message : 'Failed to load student summary';
          setErrorMessage(msg);
          setDrawerState('error');
        });
    }
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Mobile backdrop */}
      <div className="drawer-backdrop" onClick={onClose} />

      <aside className="student-drawer" role="complementary" aria-label="Student details">
        {/* Drawer Header */}
        <div className="drawer-header">
          <div>
            <h3 className="drawer-student-name">{studentName}</h3>
            <div className="drawer-student-meta">
              <span>{studentCode}</span>
              <span className="drawer-meta-separator">·</span>
              <span>{classSection}</span>
            </div>
          </div>
          <button
            className="btn btn-secondary drawer-close-btn"
            onClick={onClose}
            type="button"
            aria-label="Close student details"
          >
            <X style={{ width: '1rem', height: '1rem' }} />
          </button>
        </div>

        {/* Drawer Body */}
        <div className="drawer-body">
          {/* Loading State */}
          {drawerState === 'loading' && (
            <div className="drawer-state-container">
              <Loader2 style={{ width: '1.5rem', height: '1.5rem', color: 'var(--primary)', animation: 'spin 1s linear infinite' }} />
              <span style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>Loading summary…</span>
            </div>
          )}

          {/* Error State */}
          {drawerState === 'error' && (
            <div className="drawer-state-container">
              <AlertTriangle style={{ width: '1.25rem', height: '1.25rem', color: '#ef4444' }} />
              <span style={{ fontSize: '0.8125rem', color: '#fca5a5' }}>{errorMessage}</span>
              <button className="btn btn-primary" onClick={handleRetry} style={{ marginTop: '0.5rem', fontSize: '0.75rem', padding: '0.375rem 0.75rem' }}>
                <RefreshCw style={{ width: '0.875rem', height: '0.875rem' }} />
                Retry
              </button>
            </div>
          )}

          {/* Success State — Summary Card */}
          {drawerState === 'success' && summary && (
            <>
              {/* At-Risk Banner */}
              {summary.is_defaulter && (
                <div className="drawer-risk-banner">
                  <AlertTriangle style={{ width: '0.875rem', height: '0.875rem', flexShrink: 0 }} />
                  <span>{summary.warning_reason || 'At-risk: excessive absences in the last 30 days'}</span>
                </div>
              )}

              {/* 30-Day Summary Grid */}
              <div className="drawer-summary-grid">
                <div className="drawer-stat">
                  <span className="drawer-stat-value">{summary.total_days}</span>
                  <span className="drawer-stat-label">Total Days</span>
                </div>
                <div className="drawer-stat">
                  <span className="drawer-stat-value" style={{ color: 'var(--present)' }}>{summary.present_count}</span>
                  <span className="drawer-stat-label">Present</span>
                </div>
                <div className="drawer-stat">
                  <span className="drawer-stat-value" style={{ color: 'var(--absent)' }}>{summary.absent_count}</span>
                  <span className="drawer-stat-label">Absent</span>
                </div>
                <div className="drawer-stat">
                  <span className="drawer-stat-value" style={{ color: 'var(--excused)' }}>{summary.excused_count}</span>
                  <span className="drawer-stat-label">Excused</span>
                </div>
              </div>

              {/* Key Metrics */}
              <div className="drawer-metrics">
                <div className="drawer-metric-row">
                  <span className="drawer-metric-label">30-Day Absences</span>
                  <span className="drawer-metric-value" style={{ color: summary.last_30_days_absent >= summary.threshold_applied ? 'var(--absent)' : 'var(--text-primary)' }}>
                    {summary.last_30_days_absent} / {summary.threshold_applied}
                  </span>
                </div>
                <div className="drawer-metric-row">
                  <span className="drawer-metric-label">Attendance Rate</span>
                  <span className="drawer-metric-value">
                    {summary.total_days > 0
                      ? `${((summary.present_count / summary.total_days) * 100).toFixed(1)}%`
                      : '—'}
                  </span>
                </div>
                <div className="drawer-metric-row">
                  <span className="drawer-metric-label">Status</span>
                  <span className={`badge ${summary.is_defaulter ? 'badge-warning' : 'badge-present'}`}>
                    {summary.is_defaulter ? 'At-Risk' : 'Normal'}
                  </span>
                </div>
              </div>

              {/* Recent History */}
              <div className="drawer-history-section">
                <h4 className="drawer-section-title">Recent Records</h4>
                {studentRecords.length === 0 ? (
                  <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', padding: '0.5rem 0' }}>
                    No records in the current view.
                  </p>
                ) : (
                  <div className="drawer-history-list">
                    {studentRecords.slice(0, 10).map((rec) => (
                      <div key={rec.id} className="drawer-history-item">
                        <div className="drawer-history-date">{rec.date}</div>
                        <span className={`badge badge-${rec.status}`}>{rec.status}</span>
                        <button
                          className="btn btn-secondary drawer-edit-btn"
                          onClick={() => onEditRecord(rec)}
                          type="button"
                          aria-label={`Edit record for ${rec.date}`}
                        >
                          <Edit2 style={{ width: '0.75rem', height: '0.75rem' }} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </aside>
    </>
  );
};
