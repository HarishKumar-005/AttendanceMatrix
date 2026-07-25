import { z } from 'zod';
export const studentSchema = z.object({
    id: z.string().uuid({ message: 'Invalid student ID format (must be UUID)' }),
    student_code: z.string().min(1, { message: 'Student code is required' }),
    full_name: z.string().min(1, { message: 'Full name is required' }),
    current_class_section: z.string().min(1, { message: 'Current class section is required' }),
    roll_number: z.string().nullable().optional(),
    guardian_name: z.string().nullable().optional(),
    guardian_phone: z.string().nullable().optional(),
    is_active: z.boolean().default(true),
});
