/**
 * API Client for AttendanceMatrix Express REST API.
 * Adheres to 3-tier boundary: Browser -> Express API.
 * ZERO direct Supabase client calls in frontend.
 */

export type AttendanceStatus = 'present' | 'absent' | 'excused';
export type SessionLifecycle = 'clean' | 'draft' | 'saving' | 'saved' | 'failed';

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

export interface StudentRosterEntry {
  student_id: string;
  student_code: string;
  student_name: string;
  class_section: string;
  mobile_number?: string | null;
  status: AttendanceStatus;
  is_defaulter: boolean;
  record_id?: string | null;
  remarks?: string | null;
}

export interface AttendanceSession {
  class_section: string;
  attendance_date: string;
  status: SessionLifecycle;
  total_enrolled: number;
  present_count: number;
  absent_count: number;
  excused_count: number;
  roster: StudentRosterEntry[];
}

export interface SaveSessionPayload {
  class_section: string;
  date: string;
  records: Array<{
    student_id: string;
    student_code: string;
    student_name: string;
    status: AttendanceStatus;
    remarks?: string | null;
  }>;
}

export interface SaveSessionResponse {
  session: AttendanceSession;
  updated_defaulters: StudentSummary[];
}

export interface AttendanceRecord {
  id: string;
  record_code: string;
  student_id: string;
  student_code: string;
  student_name: string;
  class_section: string;
  date: string; // YYYY-MM-DD
  status: AttendanceStatus;
  remarks?: string | null;
  is_defaulter?: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface StudentSummary {
  student_id: string;
  student_name: string;
  student_code?: string;
  class_section: string;
  mobile_number?: string | null;
  total_days?: number;
  present_count?: number;
  absent_count?: number;
  excused_count?: number;
  last_30_days_absent?: number;
  absences_last_30_days?: number;
  total_considered_days?: number;
  attendance_percentage: number;
  is_defaulter: boolean;
  warning_reason: string | null;
  threshold_applied?: number;
  absence_threshold?: number;
}

export interface SummaryMetrics {
  totalRecords: number;
  totalStudents: number;
  defaultersCount: number;
  attendanceRate: number;
  policyThreshold: number;
}

export interface FilterParams {
  studentId?: string;
  search?: string;
  classSection?: string;
  status?: string;
  startDate?: string;
  endDate?: string;
  isDefaulter?: boolean;
}

export interface CreateRecordPayload {
  student_name: string;
  student_code: string;
  class_section: string;
  date: string;
  status: AttendanceStatus;
  remarks?: string;
}

export interface UpdateRecordPayload {
  student_name?: string;
  student_code?: string;
  class_section?: string;
  date?: string;
  status?: AttendanceStatus;
  remarks?: string;
}

export interface ApiSuccessResponse<T> {
  success: true;
  data: T;
}

export interface ApiErrorResponse {
  success: false;
  error: {
    code: string;
    message: string;
    fields?: Record<string, string>;
  };
}

export type ApiResponse<T> = ApiSuccessResponse<T> | ApiErrorResponse;

const API_BASE = '/api';

/**
 * Generic fetch wrapper with standard API envelope error handling.
 */
async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const config: RequestInit = {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  };

  let response: Response;
  try {
    response = await fetch(`${API_BASE}${endpoint}`, config);
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Network request failed';
    throw new Error(`Unable to connect to AttendanceMatrix server: ${msg}`);
  }

  let body: ApiResponse<T>;
  try {
    body = await response.json();
  } catch {
    throw new Error(`Server returned invalid response (Status ${response.status})`);
  }

  if (!body.success) {
    const errorDetail = body.error?.fields
      ? Object.entries(body.error.fields).map(([k, v]) => `${k}: ${v}`).join(', ')
      : body.error?.message || 'An unexpected server error occurred';
    throw new Error(errorDetail);
  }

  return body.data;
}

/**
 * Fetch an active Attendance Session for a class section and date.
 */
export async function fetchAttendanceSession(
  classSection: string,
  date: string,
  search?: string
): Promise<AttendanceSession> {
  const query = new URLSearchParams({
    class_section: classSection,
    date,
  });
  if (search && search.trim().length > 0) {
    query.append('search', search.trim());
  }
  return request<AttendanceSession>(`/attendance/session?${query.toString()}`);
}

/**
 * Save an entire class Attendance Session atomically.
 */
