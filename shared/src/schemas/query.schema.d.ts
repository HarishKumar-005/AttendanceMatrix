import { z } from 'zod';
export declare const recordQuerySchema: z.ZodObject<{
    class_section: z.ZodOptional<z.ZodString>;
    status: z.ZodOptional<z.ZodEnum<["present", "absent", "excused"]>>;
    search: z.ZodOptional<z.ZodString>;
    start_date: z.ZodOptional<z.ZodString>;
    end_date: z.ZodOptional<z.ZodString>;
    page: z.ZodDefault<z.ZodEffects<z.ZodDefault<z.ZodNumber>, number, unknown>>;
    limit: z.ZodDefault<z.ZodEffects<z.ZodDefault<z.ZodNumber>, number, unknown>>;
}, "strip", z.ZodTypeAny, {
    page: number;
    limit: number;
    class_section?: string | undefined;
    status?: "present" | "absent" | "excused" | undefined;
    search?: string | undefined;
    start_date?: string | undefined;
    end_date?: string | undefined;
}, {
    class_section?: string | undefined;
    status?: "present" | "absent" | "excused" | undefined;
    search?: string | undefined;
    start_date?: string | undefined;
    end_date?: string | undefined;
    page?: unknown;
    limit?: unknown;
}>;
export type RecordQueryInput = z.infer<typeof recordQuerySchema>;
