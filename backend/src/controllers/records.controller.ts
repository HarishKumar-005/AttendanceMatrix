import { Request, Response, NextFunction } from 'express';
import { attendanceService } from '../services/attendance.service.js';
import { supabase } from '../config/db.js';
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

    // Map records to frontend-expected field names
    const mappedRecords = result.records.map(mapRecordToFrontend);

    // Compute summary metrics server-side for the dashboard cards
    const totalRecords = result.total;

    // Count unique students across all records
    const uniqueStudentIds = new Set(result.records.map(r => r.student_id));
    const totalStudents = uniqueStudentIds.size;

    // Count present records for attendance rate
    const presentCount = result.records.filter(r => r.status === 'present').length;
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
        .select('*', { count: 'exact', head: true })
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
    const result = await attendanceService.createRecord(bodyInput);

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

