import { z } from 'zod';
import { attendanceStatusEnum } from './attendance.schema';
export const recordQuerySchema = z.object({
    class_section: z.string().optional(),
    status: attendanceStatusEnum.optional(),
    search: z.string().optional(),
    start_date: z
        .string()
        .regex(/^\d{4}-\d{2}-\d{2}$/, { message: 'Start date must be in YYYY-MM-DD format' })
        .optional(),
    end_date: z
        .string()
        .regex(/^\d{4}-\d{2}-\d{2}$/, { message: 'End date must be in YYYY-MM-DD format' })
        .optional(),
    page: z
        .preprocess((val) => {
        if (val === undefined || val === null || val === '')
            return 1;
        const parsed = Number(val);
        return Number.isNaN(parsed) ? 1 : parsed;
    }, z.number().int().min(1).default(1))
        .default(1),
    limit: z
        .preprocess((val) => {
        if (val === undefined || val === null || val === '')
            return 20;
        const parsed = Number(val);
        return Number.isNaN(parsed) ? 20 : parsed;
    }, z.number().int().min(1).max(100).default(20))
        .default(20),
});
