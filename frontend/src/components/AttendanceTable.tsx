import React from 'react';
import { Edit2, AlertTriangle, CheckCircle2, XCircle, Clock, Calendar, User, Tag } from 'lucide-react';
import { AttendanceRecord } from '../api/client';

interface AttendanceTableProps {
  records: AttendanceRecord[];
  onEditRecord: (record: AttendanceRecord) => void;
}

export const AttendanceTable: React.FC<AttendanceTableProps> = ({
  records,
  onEditRecord,
}) => {
  const getStatusBadge = (status: AttendanceRecord['status']) => {
    switch (status) {
      case 'present':
        return (
          <span className="badge badge-present">
            <CheckCircle2 style={{ width: '0.875rem', height: '0.875rem' }} />
            Present
          </span>
        );
      case 'absent':
        return (
          <span className="badge badge-absent">
            <XCircle style={{ width: '0.875rem', height: '0.875rem' }} />
            Absent
          </span>
        );
      case 'excused':
        return (
          <span className="badge badge-excused">
            <Clock style={{ width: '0.875rem', height: '0.875rem' }} />
            Excused
          </span>
        );
    }
  };

  return (
    <div className="glass-panel" style={{ overflow: 'hidden' }}>
      {/* Desktop Table View */}
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.875rem' }}>
          <thead>
            <tr style={{
              background: 'rgba(15, 23, 42, 0.9)',
              borderBottom: '1px solid var(--border-color)',
              color: 'var(--text-secondary)',
              textTransform: 'uppercase',
              fontSize: '0.75rem',
              letterSpacing: '0.05em',
              fontWeight: 700
            }}>
              <th style={{ padding: '1rem 1.25rem' }}>Record Code</th>
              <th style={{ padding: '1rem 1.25rem' }}>Student Details</th>
              <th style={{ padding: '1rem 1.25rem' }}>Class</th>
              <th style={{ padding: '1rem 1.25rem' }}>Date</th>
              <th style={{ padding: '1rem 1.25rem' }}>Status</th>
              <th style={{ padding: '1rem 1.25rem' }}>Early-Warning Risk</th>
              <th style={{ padding: '1rem 1.25rem', textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {records.map((record) => (
              <tr
                key={record.id}
                style={{
                  borderBottom: '1px solid var(--border-color)',
                  transition: 'background-color 0.15s ease',
                  backgroundColor: record.is_defaulter ? 'rgba(244, 63, 94, 0.03)' : 'transparent',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = record.is_defaulter
                    ? 'rgba(244, 63, 94, 0.08)'
                    : 'rgba(255, 255, 255, 0.03)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = record.is_defaulter
                    ? 'rgba(244, 63, 94, 0.03)'
                    : 'transparent';
                }}
              >
                {/* Record Code */}
                <td style={{ padding: '0.875rem 1.25rem', fontWeight: 600, color: 'var(--primary)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
                    <Tag style={{ width: '0.875rem', height: '0.875rem', color: 'var(--text-muted)' }} />
                    {record.record_code}
                  </div>
                </td>

                {/* Student Details */}
                <td style={{ padding: '0.875rem 1.25rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
                    <div style={{
                      width: '2.25rem',
                      height: '2.25rem',
                      borderRadius: '50%',
                      backgroundColor: 'rgba(99, 102, 241, 0.15)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'var(--primary)',
                      fontWeight: 700,
                      fontSize: '0.8125rem'
                    }}>
                      {record.student_name.slice(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
                        {record.student_name}
                      </div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                        <User style={{ width: '0.75rem', height: '0.75rem' }} />
                        {record.student_code}
                      </div>
                    </div>
                  </div>
                </td>

                {/* Class */}
                <td style={{ padding: '0.875rem 1.25rem', color: 'var(--text-secondary)', fontWeight: 500 }}>
                  {record.class_section}
                </td>

                {/* Date */}
                <td style={{ padding: '0.875rem 1.25rem', color: 'var(--text-secondary)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
                    <Calendar style={{ width: '0.875rem', height: '0.875rem', color: 'var(--text-muted)' }} />
                    {record.date}
                  </div>
                </td>

                {/* Status */}
                <td style={{ padding: '0.875rem 1.25rem' }}>
                  {getStatusBadge(record.status)}
                </td>

                {/* Early-Warning Risk */}
                <td style={{ padding: '0.875rem 1.25rem' }}>
                  {record.is_defaulter ? (
                    <span className="badge badge-warning" title="Flagged: Student has 5 or more absences in the last 30 days">
                      <AlertTriangle style={{ width: '0.875rem', height: '0.875rem' }} />
                      Dropout Warning Flag
                    </span>
                  ) : (
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      Normal Range
                    </span>
                  )}
                </td>

                {/* Actions */}
                <td style={{ padding: '0.875rem 1.25rem', textAlign: 'right' }}>
                  <button
                    className="btn btn-secondary"
                    onClick={() => onEditRecord(record)}
                    style={{ padding: '0.375rem 0.75rem', fontSize: '0.8125rem' }}
                  >
                    <Edit2 style={{ width: '0.875rem', height: '0.875rem' }} />
                    Edit
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
