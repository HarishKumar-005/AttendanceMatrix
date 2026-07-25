import { z } from 'zod';
export declare const studentSchema: z.ZodObject<{
    id: z.ZodString;
    student_code: z.ZodString;
    full_name: z.ZodString;
    current_class_section: z.ZodString;
    roll_number: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    guardian_name: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    guardian_phone: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    is_active: z.ZodDefault<z.ZodBoolean>;
}, "strip", z.ZodTypeAny, {
    id: string;
    student_code: string;
    full_name: string;
    current_class_section: string;
    is_active: boolean;
    roll_number?: string | null | undefined;
    guardian_name?: string | null | undefined;
    guardian_phone?: string | null | undefined;
}, {
    id: string;
    student_code: string;
    full_name: string;
    current_class_section: string;
    roll_number?: string | null | undefined;
    guardian_name?: string | null | undefined;
    guardian_phone?: string | null | undefined;
    is_active?: boolean | undefined;
}>;
export type StudentSchemaInput = z.infer<typeof studentSchema>;
