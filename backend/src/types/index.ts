export type NotificationSeverity = 'critical' | 'warning' | 'recovery' | 'info';

export type NotificationType =
  | 'threshold_reached'
  | 'approaching_threshold'
  | 'recovered'
  | 'policy_updated';

export interface TeacherNotificationMetadata {
  absences_last_30_days?: number;
  threshold?: number;
  attendance_percentage?: number;
  previous_status?: string;
  new_status?: string;
  evaluation_date?: string;
  [key: string]: unknown;
}

export interface TeacherNotification {
  id: string;
  student_id: string | null;
  student_name: string | null;
  student_code: string | null;
  class_section: string | null;
  title: string;
  message: string;
  severity: NotificationSeverity;
  notification_type: NotificationType;
  is_read: boolean;
  is_dismissed: boolean;
  created_at: string;
  read_at: string | null;
  metadata: TeacherNotificationMetadata;
  triggered_by: string;
  recommendation: string | null;
}

export interface NotificationAnalytics {
  unread_count: number;
  critical_count: number;
  warning_count: number;
  recovery_count: number;
  total_active_alerts: number;
  students_near_threshold_count: number;
  recently_flagged_count: number;
  recovered_students_count: number;
}

export interface NotificationQueryInput {
  unread_only?: boolean;
  severity?: NotificationSeverity;
  page?: number;
  limit?: number;
}

export interface NotificationIdParamInput {
  id: string;
}

export type AttendanceStatus = 'present' | 'absent' | 'excused';

