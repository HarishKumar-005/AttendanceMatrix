import { Request, Response, NextFunction } from 'express';
import { supabase } from '../config/db.js';
import { attendanceService } from '../services/attendance.service.js';
import { AppError } from '../middleware/error-handler.js';
import { ApiSuccessResponse, Student } from '../types/index.js';

export const getStudents = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    let dbQuery = supabase.from('students').select('*').eq('is_active', true);

    const classSection = req.query.class_section as string | undefined;
    const search = req.query.search as string | undefined;

    if (classSection) {
      dbQuery = dbQuery.eq('current_class_section', classSection);
    }
    if (search) {
      const term = `%${search.trim()}%`;
      dbQuery = dbQuery.or(`full_name.ilike.${term},student_code.ilike.${term},mobile_number.ilike.${term},guardian_phone.ilike.${term}`);
    }

    dbQuery = dbQuery.order('current_class_section').order('full_name');

    let { data, error } = await dbQuery;

    if (error && (error.code === '42703' || error.code === 'PGRST204')) {
      // Fallback if mobile_number column is not in Supabase schema cache yet
      let fallbackQuery = supabase.from('students').select('*').eq('is_active', true);
      if (classSection) fallbackQuery = fallbackQuery.eq('current_class_section', classSection);
      if (search) {
        const term = `%${search.trim()}%`;
        fallbackQuery = fallbackQuery.or(`full_name.ilike.${term},student_code.ilike.${term},guardian_phone.ilike.${term}`);
      }
      fallbackQuery = fallbackQuery.order('current_class_section').order('full_name');
      const res = await fallbackQuery;
      data = res.data;
      error = res.error;
    }

    if (error) {
      console.error('[StudentsController.getStudents] DB error:', error);
      throw new AppError(500, 'DATABASE_ERROR', 'Failed to retrieve students list');
    }

    const mappedStudents = ((data as Record<string, unknown>[]) || []).map((s) => ({
      ...s,
      mobile_number: (s.mobile_number as string) || (s.guardian_phone as string) || null,
    }));

    const response: ApiSuccessResponse<Student[]> = {
      success: true,
      data: mappedStudents as unknown as Student[],
    };

    res.status(200).json(response);
  } catch (error) {
    next(error);
  }
};

export const updateStudent = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const studentId = req.params.id || req.params.studentId;
    const { mobile_number, guardian_phone, guardian_name } = req.body;

    const val = mobile_number !== undefined ? (mobile_number ? String(mobile_number).trim() : null) : null;

    // First try updating mobile_number & guardian_phone
    const updatePayload: Record<string, unknown> = {
      guardian_phone: val || (guardian_phone ? String(guardian_phone).trim() : null),
    };
    if (guardian_name !== undefined) updatePayload.guardian_name = guardian_name ? String(guardian_name).trim() : null;

    // Attempt to include mobile_number
    let { data, error } = await supabase
      .from('students')
      .update({ ...updatePayload, mobile_number: val } as any)
      .eq('id', studentId)
      .select('*')
      .single();

    if (error && (error.code === 'PGRST204' || error.code === '42703')) {
      // Fall back to updating guardian_phone if mobile_number column is not in schema cache
      const res = await supabase
        .from('students')
        .update(updatePayload as any)
        .eq('id', studentId)
        .select('*')
        .single();
      data = res.data;
      error = res.error;
    }

    if (error || !data) {
      console.error('[StudentsController.updateStudent] DB error:', error);
      throw new AppError(500, 'DATABASE_ERROR', 'Failed to update student profile');
    }

    const updatedStudent = {
      ...data,
      mobile_number: data.mobile_number || data.guardian_phone || val,
    };

    const response: ApiSuccessResponse<Student> = {
      success: true,
      data: updatedStudent as Student,
    };

    res.status(200).json(response);
  } catch (error) {
    next(error);
  }
};

export const getStudentById = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { data, error } = await supabase
      .from('students')
      .select('*')
      .eq('id', req.params.id)
      .single();

    if (error || !data) {
      throw new AppError(404, 'NOT_FOUND', `Student with ID '${req.params.id}' was not found`);
    }

    const studentData = {
      ...data,
      mobile_number: data.mobile_number || data.guardian_phone || null,
    };

    const response: ApiSuccessResponse<Student> = {
      success: true,
      data: studentData as Student,
    };

    res.status(200).json(response);
  } catch (error) {
    next(error);
  }
};

export const getStudentSummary = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const studentId = req.params.studentId;
    const dateQuery = req.query.date as string | undefined;

    const summary = await attendanceService.getStudentSummary(studentId, dateQuery);

    // Enrich summary with mobile_number from student master
    const { data: studentMaster } = await supabase
      .from('students')
      .select('mobile_number, guardian_phone')
      .eq('id', studentId)
      .single();

    const mobileNum = studentMaster ? (studentMaster.mobile_number || studentMaster.guardian_phone || null) : null;

    const response: ApiSuccessResponse<typeof summary> = {
      success: true,
      data: {
        ...summary,
        mobile_number: mobileNum,
      },
    };

    res.status(200).json(response);
  } catch (error) {
    next(error);
  }
};
