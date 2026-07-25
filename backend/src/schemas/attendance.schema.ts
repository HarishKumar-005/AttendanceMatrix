import { z } from 'zod';

export const attendanceStatusEnum = z.enum(['present', 'absent', 'excused']);

export const createRecordSchema = z.object({
  student_id: z.string({ required_error: 'student_id is required' }).min(1, 'student_id cannot be blank'),
  attendance_date: z
    .string({ required_error: 'attendance_date is required' })
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'attendance_date must be in YYYY-MM-DD format'),
  status: attendanceStatusEnum,
  reason: z.string().max(500).optional().nullable(),
  marked_by: z.string().max(150).optional().nullable(),
  class_section: z.string().max(50).optional(),
  student_name_snapshot: z.string().max(150).optional(),
});

export const updateRecordSchema = z.object({
  status: attendanceStatusEnum.optional(),
  attendance_date: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'attendance_date must be in YYYY-MM-DD format')
    .optional(),
  reason: z.string().max(500).optional().nullable(),
  marked_by: z.string().max(150).optional().nullable(),
  class_section: z.string().max(50).optional(),
});

export const recordIdParamSchema = z.object({
  id: z.string().min(1, 'Record ID is required'),
});

export const studentIdParamSchema = z.object({
  studentId: z.string().min(1, 'Student ID is required'),
});

export const getRecordsQuerySchema = z.object({
  student_id: z.string().optional(),
  class_section: z.string().optional(),
  status: attendanceStatusEnum.optional(),
  start_date: z.string().optional(),
  end_date: z.string().optional(),
  search: z.string().optional(),
  page: z.string().optional().transform((val) => (val ? parseInt(val, 10) : 1)),
  limit: z.string().optional().transform((val) => (val ? parseInt(val, 10) : 20)),
});

export type CreateAttendanceInput = z.infer<typeof createRecordSchema>;
export type UpdateAttendanceInput = z.infer<typeof updateRecordSchema>;
export type GetRecordsQueryInput = z.infer<typeof getRecordsQuerySchema>;
