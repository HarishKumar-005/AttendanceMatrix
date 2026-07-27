import { Request, Response, NextFunction } from 'express';
import { attendanceService } from '../services/attendance.service.js';
import { supabase } from '../config/db.js';
import { AppError } from '../middleware/error-handler.js';
import { ApiSuccessResponse, AttendanceRecord } from '../types/index.js';
import { CreateAttendanceInput, UpdateAttendanceInput, GetRecordsQueryInput } from '../schemas/attendance.schema.js';

/**
 * Maps a raw DB attendance record to the frontend-expected field names.
 */
function mapRecordToFrontend(record: AttendanceRecord): Record<string, unknown> {
  return {
    id: record.id,
    record_code: record.record_code,
    student_id: record.student_id,
    student_code: record.record_code, // use record_code as display identifier
    student_name: record.student_name_snapshot,
    class_section: record.class_section,
    date: record.attendance_date,
    status: record.status,
    remarks: record.reason,
    is_defaulter: false, // will be enriched below if needed
    created_at: record.created_at,
    updated_at: record.updated_at,
  };
}

export const getRecords = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const queryInput = req.query as unknown as GetRecordsQueryInput;
    const result = await attendanceService.getRecords(queryInput);

    // Fetch student master info to map real student_code
    const uniqueStudentIds = Array.from(new Set(result.records.map((r) => r.student_id)));
    const studentCodeMap = new Map<string, string>();
    const defaulterSet = new Set<string>();

    if (uniqueStudentIds.length > 0) {
      const { data: studentList } = await supabase
        .from('students')
        .select('id, student_code')
        .in('id', uniqueStudentIds);

      (studentList || []).forEach((s) => {
        studentCodeMap.set(s.id, s.student_code);
      });

      // Query defaulter_logs for active defaulters
      const { data: defaulterList } = await supabase
        .from('defaulter_logs')
        .select('student_id')
        .in('student_id', uniqueStudentIds)
        .eq('is_defaulter', true);

      (defaulterList || []).forEach((d) => {
        defaulterSet.add(d.student_id);
      });
    }

    // Map records to frontend-expected field names with enriched student_code and is_defaulter
    const mappedRecords = result.records.map((record) => {
      const realStudentCode = studentCodeMap.get(record.student_id) || record.record_code;
      const isDefaulter = defaulterSet.has(record.student_id);

      return {
        id: record.id,
        record_code: record.record_code,
        student_id: record.student_id,
        student_code: realStudentCode,
        student_name: record.student_name_snapshot,
        class_section: record.class_section,
        date: record.attendance_date,
        status: record.status,
        remarks: record.reason,
        is_defaulter: isDefaulter,
        created_at: record.created_at,
        updated_at: record.updated_at,
      };
    });

    // Compute summary metrics server-side for the dashboard cards
    const totalRecords = result.total;
    const totalStudents = uniqueStudentIds.length;

    // Count present records for attendance rate
    const presentCount = result.records.filter((r) => r.status === 'present').length;
    const attendanceRate = result.records.length > 0
      ? Math.round((presentCount / result.records.length) * 100)
      : 0;

    // Fetch policy threshold
    let policyThreshold = 5;
    try {
      const { data: policy } = await supabase
        .from('attendance_policy')
        .select('absence_threshold')
        .eq('id', 1)
        .single();
      if (policy) {
        policyThreshold = policy.absence_threshold;
      }
    } catch {
      // Use default threshold if policy fetch fails
    }

    // Count defaulters from the latest defaulter_logs
    let defaultersCount = 0;
    try {
      const { count } = await supabase
        .from('defaulter_logs')
        .select('student_id', { count: 'exact', head: true })
        .eq('is_defaulter', true);
      defaultersCount = count || 0;
    } catch {
      // Use 0 if defaulter count fails
    }

    const responsePayload = {
      records: mappedRecords,
      metrics: {
        totalRecords,
        totalStudents,
        defaultersCount,
        attendanceRate,
        policyThreshold,
      },
    };


    const response: ApiSuccessResponse<typeof responsePayload> = {
      success: true,
      data: responsePayload,
      meta: {
        total: result.total,
        page: result.page,
        limit: result.limit,
      },
    };

    res.status(200).json(response);
  } catch (error) {
    next(error);
  }
};

export const getRecordById = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const record = await attendanceService.getRecordById(req.params.id);

    const response: ApiSuccessResponse<Record<string, unknown>> = {
      success: true,
      data: mapRecordToFrontend(record),
    };

    res.status(200).json(response);
  } catch (error) {
    next(error);
  }
};

