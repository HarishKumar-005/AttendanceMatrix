import { z } from 'zod';

export const attendanceStatusEnum = z.enum(['present', 'absent', 'excused']);

export const createRecordSchema = z.object({
  student_id: z.string().uuid({ message: 'Invalid student ID format (must be UUID)' }),
  student_name_snapshot: z.string().min(1, { message: 'Student name snapshot is required' }),
  class_section: z.string().min(1, { message: 'Class section is required' }),
  attendance_date: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, { message: 'Attendance date must be in YYYY-MM-DD format' }),
  status: attendanceStatusEnum,
  reason: z.string().max(500, { message: 'Reason cannot exceed 500 characters' }).optional(),
  marked_by: z.string().optional(),
});

export const updateRecordSchema = createRecordSchema.partial().extend({
  id: z.string().uuid({ message: 'Invalid record ID format (must be UUID)' }),
});

export type CreateRecordInput = z.infer<typeof createRecordSchema>;
export type UpdateRecordInput = z.infer<typeof updateRecordSchema>;
