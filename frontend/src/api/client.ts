/**
 * API Client for AttendanceMatrix Express REST API.
 * Adheres to 3-tier boundary: Browser -> Express API.
 * ZERO direct Supabase client calls in frontend.
 */

export type AttendanceStatus = 'present' | 'absent' | 'excused';

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
  student_code: string;
  class_section: string;
  total_days: number;
  present_count: number;
  absent_count: number;
  excused_count: number;
  last_30_days_absent: number;
  is_defaulter: boolean;
  warning_reason: string | null;
  threshold_applied: number;
}

export interface SummaryMetrics {
  totalRecords: number;
  totalStudents: number;
  defaultersCount: number;
  attendanceRate: number;
  policyThreshold: number;
}

export interface FilterParams {
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
 * Fetch list of attendance records with optional filtering & calculated overview metrics.
 */
export async function fetchRecords(filters?: FilterParams): Promise<{
  records: AttendanceRecord[];
  metrics: SummaryMetrics;
}> {
  const query = new URLSearchParams();
  if (filters?.search) query.append('search', filters.search);
  if (filters?.classSection && filters.classSection !== 'ALL') query.append('classSection', filters.classSection);
  if (filters?.status && filters.status !== 'ALL') query.append('status', filters.status);
  if (filters?.startDate) query.append('startDate', filters.startDate);
  if (filters?.endDate) query.append('endDate', filters.endDate);
  if (filters?.isDefaulter !== undefined && filters.isDefaulter) query.append('isDefaulter', 'true');

  const queryString = query.toString();
  const endpoint = `/records${queryString ? `?${queryString}` : ''}`;
  
  return request<{ records: AttendanceRecord[]; metrics: SummaryMetrics }>(endpoint, {
    method: 'GET',
  });
}

/**
 * Create a new attendance record. Trigger server-side recalculation.
 */
export async function createRecord(payload: CreateRecordPayload): Promise<{
  record: AttendanceRecord;
  summary?: StudentSummary;
}> {
  return request<{ record: AttendanceRecord; summary?: StudentSummary }>('/records', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

/**
 * Update an existing attendance record by ID. Trigger server-side recalculation.
 */
export async function updateRecord(id: string, payload: UpdateRecordPayload): Promise<{
  record: AttendanceRecord;
  summary?: StudentSummary;
}> {
  return request<{ record: AttendanceRecord; summary?: StudentSummary }>(`/records/${id}`, {
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
