import { z } from 'zod';
export declare const attendanceStatusEnum: z.ZodEnum<["present", "absent", "excused"]>;
export declare const createRecordSchema: z.ZodObject<{
    student_id: z.ZodString;
    student_name_snapshot: z.ZodString;
    class_section: z.ZodString;
    attendance_date: z.ZodString;
    status: z.ZodEnum<["present", "absent", "excused"]>;
    reason: z.ZodOptional<z.ZodString>;
    marked_by: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    student_id: string;
    student_name_snapshot: string;
    class_section: string;
    attendance_date: string;
    status: "present" | "absent" | "excused";
    reason?: string | undefined;
    marked_by?: string | undefined;
}, {
    student_id: string;
    student_name_snapshot: string;
    class_section: string;
    attendance_date: string;
    status: "present" | "absent" | "excused";
    reason?: string | undefined;
    marked_by?: string | undefined;
}>;
export declare const updateRecordSchema: z.ZodObject<{
    student_id: z.ZodOptional<z.ZodString>;
    student_name_snapshot: z.ZodOptional<z.ZodString>;
    class_section: z.ZodOptional<z.ZodString>;
    attendance_date: z.ZodOptional<z.ZodString>;
    status: z.ZodOptional<z.ZodEnum<["present", "absent", "excused"]>>;
    reason: z.ZodOptional<z.ZodOptional<z.ZodString>>;
    marked_by: z.ZodOptional<z.ZodOptional<z.ZodString>>;
} & {
    id: z.ZodString;
}, "strip", z.ZodTypeAny, {
    id: string;
    student_id?: string | undefined;
    student_name_snapshot?: string | undefined;
    class_section?: string | undefined;
    attendance_date?: string | undefined;
    status?: "present" | "absent" | "excused" | undefined;
    reason?: string | undefined;
    marked_by?: string | undefined;
}, {
    id: string;
    student_id?: string | undefined;
    student_name_snapshot?: string | undefined;
    class_section?: string | undefined;
    attendance_date?: string | undefined;
    status?: "present" | "absent" | "excused" | undefined;
    reason?: string | undefined;
    marked_by?: string | undefined;
}>;
export type CreateRecordInput = z.infer<typeof createRecordSchema>;
export type UpdateRecordInput = z.infer<typeof updateRecordSchema>;