export async function saveAttendanceSession(
  payload: SaveSessionPayload
): Promise<SaveSessionResponse> {
  return request<SaveSessionResponse>('/attendance/session/save', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

/**
 * Fetch list of historical attendance records with optional filtering & calculated overview metrics.
 */
export async function fetchRecords(filters?: FilterParams): Promise<{
  records: AttendanceRecord[];
  metrics: SummaryMetrics;
}> {
  const query = new URLSearchParams();
  if (filters?.studentId) query.append('student_id', filters.studentId);
  if (filters?.search) query.append('search', filters.search);
  if (filters?.classSection && filters.classSection !== 'ALL') query.append('classSection', filters.classSection);
  if (filters?.status && filters.status !== 'ALL') query.append('status', filters.status);
  if (filters?.startDate) query.append('startDate', filters.startDate);
  if (filters?.endDate) query.append('endDate', filters.endDate);
  if (filters?.isDefaulter !== undefined && filters.isDefaulter) query.append('isDefaulter', 'true');

  const queryString = query.toString();
  const endpoint = `/attendance/history${queryString ? `?${queryString}` : ''}`;
  
  return request<{ records: AttendanceRecord[]; metrics: SummaryMetrics }>(endpoint, {
    method: 'GET',
  });
}

/**
 * Create a single historical attendance record. Trigger server-side recalculation.
 */
export async function createRecord(payload: CreateRecordPayload): Promise<{
  record: AttendanceRecord;
  summary?: StudentSummary;
}> {
  return request<{ record: AttendanceRecord; summary?: StudentSummary }>('/attendance/history', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

/**
 * Update an existing historical attendance record by ID. Trigger server-side recalculation.
 */
export async function updateRecord(id: string, payload: UpdateRecordPayload): Promise<{
  record: AttendanceRecord;
  summary?: StudentSummary;
}> {
  return request<{ record: AttendanceRecord; summary?: StudentSummary }>(`/attendance/history/${id}`, {
    method: 'PUT',
    body: JSON.stringify(payload),
  });
}

/**
 * Fetch 30-day attendance summary and dropout warning status for a specific student.
 */
export async function fetchStudentSummary(studentId: string): Promise<StudentSummary> {
  return request<StudentSummary>(`/students/${studentId}/summary`, {
    method: 'GET',
  });
}

/**
 * Update a student's profile information (e.g. mobile number) in the students table.
 */
export async function updateStudentMobileNumber(
  studentId: string,
  mobileNumber: string
): Promise<{ id: string; mobile_number: string | null }> {
  return request<{ id: string; mobile_number: string | null }>(`/students/${studentId}`, {
    method: 'PUT',
    body: JSON.stringify({ mobile_number: mobileNumber }),
  });
}

/**
 * Notifications API Client Methods
 */
export async function fetchNotifications(filters?: {
  unread_only?: boolean;
  severity?: NotificationSeverity;
  page?: number;
  limit?: number;
}): Promise<TeacherNotification[]> {
  const query = new URLSearchParams();
  if (filters?.unread_only) query.append('unread_only', 'true');
  if (filters?.severity) query.append('severity', filters.severity);
  if (filters?.page) query.append('page', String(filters.page));
  if (filters?.limit) query.append('limit', String(filters.limit));

  const qStr = query.toString();
  return request<TeacherNotification[]>(`/notifications${qStr ? `?${qStr}` : ''}`);
}

export async function fetchUnreadNotificationCount(): Promise<number> {
  const res = await request<{ unread_count: number }>('/notifications/unread-count');
  return res.unread_count;
}

export async function markNotificationRead(id: string): Promise<TeacherNotification> {
  return request<TeacherNotification>(`/notifications/${id}/read`, {
    method: 'PATCH',
  });
}

export async function markAllNotificationsRead(): Promise<number> {
  const res = await request<{ updated_count: number }>('/notifications/mark-all-read', {
    method: 'POST',
  });
  return res.updated_count;
}

export async function dismissNotification(id: string): Promise<boolean> {
  const res = await request<{ dismissed: boolean }>(`/notifications/${id}`, {
    method: 'DELETE',
  });
  return res.dismissed;
}

export async function clearAllNotifications(): Promise<number> {
  const res = await request<{ cleared_count: number }>('/notifications', {
    method: 'DELETE',
  });
  return res.cleared_count;
}

export async function fetchNotificationAnalytics(): Promise<NotificationAnalytics> {
  return request<NotificationAnalytics>('/notifications/analytics');
}
