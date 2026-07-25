export type AttendanceStatus = 'present' | 'absent' | 'excused';

export interface AttendanceRecord {
  id: string;
  record_code: string;
  student_id: string;
  student_name_snapshot: string;
  class_section: string;
  attendance_date: string;
  status: AttendanceStatus;
  reason?: string | null;
  marked_by?: string | null;
  source: 'manual' | 'seed' | 'import';
  created_at: string;
  updated_at: string;
}

export interface StudentSummary {
  student_id: string;
  student_name: string;
  class_section: string;
  total_records_30_days: number;
  absences_last_30_days: number;
  attendance_percentage: number | null;
  is_defaulter: boolean;
  warning_reason: string;
  last_evaluated_at: string;
}
