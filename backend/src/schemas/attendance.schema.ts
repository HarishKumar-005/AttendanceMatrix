import { z } from 'zod';

export const attendanceStatusEnum = z.enum(['present', 'absent', 'excused']);

export const createRecordSchema = z.object({
  // Accept either student_id (UUID) or student_code (e.g. "STU-1006") — backend resolves student_code to student_id
  student_id: z.string().min(1).optional(),
  student_code: z.string().min(1).optional(),
  // Accept either 'attendance_date' (canonical) or 'date' (form-friendly)
  attendance_date: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'attendance_date must be in YYYY-MM-DD format')
    .optional(),
  date: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'date must be in YYYY-MM-DD format')
    .optional(),
  status: attendanceStatusEnum,
  // Accept either 'reason' (canonical) or 'remarks' (form-friendly)
  reason: z.string().max(500).optional().nullable(),
  remarks: z.string().max(500).optional().nullable(),
  marked_by: z.string().max(150).optional().nullable(),
  class_section: z.string().max(50).optional(),
  // Accept either 'student_name_snapshot' (canonical) or 'student_name' (form-friendly)
  student_name_snapshot: z.string().max(150).optional(),
  student_name: z.string().max(150).optional(),
  mobile_number: z.string().max(30).optional().nullable(),
}).refine(
  (data) => Boolean(data.student_id) || Boolean(data.student_code),
  { message: 'Either student_id or student_code is required', path: ['student_id'] }
).refine(
  (data) => Boolean(data.attendance_date) || Boolean(data.date),
  { message: 'Either attendance_date or date is required', path: ['attendance_date'] }
).transform((data) => ({
  student_id: data.student_id,
  student_code: data.student_code,
  attendance_date: data.attendance_date || data.date || '',
  status: data.status,
  reason: data.reason || data.remarks || null,
  marked_by: data.marked_by || null,
  class_section: data.class_section,
  student_name_snapshot: data.student_name_snapshot || data.student_name,
  mobile_number: data.mobile_number || null,
}));


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
  classSection: z.string().optional(),
  status: z.string().optional(),
  start_date: z.string().optional(),
  startDate: z.string().optional(),
  end_date: z.string().optional(),
  endDate: z.string().optional(),
  search: z.string().optional(),
  isDefaulter: z.string().optional(),
  is_defaulter: z.string().optional(),
  page: z.string().optional().transform((val) => (val ? parseInt(val, 10) : 1)),
  limit: z.string().optional().transform((val) => (val ? parseInt(val, 10) : 20)),
});


export const getSessionQuerySchema = z.object({
  class_section: z.string({ required_error: 'class_section is required' }).min(1, 'class_section cannot be blank'),
  date: z
    .string({ required_error: 'date is required' })
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'date must be in YYYY-MM-DD format'),
  search: z.string().optional(),
});

export const updateStudentSchema = z.object({
  mobile_number: z.string().max(30).optional().nullable(),
  guardian_phone: z.string().max(30).optional().nullable(),
  guardian_name: z.string().max(150).optional().nullable(),
});

export const sessionRosterEntrySchema = z.object({
  student_id: z.string({ required_error: 'student_id is required' }).min(1),
  student_code: z.string({ required_error: 'student_code is required' }),
  student_name: z.string({ required_error: 'student_name is required' }),
  status: attendanceStatusEnum,
  remarks: z.string().max(500).optional().nullable(),
});

export const saveSessionSchema = z.object({
  class_section: z.string({ required_error: 'class_section is required' }).min(1),
  date: z
    .string({ required_error: 'date is required' })
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'date must be in YYYY-MM-DD format'),
  records: z.array(sessionRosterEntrySchema, { required_error: 'records array is required' }),
});

export type CreateAttendanceInput = z.infer<typeof createRecordSchema>;
export type UpdateAttendanceInput = z.infer<typeof updateRecordSchema>;
export type GetRecordsQueryInput = z.infer<typeof getRecordsQuerySchema>;
export type GetSessionQueryInput = z.infer<typeof getSessionQuerySchema>;
export type SaveSessionInput = z.infer<typeof saveSessionSchema>;