export interface Student {
  id: string;
  student_code: string;
  full_name: string;
  current_class_section: string;
  roll_number: string | null;
  guardian_name: string | null;
  guardian_phone: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface AttendanceRecord {
  id: string;
  record_code: string;
  student_id: string;
  student_name_snapshot: string;
  class_section: string;
  attendance_date: string;
  status: AttendanceStatus;
  reason: string | null;
  marked_by: string | null;
  source: 'manual' | 'seed' | 'import';
  created_at: string;
  updated_at: string;
}

export interface AttendancePolicy {
  id: number;
  absence_threshold: number;
  warning_window_days: number;
  minimum_attendance_percentage: number;
  active: boolean;
  updated_at: string;
}

export interface DefaulterLog {
  id: string;
  student_id: string;
  student_name_snapshot: string;
  class_section: string;
  policy_id: number;
  evaluation_date: string;
  window_start: string;
  window_end: string;
  window_days: number;
  absences_last_30_days: number;
  total_considered_days: number;
  attendance_percentage: number | null;
  threshold_absences: number;
  minimum_attendance_percentage: number | null;
  is_defaulter: boolean;
  warning_reason: string;
  source_record_id: string | null;
  evaluated_at: string;
}

export interface StudentSummary {
  student_id: string;
  student_name: string;
  student_code?: string;
  class_section: string;
  evaluation_date: string;
  window_start: string;
  window_end: string;
  window_days: number;
  absences_last_30_days: number;
  last_30_days_absent?: number;
  total_considered_days: number;
  total_days?: number;
  present_count?: number;
  absent_count?: number;
  excused_count?: number;
  attendance_percentage: number;
  absence_threshold: number;
  threshold_applied?: number;
  is_defaulter: boolean;
  warning_reason: string;
  evaluated_at: string;
}

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  public: {
    Tables: {
      students: {
        Row: {
          id: string;
          student_code: string;
          full_name: string;
          current_class_section: string;
          roll_number: string | null;
          guardian_name: string | null;
          guardian_phone: string | null;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          student_code: string;
          full_name: string;
          current_class_section: string;
          roll_number?: string | null;
          guardian_name?: string | null;
          guardian_phone?: string | null;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          student_code?: string;
          full_name?: string;
          current_class_section?: string;
          roll_number?: string | null;
          guardian_name?: string | null;
          guardian_phone?: string | null;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      attendance_records: {
        Row: {
          id: string;
          record_code: string;
          student_id: string;
          student_name_snapshot: string;
          class_section: string;
          attendance_date: string;
          status: AttendanceStatus;
          reason: string | null;
          marked_by: string | null;
          source: 'manual' | 'seed' | 'import';
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          record_code: string;
          student_id: string;
          student_name_snapshot: string;
          class_section: string;
          attendance_date: string;
          status: AttendanceStatus;
          reason?: string | null;
          marked_by?: string | null;
          source?: 'manual' | 'seed' | 'import';
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          record_code?: string;
          student_id?: string;
          student_name_snapshot?: string;
          class_section?: string;
          attendance_date?: string;
          status?: AttendanceStatus;
          reason?: string | null;
          marked_by?: string | null;
          source?: 'manual' | 'seed' | 'import';
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      attendance_policy: {
        Row: {
          id: number;
          absence_threshold: number;
          warning_window_days: number;
          minimum_attendance_percentage: number;
          active: boolean;
          updated_at: string;
        };
        Insert: {
          id?: number;
          absence_threshold?: number;
          warning_window_days?: number;
          minimum_attendance_percentage?: number;
          active?: boolean;
          updated_at?: string;
        };
        Update: {
          id?: number;
          absence_threshold?: number;
          warning_window_days?: number;
          minimum_attendance_percentage?: number;
          active?: boolean;
          updated_at?: string;
        };
        Relationships: [];
      };
      defaulter_logs: {
        Row: {
          id: string;
          student_id: string;
          student_name_snapshot: string;
          class_section: string;
          policy_id: number;
          evaluation_date: string;
          window_start: string;
          window_end: string;
          window_days: number;
          absences_last_30_days: number;
          total_considered_days: number;
          attendance_percentage: number | null;
          threshold_absences: number;
          minimum_attendance_percentage: number | null;
          is_defaulter: boolean;
          warning_reason: string;
          source_record_id: string | null;
          evaluated_at: string;
        };
        Insert: {
          id?: string;
          student_id: string;
          student_name_snapshot: string;
          class_section: string;
          policy_id: number;
          evaluation_date: string;
          window_start: string;
          window_end: string;
          window_days: number;
          absences_last_30_days: number;
          total_considered_days: number;
          attendance_percentage?: number | null;
          threshold_absences: number;
          minimum_attendance_percentage?: number | null;
          is_defaulter: boolean;
          warning_reason: string;
          source_record_id?: string | null;
          evaluated_at?: string;
        };
        Update: {
          id?: string;
          student_id?: string;
          student_name_snapshot?: string;
          class_section?: string;
          policy_id?: number;
          evaluation_date?: string;
          window_start?: string;
          window_end?: string;
          window_days?: number;
          absences_last_30_days?: number;
          total_considered_days?: number;
          attendance_percentage?: number | null;
          threshold_absences?: number;
          minimum_attendance_percentage?: number | null;
          is_defaulter?: boolean;
          warning_reason?: string;
          source_record_id?: string | null;
          evaluated_at?: string;
        };
        Relationships: [];
      };
      teacher_notifications: {
        Row: {
          id: string;
          student_id: string | null;
          student_name: string | null;
          student_code: string | null;
          class_section: string | null;
          title: string;
          message: string;
          severity: NotificationSeverity;
          notification_type: NotificationType;
          is_read: boolean;
          is_dismissed: boolean;
          created_at: string;
          read_at: string | null;
          metadata: Json;
          triggered_by: string;
          recommendation: string | null;
        };
        Insert: {
          id?: string;
          student_id?: string | null;
          student_name?: string | null;
          student_code?: string | null;
          class_section?: string | null;
          title: string;
          message: string;
          severity?: NotificationSeverity;
          notification_type?: NotificationType;
          is_read?: boolean;
          is_dismissed?: boolean;
          created_at?: string;
          read_at?: string | null;
          metadata?: Json;
          triggered_by?: string;
          recommendation?: string | null;
        };
        Update: {
          id?: string;
          student_id?: string | null;
          student_name?: string | null;
          student_code?: string | null;
          class_section?: string | null;
          title?: string;
          message?: string;
          severity?: NotificationSeverity;
          notification_type?: NotificationType;
          is_read?: boolean;
          is_dismissed?: boolean;
          created_at?: string;
          read_at?: string | null;
          metadata?: Json;
          triggered_by?: string;
          recommendation?: string | null;
        };
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: {
      attendance_status: AttendanceStatus;
      notification_severity: NotificationSeverity;
      notification_type: NotificationType;
    };
    CompositeTypes: Record<string, never>;
  };
};

export interface ApiSuccessResponse<T> {
  success: true;
  data: T;
  meta?: {
    total?: number;
    page?: number;
    limit?: number;
    [key: string]: unknown;
  };
}

export interface ApiErrorDetail {
  code: string;
  message: string;
  fields?: Record<string, string>;
}

export interface ApiErrorResponse {
  success: false;
  error: ApiErrorDetail;
}

export type ApiResponse<T> = ApiSuccessResponse<T> | ApiErrorResponse;
