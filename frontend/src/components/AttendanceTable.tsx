import React from 'react';
import { Edit2 } from 'lucide-react';
import { AttendanceRecord } from '../api/client';

interface AttendanceTableProps {
  records: AttendanceRecord[];
  selectedStudentId: string | null;
  onEditRecord: (record: AttendanceRecord) => void;
  onStudentClick: (record: AttendanceRecord) => void;
}

export const AttendanceTable: React.FC<AttendanceTableProps> = ({
  records,
  selectedStudentId,
  onEditRecord,
  onStudentClick,
}) => {
  const getStatusBadge = (status: AttendanceRecord['status']) => {
    switch (status) {
      case 'present':
        return <span className="badge badge-present">Present</span>;
      case 'absent':
        return <span className="badge badge-absent">Absent</span>;
      case 'excused':
        return <span className="badge badge-excused">Excused</span>;
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
              fontSize: '0.75rem',
              letterSpacing: '0.05em',
              fontWeight: 700
            }}>
              <th style={{ padding: '0.75rem 1rem' }}>Code</th>
              <th style={{ padding: '0.75rem 1rem' }}>Student</th>
              <th style={{ padding: '0.75rem 1rem' }}>Class</th>
              <th style={{ padding: '0.75rem 1rem' }}>Date</th>
              <th style={{ padding: '0.75rem 1rem' }}>Status</th>
              <th style={{ padding: '0.75rem 1rem' }}>Risk</th>
              <th style={{ padding: '0.75rem 1rem', textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {records.map((record) => {
              const isSelected = record.student_id === selectedStudentId;
              return (
                <tr
                  key={record.id}
                  className={`table-row-hover ${record.is_defaulter ? 'table-row-defaulter' : ''} ${isSelected ? 'row-selected' : ''}`}
                  style={{
                    borderBottom: '1px solid var(--border-color)',
                    cursor: 'pointer',
                  }}
                  onClick={() => onStudentClick(record)}
                >
                  {/* Record Code */}
                  <td style={{ padding: '0.625rem 1rem', fontWeight: 500, color: 'var(--text-secondary)', fontSize: '0.8125rem' }}>
                    {record.record_code}
                  </td>

                  {/* Student Details */}
                  <td style={{ padding: '0.625rem 1rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
                      <div style={{
                        width: '1.75rem',
                        height: '1.75rem',
                        borderRadius: '50%',
                        backgroundColor: isSelected ? 'rgba(99, 102, 241, 0.25)' : 'rgba(99, 102, 241, 0.15)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'var(--primary)',
                        fontWeight: 700,
                        fontSize: '0.6875rem'
                      }}>
                        {record.student_name.slice(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <div style={{ fontWeight: 600, fontSize: '0.8125rem', color: 'var(--text-primary)' }}>
                          {record.student_name}
                        </div>
                        <div style={{ fontSize: '0.6875rem', color: 'var(--text-muted)' }}>
                          {record.student_code}
                        </div>
                      </div>
                    </div>
                  </td>

                  {/* Class */}
                  <td style={{ padding: '0.625rem 1rem', color: 'var(--text-secondary)', fontWeight: 500 }}>
                    {record.class_section}
                  </td>

                  {/* Date */}
                  <td style={{ padding: '0.625rem 1rem', color: 'var(--text-secondary)', fontSize: '0.8125rem' }}>
                    {record.date}
                  </td>

                  {/* Status */}
                  <td style={{ padding: '0.625rem 1rem' }}>
                    {getStatusBadge(record.status)}
                  </td>

                  {/* Early-Warning Risk */}
                  <td style={{ padding: '0.625rem 1rem' }}>
                    {record.is_defaulter ? (
                      <span className="badge badge-warning">At-Risk</span>
                    ) : (
                      <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>—</span>
                    )}
                  </td>

                  {/* Actions */}
                  <td style={{ padding: '0.625rem 1rem', textAlign: 'right' }}>
                    <button
                      className="btn btn-secondary"
                      onClick={(e) => {
                        e.stopPropagation();
                        onEditRecord(record);
                      }}
                      style={{ padding: '0.375rem 0.75rem', fontSize: '0.8125rem' }}
                    >
                      <Edit2 style={{ width: '0.875rem', height: '0.875rem' }} />
                      Edit
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
