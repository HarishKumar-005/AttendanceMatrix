import React from 'react';
import { AttendanceStatus, StudentRosterEntry } from '../api/client';

interface StudentRosterProps {
  roster: StudentRosterEntry[];
  focusedIndex: number;
  selectedStudentId: string | null;
  onStatusToggle: (studentId: string, status: AttendanceStatus) => void;
  onStudentClick: (studentId: string, studentName: string, studentCode: string, classSection: string) => void;
  onFocusRow: (index: number) => void;
}

export const StudentRoster: React.FC<StudentRosterProps> = ({
  roster,
  focusedIndex,
  selectedStudentId,
  onStatusToggle,
  onStudentClick,
  onFocusRow,
}) => {
  return (
    <div className="glass-panel" style={{ overflow: 'hidden' }}>
      {/* Desktop & Tablet High-Density Table View (≥ 641px) */}
      <div className="roster-table-view" style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.875rem' }}>
          <thead>
            <tr style={{
              background: 'rgba(15, 23, 42, 0.9)',
              borderBottom: '1px solid var(--border-color)',
              color: 'var(--text-secondary)',
              fontSize: '0.75rem',
              letterSpacing: '0.05em',
              fontWeight: 700
            }}>
              <th style={{ padding: '0.75rem 1rem', width: '3rem' }}>#</th>
              <th style={{ padding: '0.75rem 1rem' }}>Student Details</th>
              <th style={{ padding: '0.75rem 1rem' }}>Code</th>
              <th style={{ padding: '0.75rem 1rem' }}>30-Day Risk</th>
              <th style={{ padding: '0.75rem 1rem', textAlign: 'right', width: '18rem' }}>Attendance Status</th>
            </tr>
          </thead>
          <tbody>
            {roster.map((student, idx) => {
              const isFocused = idx === focusedIndex;
              const isSelected = student.student_id === selectedStudentId;

              return (
                <tr
                  key={student.student_id}
                  className={`table-row-hover ${student.is_defaulter ? 'table-row-defaulter' : ''} ${isSelected ? 'row-selected' : ''}`}
                  style={{
                    borderBottom: '1px solid var(--border-color)',
                    outline: isFocused ? '2px solid var(--primary)' : 'none',
                    outlineOffset: '-2px',
                    cursor: 'pointer',
                  }}
                  onClick={() => {
                    onFocusRow(idx);
                    onStudentClick(student.student_id, student.student_name, student.student_code, student.class_section);
                  }}
                >
                  {/* Index */}
                  <td style={{ padding: '0.625rem 1rem', fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>
                    {idx + 1}
                  </td>

                  {/* Student Details */}
                  <td style={{ padding: '0.625rem 1rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
                      <div style={{
                        width: '1.75rem',
                        height: '1.75rem',
                        borderRadius: '50%',
                        backgroundColor: isSelected ? 'rgba(99, 102, 241, 0.3)' : 'rgba(99, 102, 241, 0.15)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'var(--primary)',
                        fontWeight: 700,
                        fontSize: '0.6875rem'
                      }}>
                        {student.student_name.slice(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <div style={{ fontWeight: 600, fontSize: '0.8125rem', color: 'var(--text-primary)' }}>
                          {student.student_name}
                        </div>
                      </div>
                    </div>
                  </td>

                  {/* Code */}
                  <td style={{ padding: '0.625rem 1rem', fontSize: '0.8125rem', color: 'var(--text-secondary)', fontWeight: 500 }}>
                    {student.student_code}
                  </td>

                  {/* Risk */}
                  <td style={{ padding: '0.625rem 1rem' }}>
                    {student.is_defaulter ? (
                      <span className="badge badge-warning">At-Risk</span>
                    ) : (
                      <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>—</span>
                    )}
                  </td>

                  {/* Segmented Status Toggle Control */}
                  <td style={{ padding: '0.625rem 1rem', textAlign: 'right' }} onClick={(e) => e.stopPropagation()}>
                    <div className="status-toggle-group">
                      <button
                        type="button"
                        className={`status-toggle-btn toggle-present ${student.status === 'present' ? 'active' : ''}`}
                        onClick={() => onStatusToggle(student.student_id, 'present')}
                        title="Mark Present (Hotkey: P or 1)"
                      >
                        Present
                      </button>

                      <button
                        type="button"
                        className={`status-toggle-btn toggle-absent ${student.status === 'absent' ? 'active' : ''}`}
                        onClick={() => onStatusToggle(student.student_id, 'absent')}
                        title="Mark Absent (Hotkey: A or 2)"
                      >
                        Absent
                      </button>

                      <button
                        type="button"
                        className={`status-toggle-btn toggle-excused ${student.status === 'excused' ? 'active' : ''}`}
                        onClick={() => onStatusToggle(student.student_id, 'excused')}
                        title="Mark Excused (Hotkey: E or 3)"
                      >
                        Excused
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Mobile Card List View (≤ 640px) */}
      <div className="roster-mobile-card-list">
        {roster.map((student, idx) => {
          const isSelected = student.student_id === selectedStudentId;

          return (
            <div
              key={student.student_id}
              className={`roster-mobile-card ${student.is_defaulter ? 'table-row-defaulter' : ''} ${isSelected ? 'row-selected' : ''}`}
              onClick={() => {
                onFocusRow(idx);
                onStudentClick(student.student_id, student.student_name, student.student_code, student.class_section);
              }}
            >
              {/* Header: Index, Avatar, Name, Code, Risk */}
              <div className="roster-mobile-card-header">
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600, width: '1.25rem' }}>
                    #{idx + 1}
                  </span>
                  <div style={{
                    width: '2rem',
                    height: '2rem',
                    borderRadius: '50%',
                    backgroundColor: isSelected ? 'rgba(99, 102, 241, 0.3)' : 'rgba(99, 102, 241, 0.15)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'var(--primary)',
                    fontWeight: 700,
                    fontSize: '0.75rem',
                    flexShrink: 0
                  }}>
                    {student.student_name.slice(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: '0.875rem', color: 'var(--text-primary)' }}>
                      {student.student_name}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      {student.student_code}
                    </div>
                  </div>
                </div>

                {student.is_defaulter && (
                  <span className="badge badge-warning">At-Risk</span>
                )}
              </div>

              {/* Status Segmented Buttons for Mobile */}
              <div style={{ marginTop: '0.625rem' }} onClick={(e) => e.stopPropagation()}>
                <div className="status-toggle-group" style={{ width: '100%', display: 'flex' }}>
                  <button
                    type="button"
                    className={`status-toggle-btn toggle-present ${student.status === 'present' ? 'active' : ''}`}
                    onClick={() => onStatusToggle(student.student_id, 'present')}
                    style={{ flex: 1, minHeight: '40px' }}
                  >
                    Present
                  </button>

                  <button
                    type="button"
                    className={`status-toggle-btn toggle-absent ${student.status === 'absent' ? 'active' : ''}`}
                    onClick={() => onStatusToggle(student.student_id, 'absent')}
                    style={{ flex: 1, minHeight: '40px' }}
                  >
                    Absent
                  </button>

                  <button
                    type="button"
                    className={`status-toggle-btn toggle-excused ${student.status === 'excused' ? 'active' : ''}`}
                    onClick={() => onStatusToggle(student.student_id, 'excused')}
                    style={{ flex: 1, minHeight: '40px' }}
                  >
                    Excused
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
