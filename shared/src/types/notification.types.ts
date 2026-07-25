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
