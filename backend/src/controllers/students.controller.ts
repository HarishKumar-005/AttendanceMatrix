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
      dbQuery = dbQuery.or(`full_name.ilike.${term},student_code.ilike.${term}`);
    }

    dbQuery = dbQuery.order('current_class_section').order('full_name');

    const { data, error } = await dbQuery;

    if (error) {
      console.error('[StudentsController.getStudents] DB error:', error);
      throw new AppError(500, 'DATABASE_ERROR', 'Failed to retrieve students list');
    }

    const response: ApiSuccessResponse<Student[]> = {
      success: true,
      data: (data as Student[]) || [],
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

    const response: ApiSuccessResponse<Student> = {
      success: true,
      data: data as Student,
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

    const response: ApiSuccessResponse<typeof summary> = {
      success: true,
      data: summary,
    };

    res.status(200).json(response);
  } catch (error) {
    next(error);
  }
};
