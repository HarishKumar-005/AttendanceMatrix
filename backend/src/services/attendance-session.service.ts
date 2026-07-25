import { supabase } from '../config/db.js';
import { AppError } from '../middleware/error-handler.js';
import { recalculationService } from './recalculation.service.js';
import { GetSessionQueryInput, SaveSessionInput } from '../schemas/attendance.schema.js';
import { StudentSummary } from '../types/index.js';

export interface StudentRosterEntry {
  student_id: string;
  student_code: string;
  student_name: string;
  class_section: string;
  status: 'present' | 'absent' | 'excused';
  is_defaulter: boolean;
  record_id?: string | null;
  remarks?: string | null;
}

export interface AttendanceSessionResult {
  class_section: string;
  attendance_date: string;
  status: 'clean' | 'draft' | 'saved';
  total_enrolled: number;
  present_count: number;
  absent_count: number;
  excused_count: number;
  roster: StudentRosterEntry[];
}

export interface SaveSessionResult {
  session: AttendanceSessionResult;
  updated_defaulters: StudentSummary[];
}

export class AttendanceSessionService {
  /**
   * Loads an Attendance Session for a specific class section and date.
   * Merges master students with any existing attendance records saved for that date.
   */
  public async getSession(query: GetSessionQueryInput): Promise<AttendanceSessionResult> {
    const { class_section, date } = query;

    // 1. Fetch enrolled active students for this class section
    const { data: students, error: studentsError } = await supabase
      .from('students')
      .select('*')
      .eq('current_class_section', class_section)
      .eq('is_active', true)
      .order('full_name');

    if (studentsError) {
      console.error('[AttendanceSessionService.getSession] Failed to fetch students:', studentsError);
      throw new AppError(500, 'DATABASE_ERROR', `Failed to load student roster for ${class_section}`);
    }

    const masterStudents = students || [];

    // 2. Fetch any existing attendance records for this class and date
    const { data: records, error: recordsError } = await supabase
      .from('attendance_records')
      .select('*')
      .eq('class_section', class_section)
      .eq('attendance_date', date);

    if (recordsError) {
      console.error('[AttendanceSessionService.getSession] Failed to fetch records:', recordsError);
      throw new AppError(500, 'DATABASE_ERROR', `Failed to load attendance records for ${class_section} on ${date}`);
    }

    const existingRecordsMap = new Map<string, { id: string; status: 'present' | 'absent' | 'excused'; reason: string | null }>();
    (records || []).forEach((r) => {
      existingRecordsMap.set(r.student_id, {
        id: r.id,
        status: r.status as 'present' | 'absent' | 'excused',
        reason: r.reason || null,
      });
    });

    // 3. Fetch current defaulter status for students
    const studentIds = masterStudents.map((s) => s.id);
    const defaulterMap = new Map<string, boolean>();

    if (studentIds.length > 0) {
      const { data: defaulterLogs } = await supabase
        .from('defaulter_logs')
        .select('student_id, is_defaulter')
        .in('student_id', studentIds);

      (defaulterLogs || []).forEach((log) => {
        defaulterMap.set(log.student_id, log.is_defaulter);
      });
    }

    // 4. Construct roster entries
    let presentCount = 0;
    let absentCount = 0;
    let excusedCount = 0;

    const roster: StudentRosterEntry[] = masterStudents.map((student) => {
      const existing = existingRecordsMap.get(student.id);
      const status = existing ? existing.status : 'present'; // Default to present for new sessions
      
      if (status === 'present') presentCount++;
      else if (status === 'absent') absentCount++;
      else if (status === 'excused') excusedCount++;

      return {
        student_id: student.id,
        student_code: student.student_code,
        student_name: student.full_name,
        class_section: student.current_class_section,
        status,
        is_defaulter: defaulterMap.get(student.id) || false,
        record_id: existing ? existing.id : null,
        remarks: existing ? existing.reason : null,
      };
    });

    const isAlreadySaved = records && records.length > 0;

    return {
      class_section,
      attendance_date: date,
      status: isAlreadySaved ? 'clean' : 'clean',
      total_enrolled: masterStudents.length,
      present_count: presentCount,
      absent_count: absentCount,
      excused_count: excusedCount,
      roster,
    };
  }

  /**
   * Saves an entire class attendance session atomically.
   * Upserts attendance records and triggers server-side risk recalculation for affected students.
   */
  public async saveSession(input: SaveSessionInput): Promise<SaveSessionResult> {
    const { class_section, date, records } = input;

    if (!records || records.length === 0) {
      throw new AppError(400, 'EMPTY_SESSION', 'Cannot save an empty attendance session');
    }

    // 1. Prepare batch upsert records
    const upsertPayloads = records.map((entry) => {
      const recordCode = `REC-${Date.now().toString(36).toUpperCase()}-${Math.floor(1000 + Math.random() * 9000)}`;
      return {
        student_id: entry.student_id,
        student_name_snapshot: entry.student_name,
        class_section,
        attendance_date: date,
        status: entry.status,
        reason: entry.remarks || null,
        marked_by: 'Teacher (Session)',
        source: 'manual' as const,
        record_code: recordCode,
      };
    });


    // 2. Perform atomic upsert into Supabase attendance_records using student_id + attendance_date unique constraint
    const { data: savedRecords, error: upsertError } = await supabase
      .from('attendance_records')
      .upsert(upsertPayloads, { onConflict: 'student_id,attendance_date' })
      .select('*');

    if (upsertError || !savedRecords) {
      console.error('[AttendanceSessionService.saveSession] Upsert error:', upsertError);
      throw new AppError(500, 'DATABASE_ERROR', `Failed to save attendance session for ${class_section}`);
    }

    // 3. Recalculate 30-day rolling warning stats for all affected students in batch
    const updatedDefaulters: StudentSummary[] = [];
    for (const record of savedRecords) {
      const summary = await recalculationService.recalculateForStudent(
        record.student_id,
        date,
        record.id
      );
      if (summary.is_defaulter) {
        updatedDefaulters.push(summary);
      }
    }

    // 4. Return refreshed session result
    const refreshedSession = await this.getSession({ class_section, date });
    refreshedSession.status = 'saved';

    return {
      session: refreshedSession,
      updated_defaulters: updatedDefaulters,
    };
  }
}

export const attendanceSessionService = new AttendanceSessionService();