export const createRecord = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const bodyInput = req.body as CreateAttendanceInput;

    // Normalize class_section early: strip "Class " prefix and hyphen for DB consistency
    // Frontend may send "Class 9-A" but DB stores "9A"
    let normalizedClassSection = bodyInput.class_section;
    if (normalizedClassSection) {
      normalizedClassSection = normalizedClassSection
        .replace(/^Class\s*/i, '')
        .replace(/-/g, '')
        .trim();
    }

    // Resolve student_id from student_code if student_id is not directly provided
    let resolvedStudentId = bodyInput.student_id;
    let resolvedStudentName = bodyInput.student_name_snapshot;

    if (!resolvedStudentId && bodyInput.student_code) {
      const { data: studentMatch } = await supabase
        .from('students')
        .select('id, full_name, current_class_section')
        .eq('student_code', bodyInput.student_code)
        .single();

      if (studentMatch) {
        // Existing student found — use their ID
        resolvedStudentId = studentMatch.id;
        // Use the DB name as snapshot if form didn't supply one
        if (!resolvedStudentName) {
          resolvedStudentName = studentMatch.full_name;
        }
      } else {
        // Student does not exist — auto-create in the students master table
        // This allows teachers to register new students and mark attendance in one step
        const studentName = bodyInput.student_name_snapshot;
        if (!studentName || studentName.trim().length === 0) {
          throw new AppError(
            400,
            'VALIDATION_ERROR',
            'Student name is required when adding a new student',
            { student_name: 'Student name is required to create a new student record' }
          );
        }

        const classForStudent = normalizedClassSection || bodyInput.class_section || '';
        if (!classForStudent || classForStudent.trim().length === 0) {
          throw new AppError(
            400,
            'VALIDATION_ERROR',
            'Class section is required when adding a new student',
            { class_section: 'Class section is required to create a new student record' }
          );
        }

        const { data: newStudent, error: insertStudentError } = await supabase
          .from('students')
          .insert({
            student_code: bodyInput.student_code,
            full_name: studentName.trim(),
            current_class_section: classForStudent.trim(),
            mobile_number: (bodyInput as unknown as Record<string, string>).mobile_number ? String((bodyInput as unknown as Record<string, string>).mobile_number).trim() : null,
            is_active: true,
          })
          .select('id, full_name, student_code, current_class_section, mobile_number')
          .single();

        if (insertStudentError || !newStudent) {
          console.error('[createRecord] Failed to auto-create student:', insertStudentError);

          if (insertStudentError?.code === '23505') {
            // Unique constraint violation — race condition, student was just created
            throw new AppError(
              409,
              'DUPLICATE_STUDENT',
              `Student code '${bodyInput.student_code}' already exists. Please try again.`,
              { student_code: `Student code '${bodyInput.student_code}' already exists` }
            );
          }

          throw new AppError(
            500,
            'DATABASE_ERROR',
            'Failed to create student record. Please try again.',
            { student_code: 'Could not create student in the master records' }
          );
        }

        resolvedStudentId = newStudent.id;
        resolvedStudentName = newStudent.full_name;

        console.log(
          `[createRecord] Auto-created new student: ${newStudent.full_name} (${newStudent.student_code}) in class ${newStudent.current_class_section}`
        );
      }
    }

    if (!resolvedStudentId) {
      throw new AppError(
        400,
        'VALIDATION_ERROR',
        'Either student_id or student_code must be provided',
        { student_id: 'student_id or student_code is required' }
      );
    }

    // Build the canonical service input
    const serviceInput = {
      student_id: resolvedStudentId,
      attendance_date: bodyInput.attendance_date,
      status: bodyInput.status,
      reason: bodyInput.reason,
      marked_by: bodyInput.marked_by,
      class_section: normalizedClassSection || bodyInput.class_section,
      student_name_snapshot: resolvedStudentName,
    };

    const result = await attendanceService.createRecord(serviceInput);

    const response: ApiSuccessResponse<typeof result> = {
      success: true,
      data: result,
    };

    res.status(201).json(response);
  } catch (error) {
    next(error);
  }
};



export const updateRecord = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const bodyInput = req.body as UpdateAttendanceInput;
    const result = await attendanceService.updateRecord(req.params.id, bodyInput);

    const response: ApiSuccessResponse<typeof result> = {
      success: true,
      data: result,
    };

    res.status(200).json(response);
  } catch (error) {
    next(error);
  }
};

