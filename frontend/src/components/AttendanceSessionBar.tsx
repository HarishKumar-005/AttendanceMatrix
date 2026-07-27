import React, { useState, useEffect } from 'react';
import { CheckCircle2, UserCheck, AlertTriangle, Search, X } from 'lucide-react';
import { SessionLifecycle } from '../api/client';

interface AttendanceSessionBarProps {
  classSection: string;
  sessionDate: string;
  totalEnrolled: number;
  presentCount: number;
  absentCount: number;
  excusedCount: number;
  sessionState: SessionLifecycle;
  searchQuery?: string;
  onSearchChange?: (query: string) => void;
  onMarkAllPresent: () => void;
}

export const AttendanceSessionBar: React.FC<AttendanceSessionBarProps> = ({
  classSection,
  totalEnrolled,
  presentCount,
  absentCount,
  excusedCount,
  sessionState,
  searchQuery = '',
  onSearchChange,
  onMarkAllPresent,
}) => {
  const [localSearch, setLocalSearch] = useState(searchQuery);

  useEffect(() => {
    setLocalSearch(searchQuery);
  }, [searchQuery]);

  // Debounce search changes to prevent server spam
  useEffect(() => {
    if (!onSearchChange) return;
    const timer = setTimeout(() => {
      if (localSearch !== searchQuery) {
        onSearchChange(localSearch);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [localSearch, searchQuery, onSearchChange]);

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

      {/* Daily Register Server-Side Search Box */}
      <div style={{ position: 'relative', minWidth: '220px', flex: '1', maxWidth: '320px' }}>
        <Search
          style={{
            position: 'absolute',
            left: '0.625rem',
            top: '50%',
            transform: 'translateY(-50%)',
            width: '0.875rem',
            height: '0.875rem',
            color: 'var(--text-muted)',
            pointerEvents: 'none',
          }}
        />
        <input
          type="text"
          className="input-control"
          placeholder="Search student, code, or mobile..."
          value={localSearch}
          onChange={(e) => setLocalSearch(e.target.value)}
          style={{
            paddingLeft: '2rem',
            paddingRight: localSearch ? '2rem' : '0.75rem',
            fontSize: '0.8125rem',
            height: '2.125rem',
          }}
        />
        {localSearch && (
          <button
            type="button"
            onClick={() => {
              setLocalSearch('');
              if (onSearchChange) onSearchChange('');
            }}
            style={{
              position: 'absolute',
              right: '0.5rem',
              top: '50%',
              transform: 'translateY(-50%)',
              background: 'none',
              border: 'none',
              color: 'var(--text-muted)',
              cursor: 'pointer',
              padding: '0.125rem',
              display: 'flex',
              alignItems: 'center',
            }}
            title="Clear search"
          >
            <X style={{ width: '0.875rem', height: '0.875rem' }} />
          </button>
        )}
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
