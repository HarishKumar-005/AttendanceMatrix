import React from 'react';
import { CheckCircle2, UserCheck, AlertTriangle } from 'lucide-react';
import { SessionLifecycle } from '../api/client';

interface AttendanceSessionBarProps {
  classSection: string;
  sessionDate: string;
  totalEnrolled: number;
  presentCount: number;
  absentCount: number;
  excusedCount: number;
  sessionState: SessionLifecycle;
  onMarkAllPresent: () => void;
}

export const AttendanceSessionBar: React.FC<AttendanceSessionBarProps> = ({
  classSection,
  totalEnrolled,
  presentCount,
  absentCount,
  excusedCount,
  sessionState,
  onMarkAllPresent,
}) => {
  return (
    <div
      className="session-bar-container"
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '0.75rem',
        padding: '0.75rem 1rem',
        marginBottom: '0.75rem',
        backgroundColor: 'rgba(15, 23, 42, 0.6)',
        borderRadius: 'var(--radius-md)',
        border: '1px solid var(--border-color)',
      }}
    >
      {/* Enrolled & Status Breakdown */}
      <div className="session-bar-roster" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
        <div>
          <span style={{ fontSize: '0.6875rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            Class Roster
          </span>
          <div style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)' }}>
            {classSection} <span style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', fontWeight: 500 }}>({totalEnrolled} Enrolled)</span>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', flexWrap: 'wrap' }}>
          <span className="badge badge-present">{presentCount} Present</span>
          <span className="badge badge-absent">{absentCount} Absent</span>
          {excusedCount > 0 && <span className="badge badge-excused">{excusedCount} Excused</span>}
        </div>
      </div>

      {/* Session State Badge & Quick Actions */}
      <div className="session-bar-actions" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
        {sessionState === 'draft' && (
          <span className="badge badge-warning" style={{ gap: '0.375rem' }}>
            <AlertTriangle style={{ width: '0.75rem', height: '0.75rem' }} />
            Unsaved Draft
          </span>
        )}

        {sessionState === 'saved' && (
          <span className="badge badge-present" style={{ gap: '0.375rem' }}>
            <CheckCircle2 style={{ width: '0.75rem', height: '0.75rem' }} />
            Saved
          </span>
        )}

        <button
          type="button"
          className="btn btn-secondary mark-all-present-btn"
          onClick={onMarkAllPresent}
          style={{ padding: '0.375rem 0.625rem', fontSize: '0.75rem' }}
          title="Set all student statuses in roster to Present"
        >
          <UserCheck style={{ width: '0.875rem', height: '0.875rem', color: 'var(--present)', flexShrink: 0 }} />
          Mark All Present
        </button>
      </div>
    </div>
  );
};
