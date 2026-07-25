import { supabase } from '../config/db.js';
import { AppError } from '../middleware/error-handler.js';
import { recalculationService } from './recalculation.service.js';
import { AttendanceRecord, StudentSummary } from '../types/index.js';
import { CreateAttendanceInput, UpdateAttendanceInput, GetRecordsQueryInput } from '../schemas/attendance.schema.js';

export interface GetRecordsResult {
  records: AttendanceRecord[];
  total: number;
  page: number;
  limit: number;
}

export interface RecordMutationResult {
  record: AttendanceRecord;
  summary: StudentSummary;
}

export class AttendanceService {
  /**
   * Retrieves attendance records with optional filtering and pagination.
   */
  public async getRecords(query: GetRecordsQueryInput): Promise<GetRecordsResult> {
    const page = query.page && query.page > 0 ? query.page : 1;
    const limit = query.limit && query.limit > 0 ? query.limit : 20;
    const offset = (page - 1) * limit;

    let dbQuery = supabase
      .from('attendance_records')
      .select('*', { count: 'exact' });

    if (query.student_id) {
      dbQuery = dbQuery.eq('student_id', query.student_id);
    }
    if (query.class_section) {
      dbQuery = dbQuery.eq('class_section', query.class_section);
    }
    if (query.status) {
      dbQuery = dbQuery.eq('status', query.status);
    }
    if (query.start_date) {
      dbQuery = dbQuery.gte('attendance_date', query.start_date);
    }
    if (query.end_date) {
      dbQuery = dbQuery.lte('attendance_date', query.end_date);
    }
    if (query.search) {
      const searchTerm = `%${query.search.trim()}%`;
      dbQuery = dbQuery.or(`student_name_snapshot.ilike.${searchTerm},record_code.ilike.${searchTerm},reason.ilike.${searchTerm}`);
    }

    dbQuery = dbQuery
      .order('attendance_date', { ascending: false })
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    const { data, count, error } = await dbQuery;

    if (error) {
      console.error('[AttendanceService.getRecords] Supabase query error:', error);
      throw new AppError(500, 'DATABASE_ERROR', 'Failed to retrieve attendance records');
    }

    return {
      records: (data as AttendanceRecord[]) || [],
      total: count || 0,
      page,
      limit,
    };
  }

  /**
   * Retrieves a single attendance record by unique ID.
   */
  public async getRecordById(id: string): Promise<AttendanceRecord> {
    const { data, error } = await supabase
      .from('attendance_records')
      .select('*')
      .eq('id', id)
      .single();

    if (error || !data) {
      throw new AppError(404, 'NOT_FOUND', `Attendance record with ID '${id}' was not found`);
    }

    return data as AttendanceRecord;
  }

  /**
   * Creates a new attendance record, triggers 30-day recalculation, and returns record + updated summary.
   */
  public async createRecord(data: CreateAttendanceInput): Promise<RecordMutationResult> {
    // 1. Verify student exists in student master table
    const { data: student, error: studentError } = await supabase
      .from('students')
      .select('*')
      .eq('id', data.student_id)
      .single();

    if (studentError || !student) {
      throw new AppError(
        404,
        'STUDENT_NOT_FOUND',
        `Student with ID '${data.student_id}' does not exist in master records`,
        { student_id: `Student '${data.student_id}' not found` }
      );
    }

    // 2. Derive snapshots and record code
    const studentNameSnapshot = data.student_name_snapshot || student.full_name;
    const classSection = data.class_section || student.current_class_section;
    const recordCode = `REC-${Date.now().toString(36).toUpperCase()}-${Math.floor(1000 + Math.random() * 9000)}`;

    // 3. Insert record into attendance_records
    const { data: insertedRecord, error: insertError } = await supabase
      .from('attendance_records')
      .insert({
        record_code: recordCode,
        student_id: data.student_id,
        student_name_snapshot: studentNameSnapshot,
        class_section: classSection,
        attendance_date: data.attendance_date,
        status: data.status,
        reason: data.reason || null,
        marked_by: data.marked_by || 'System User',
        source: 'manual',
      })
      .select('*')
      .single();

    if (insertError || !insertedRecord) {
      console.error('[AttendanceService.createRecord] Insert failed:', insertError);

      if (insertError?.code === '23505') {
        // Unique constraint violation (student_id + attendance_date)
        throw new AppError(
          400,
          'DUPLICATE_RECORD',
          `An attendance record already exists for this student on ${data.attendance_date}`,
          { attendance_date: `Attendance already marked for ${data.attendance_date}` }
        );
      }

      throw new AppError(500, 'DATABASE_ERROR', 'Failed to create attendance record');
    }

    const newRecord = insertedRecord as AttendanceRecord;

    // 4. Server-side recalculation of 30-day rolling warning status
    const summary = await recalculationService.recalculateForStudent(
      newRecord.student_id,
      newRecord.attendance_date,
      newRecord.id
    );

    return {
      record: newRecord,
      summary,
    };
  }

  /**
   * Updates an existing attendance record, recalculates 30-day rolling state, and returns record + summary.
   */
  public async updateRecord(id: string, data: UpdateAttendanceInput): Promise<RecordMutationResult> {
    // 1. Verify existing record exists
    const existingRecord = await this.getRecordById(id);

    // 2. Perform update
    const updatePayload: Partial<AttendanceRecord> = {};
    if (data.status) updatePayload.status = data.status;
    if (data.attendance_date) updatePayload.attendance_date = data.attendance_date;
    if (data.reason !== undefined) updatePayload.reason = data.reason;
    if (data.marked_by !== undefined) updatePayload.marked_by = data.marked_by;
    if (data.class_section !== undefined) updatePayload.class_section = data.class_section;

    const { data: updatedData, error: updateError } = await supabase
      .from('attendance_records')
      .update(updatePayload)
      .eq('id', id)
      .select('*')
      .single();

    if (updateError || !updatedData) {
      console.error('[AttendanceService.updateRecord] Update failed:', updateError);
      throw new AppError(500, 'DATABASE_ERROR', `Failed to update attendance record '${id}'`);
    }

    const updatedRecord = updatedData as AttendanceRecord;

    // 3. Trigger recalculation for affected student
    const summary = await recalculationService.recalculateForStudent(
      updatedRecord.student_id,
      updatedRecord.attendance_date,
      updatedRecord.id
    );

    return {
      record: updatedRecord,
      summary,
    };
  }

  /**
   * Calculates and returns the summary early-warning state for a specific student.
   */
  public async getStudentSummary(studentId: string, evaluationDate?: string): Promise<StudentSummary> {
    // Verify student existence
    const { data: student, error } = await supabase
      .from('students')
      .select('id')
      .eq('id', studentId)
      .single();

    if (error || !student) {
      throw new AppError(404, 'STUDENT_NOT_FOUND', `Student with ID '${studentId}' was not found`);
    }

    return recalculationService.recalculateForStudent(studentId, evaluationDate);
  }
}

export const attendanceService = new AttendanceService();
