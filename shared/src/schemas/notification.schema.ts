import { z } from 'zod';

export const notificationQuerySchema = z.object({
  unread_only: z
    .string()
    .optional()
    .transform((val) => val === 'true'),
  severity: z
    .enum(['critical', 'warning', 'recovery', 'info'])
    .optional(),
  page: z
    .string()
    .optional()
    .transform((val) => (val ? parseInt(val, 10) : 1)),
  limit: z
    .string()
    .optional()
    .transform((val) => (val ? parseInt(val, 10) : 20)),
});

export type NotificationQueryInput = z.infer<typeof notificationQuerySchema>;

export const notificationIdParamSchema = z.object({
  id: z.string().uuid('Invalid notification ID format'),
});

export type NotificationIdParamInput = z.infer<typeof notificationIdParamSchema>;
