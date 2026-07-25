import React, { useState, useEffect } from 'react';
import { X, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import { AttendanceRecord, AttendanceStatus, CreateRecordPayload } from '../api/client';

interface AttendanceFormProps {
  isOpen: boolean;
  record?: AttendanceRecord | null;
  onClose: () => void;
  onSubmit: (data: CreateRecordPayload) => Promise<void>;
}

export const AttendanceForm: React.FC<AttendanceFormProps> = ({
  isOpen,
  record,
  onClose,
  onSubmit,
}) => {
  const isEditing = Boolean(record);

  const [studentName, setStudentName] = useState('');
  const [studentCode, setStudentCode] = useState('');
  const [classSection, setClassSection] = useState('Class 9-A');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [status, setStatus] = useState<AttendanceStatus>('present');
  const [remarks, setRemarks] = useState('');

  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [serverError, setServerError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (record) {
      setStudentName(record.student_name);
      setStudentCode(record.student_code);
      setClassSection(record.class_section);
      setDate(record.date);
      setStatus(record.status);
      setRemarks(record.remarks || '');
    } else {
      setStudentName('');
      setStudentCode('');
      setClassSection('Class 9-A');
      setDate(new Date().toISOString().split('T')[0]);
      setStatus('present');
      setRemarks('');
    }
    setFieldErrors({});
    setServerError(null);
  }, [record, isOpen]);

  if (!isOpen) return null;

  const validate = (): boolean => {
    const errors: Record<string, string> = {};
    if (!studentName.trim()) errors.studentName = 'Student Name is required';
    if (!studentCode.trim()) errors.studentCode = 'Student Code is required (e.g. STU-101)';
    if (!classSection) errors.classSection = 'Class Section is required';
    if (!date) errors.date = 'Attendance Date is required';
    if (!status) errors.status = 'Attendance Status is required';

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setServerError(null);

    if (!validate()) return;

    setIsSubmitting(true);
    try {
      await onSubmit({
        student_name: studentName.trim(),
        student_code: studentCode.trim(),
        class_section: classSection,
        date,
        status,
        remarks: remarks.trim() || undefined,
      });
      onClose();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to save attendance record';
      setServerError(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div
        className="glass-panel"
        style={{
          width: '100%',
          maxWidth: '540px',
          padding: '2rem',
          position: 'relative',
          backgroundColor: 'var(--bg-card-solid)',
          boxShadow: '0 20px 50px rgba(0,0,0,0.6)'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
          <div>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-primary)' }}>
              {isEditing ? `Edit Attendance Record (${record?.record_code})` : 'Record New Attendance'}
            </h2>
            <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>
              {isEditing
                ? 'Updating record will trigger backend 30-day risk recalculation'
                : 'Enter daily attendance entry for early-warning tracking'}
            </p>
          </div>
          <button
            className="btn btn-secondary"
            onClick={onClose}
            style={{ padding: '0.375rem', borderRadius: '50%' }}
            type="button"
          >
            <X style={{ width: '1.25rem', height: '1.25rem' }} />
          </button>
        </div>

        {/* Server Error Alert */}
        {serverError && (
          <div style={{
            background: 'rgba(239, 68, 68, 0.12)',
            border: '1px solid rgba(239, 68, 68, 0.3)',
            borderRadius: 'var(--radius-sm)',
            padding: '0.75rem 1rem',
            marginBottom: '1.25rem',
            display: 'flex',
            alignItems: 'flex-start',
            gap: '0.625rem',
            color: '#fca5a5',
            fontSize: '0.8125rem'
          }}>
            <AlertCircle style={{ width: '1rem', height: '1rem', flexShrink: 0, marginTop: '0.125rem' }} />
            <div>{serverError}</div>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {/* Student Name */}
          <div>
            <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.375rem' }}>
              STUDENT NAME *
            </label>
            <input
              type="text"
              className="input-control"
              placeholder="e.g. Rahul Kumar"
              value={studentName}
              onChange={(e) => setStudentName(e.target.value)}
            />
            {fieldErrors.studentName && (
              <span style={{ fontSize: '0.75rem', color: '#ef4444', marginTop: '0.25rem', display: 'block' }}>
                {fieldErrors.studentName}
              </span>
            )}
          </div>

          {/* Student Code & Class Section */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.375rem' }}>
                STUDENT CODE *
              </label>
              <input
                type="text"
                className="input-control"
                placeholder="e.g. STU-101"
                value={studentCode}
                onChange={(e) => setStudentCode(e.target.value)}
              />
              {fieldErrors.studentCode && (
                <span style={{ fontSize: '0.75rem', color: '#ef4444', marginTop: '0.25rem', display: 'block' }}>
                  {fieldErrors.studentCode}
                </span>
              )}
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.375rem' }}>
                CLASS SECTION *
              </label>
              <select
                className="input-control"
                value={classSection}
                onChange={(e) => setClassSection(e.target.value)}
              >
                <option value="Class 9-A">Class 9-A</option>
                <option value="Class 9-B">Class 9-B</option>
                <option value="Class 10-A">Class 10-A</option>
                <option value="Class 10-B">Class 10-B</option>
                <option value="Class 11-A">Class 11-A</option>
                <option value="Class 12-A">Class 12-A</option>
              </select>
            </div>
          </div>

          {/* Date & Status */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.375rem' }}>
                ATTENDANCE DATE *
              </label>
              <input
                type="date"
                className="input-control"
                value={date}
                onChange={(e) => setDate(e.target.value)}
              />
              {fieldErrors.date && (
                <span style={{ fontSize: '0.75rem', color: '#ef4444', marginTop: '0.25rem', display: 'block' }}>
                  {fieldErrors.date}
                </span>
              )}
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.375rem' }}>
                STATUS *
              </label>
              <select
                className="input-control"
                value={status}
                onChange={(e) => setStatus(e.target.value as AttendanceStatus)}
              >
                <option value="present">Present</option>
                <option value="absent">Absent</option>
                <option value="excused">Excused</option>
              </select>
            </div>
          </div>

          {/* Remarks */}
          <div>
            <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.375rem' }}>
              REMARKS / REASON (OPTIONAL)
            </label>
            <textarea
              className="input-control"
              rows={3}
              placeholder="e.g. Medical leave slip provided, or unexcused absence..."
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
            />
          </div>

          {/* Footer Actions */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.5rem' }}>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={onClose}
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 style={{ width: '1rem', height: '1rem', animation: 'spin 1s linear infinite' }} />
                  Saving...
                </>
              ) : (
                <>
                  <CheckCircle2 style={{ width: '1rem', height: '1rem' }} />
                  {isEditing ? 'Update Record' : 'Save Attendance'}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
