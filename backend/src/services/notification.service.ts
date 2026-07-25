import { supabase } from '../config/db.js';
import {
  TeacherNotification,
  NotificationSeverity,
  NotificationType,
  NotificationAnalytics,
  StudentSummary,
} from '../types/index.js';

// In-memory fallback store for offline/unmigrated Supabase environments
const inMemoryStore: TeacherNotification[] = [
  {
    id: 'notif-seed-1',
    student_id: 'stu-1027',
    student_name: 'Lakshmi Prasanna',
    student_code: 'STU-1027',
    class_section: '10A',
    title: 'Critical Early Warning: Lakshmi Prasanna',
    message: 'Lakshmi Prasanna (10A) has reached 5 absences during the last 30 days (threshold: 5). Attendance: 72.0%.',
    severity: 'critical',
    notification_type: 'threshold_reached',
    is_read: false,
    is_dismissed: false,
    created_at: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
    read_at: null,
    metadata: { absences_last_30_days: 5, threshold: 5, attendance_percentage: 72.0, is_defaulter: true },
    triggered_by: 'recalculation_engine',
    recommendation: 'Schedule a student counselling session & contact parent/guardian.',
  },
  {
    id: 'notif-seed-2',
    student_id: 'stu-1029',
    student_name: 'Srinivas Raghavan',
    student_code: 'STU-1029',
    class_section: '10A',
    title: 'Approaching Threshold: Srinivas Raghavan',
    message: 'Srinivas Raghavan (10A) has reached 4 absences in the last 30 days (1 away from threshold of 5).',
    severity: 'warning',
    notification_type: 'approaching_threshold',
    is_read: false,
    is_dismissed: false,
    created_at: new Date(Date.now() - 45 * 60 * 1000).toISOString(),
    read_at: null,
    metadata: { absences_last_30_days: 4, threshold: 5, attendance_percentage: 78.5, is_defaulter: false },
    triggered_by: 'recalculation_engine',
    recommendation: 'Issue an informal attendance reminder and verify reason for recent absence.',
  },
];

export class NotificationService {
  private useInMemory = false;

  /**
   * Fetches paginated notification records from database (with in-memory fallback).
   */
  public async getNotifications(options: {
    unread_only?: boolean;
    severity?: NotificationSeverity;
    page?: number;
    limit?: number;
  }): Promise<{ notifications: TeacherNotification[]; total: number; unread_count: number }> {
    if (this.useInMemory) {
      return this.getInMemoryNotifications(options);
    }

    try {
      const page = options.page || 1;
      const limit = options.limit || 20;
      const offset = (page - 1) * limit;

      let query = (supabase.from('teacher_notifications' as any) as any)
        .select('*', { count: 'exact' })
        .eq('is_dismissed', false);

      if (options.unread_only) {
        query = query.eq('is_read', false);
      }

      if (options.severity) {
        query = query.eq('severity', options.severity);
      }

      query = query.order('created_at', { ascending: false }).range(offset, offset + limit - 1);

      const { data, count, error } = await query;

      if (error) {
        if (error.message.includes('schema cache') || error.code === 'PGRST205' || error.code === '42P01') {
          console.warn('[NotificationService] Supabase teacher_notifications table missing. Falling back to in-memory store.');
          this.useInMemory = true;
          return this.getInMemoryNotifications(options);
        }
        throw new Error(`Failed to fetch notifications: ${error.message}`);
      }

      const { count: unreadCount } = await (supabase.from('teacher_notifications' as any) as any)
        .select('*', { count: 'exact', head: true })
        .eq('is_dismissed', false)
        .eq('is_read', false);

      return {
        notifications: (data as TeacherNotification[]) || [],
        total: count || 0,
        unread_count: unreadCount || 0,
      };
    } catch (err: any) {
      if (err.message && err.message.includes('schema cache')) {
        this.useInMemory = true;
        return this.getInMemoryNotifications(options);
      }
      throw err;
    }
  }

  private getInMemoryNotifications(options: {
    unread_only?: boolean;
    severity?: NotificationSeverity;
    page?: number;
    limit?: number;
  }) {
    let list = inMemoryStore.filter((n) => !n.is_dismissed);
    if (options.unread_only) {
      list = list.filter((n) => !n.is_read);
    }
    if (options.severity) {
      list = list.filter((n) => n.severity === options.severity);
    }
    const unreadCount = inMemoryStore.filter((n) => !n.is_dismissed && !n.is_read).length;
    return {
      notifications: list,
      total: list.length,
      unread_count: unreadCount,
    };
  }

  /**
   * Fast unread count query.
   */
  public async getUnreadCount(): Promise<number> {
    if (this.useInMemory) {
      return inMemoryStore.filter((n) => !n.is_dismissed && !n.is_read).length;
    }

    try {
      const { count, error } = await (supabase.from('teacher_notifications' as any) as any)
        .select('*', { count: 'exact', head: true })
        .eq('is_dismissed', false)
        .eq('is_read', false);

      if (error) {
        this.useInMemory = true;
        return inMemoryStore.filter((n) => !n.is_dismissed && !n.is_read).length;
      }

      return count || 0;
    } catch {
      this.useInMemory = true;
      return inMemoryStore.filter((n) => !n.is_dismissed && !n.is_read).length;
    }
  }

  /**
   * Marks a single notification as read.
   */
  public async markAsRead(id: string): Promise<TeacherNotification | null> {
    const nowStr = new Date().toISOString();

    if (this.useInMemory) {
      const target = inMemoryStore.find((n) => n.id === id);
      if (target) {
        target.is_read = true;
        target.read_at = nowStr;
        return target;
      }
      return null;
    }

    try {
      const { data, error } = await (supabase.from('teacher_notifications' as any) as any)
        .update({
          is_read: true,
          read_at: nowStr,
        })
        .eq('id', id)
        .select()
        .single();

      if (error) {
        const target = inMemoryStore.find((n) => n.id === id);
        if (target) {
          target.is_read = true;
          target.read_at = nowStr;
          return target;
        }
      }

      return data as TeacherNotification;
    } catch {
      const target = inMemoryStore.find((n) => n.id === id);
      if (target) {
        target.is_read = true;
        target.read_at = nowStr;
        return target;
      }
      return null;
    }
  }

  /**
   * Marks all active notifications as read.
   */
  public async markAllAsRead(): Promise<number> {
    const nowStr = new Date().toISOString();

    if (this.useInMemory) {
      let count = 0;
      inMemoryStore.forEach((n) => {
        if (!n.is_dismissed && !n.is_read) {
          n.is_read = true;
          n.read_at = nowStr;
          count++;
        }
      });
      return count;
    }

    try {
      const { data, error } = await (supabase.from('teacher_notifications' as any) as any)
        .update({
          is_read: true,
          read_at: nowStr,
        })
        .eq('is_dismissed', false)
        .eq('is_read', false)
        .select('id');

      if (error) {
        let count = 0;
        inMemoryStore.forEach((n) => {
          if (!n.is_dismissed && !n.is_read) {
            n.is_read = true;
            n.read_at = nowStr;
            count++;
          }
        });
        return count;
      }

      return data ? data.length : 0;
    } catch {
      let count = 0;
      inMemoryStore.forEach((n) => {
        if (!n.is_dismissed && !n.is_read) {
          n.is_read = true;
          n.read_at = nowStr;
          count++;
        }
      });
      return count;
    }
  }

  /**
   * Soft-deletes / dismisses a single notification.
   */
  public async dismissNotification(id: string): Promise<boolean> {
    if (this.useInMemory) {
      const target = inMemoryStore.find((n) => n.id === id);
      if (target) {
        target.is_dismissed = true;
      }
      return true;
    }

    try {
      await (supabase.from('teacher_notifications' as any) as any)
        .update({ is_dismissed: true })
        .eq('id', id);

      const target = inMemoryStore.find((n) => n.id === id);
      if (target) {
        target.is_dismissed = true;
      }

      return true;
    } catch {
      const target = inMemoryStore.find((n) => n.id === id);
      if (target) {
        target.is_dismissed = true;
      }
      return true;
    }
  }

  /**
   * Soft-deletes / clears all active notifications.
   */
  public async clearAllNotifications(): Promise<number> {
    if (this.useInMemory) {
      let count = 0;
      inMemoryStore.forEach((n) => {
        if (!n.is_dismissed) {
          n.is_dismissed = true;
          count++;
        }
      });
      return count;
    }

    try {
      const { data, error } = await (supabase.from('teacher_notifications' as any) as any)
        .update({ is_dismissed: true })
        .eq('is_dismissed', false)
        .select('id');

      if (error) {
        let count = 0;
        inMemoryStore.forEach((n) => {
          if (!n.is_dismissed) {
            n.is_dismissed = true;
            count++;
          }
        });
        return count;
      }

      return data ? data.length : 0;
    } catch {
      let count = 0;
      inMemoryStore.forEach((n) => {
        if (!n.is_dismissed) {
          n.is_dismissed = true;
          count++;
        }
      });
      return count;
    }
  }

  /**
   * Returns analytics summary for Early Warning Dashboard.
   */
  public async getNotificationAnalytics(): Promise<NotificationAnalytics> {
    const list = this.useInMemory ? inMemoryStore.filter((n) => !n.is_dismissed) : (await this.getNotifications({})).notifications;

    const unreadCount = list.filter((n) => !n.is_read).length;
    const criticalCount = list.filter((n) => n.severity === 'critical').length;
    const warningCount = list.filter((n) => n.severity === 'warning').length;
    const recoveryCount = list.filter((n) => n.severity === 'recovery').length;
    const nearThreshold = list.filter((n) => n.notification_type === 'approaching_threshold').length;
    const recentlyFlagged = list.filter((n) => n.notification_type === 'threshold_reached').length;
    const recovered = list.filter((n) => n.notification_type === 'recovered').length;

    return {
      unread_count: unreadCount,
      critical_count: criticalCount,
      warning_count: warningCount,
      recovery_count: recoveryCount,
      total_active_alerts: list.length,
      students_near_threshold_count: nearThreshold,
      recently_flagged_count: recentlyFlagged,
      recovered_students_count: recovered,
    };
  }

  /**
   * Smart Alert Evaluation & Deduplication.
   *
   * Evaluates student's current recalculation summary against previous state.
   * Creates a notification ONLY when risk status transitions or threshold boundaries change.
   */
  public async evaluateAndCreateAlert(
    summary: StudentSummary,
    previousAbsenceCount?: number
  ): Promise<TeacherNotification | null> {
    const {
      student_id,
      student_name,
      student_code,
      class_section,
      absences_last_30_days,
      absence_threshold,
      attendance_percentage,
      is_defaulter,
    } = summary;

    let targetType: NotificationType | null = null;
    let severity: NotificationSeverity = 'info';
    let title = '';
    let message = '';
    let recommendation = '';

    // Determine state transition
    if (is_defaulter && (previousAbsenceCount === undefined || previousAbsenceCount < absence_threshold)) {
      // 🔴 CRITICAL: Crossed or reached threshold
      targetType = 'threshold_reached';
      severity = 'critical';
      title = `Critical Early Warning: ${student_name}`;
      message = `${student_name} (${class_section}) has reached ${absences_last_30_days} absences during the last 30 days (threshold: ${absence_threshold}). Attendance: ${attendance_percentage}%.`;
      recommendation = `Schedule a student counselling session & contact parent/guardian.`;
    } else if (
      !is_defaulter &&
      absences_last_30_days === absence_threshold - 1 &&
      (previousAbsenceCount === undefined || previousAbsenceCount < absence_threshold - 1)
    ) {
      // 🟠 WARNING: Approaching threshold (1 away)
      targetType = 'approaching_threshold';
      severity = 'warning';
      title = `Approaching Threshold: ${student_name}`;
      message = `${student_name} (${class_section}) has reached ${absences_last_30_days} absences in the last 30 days (1 away from threshold of ${absence_threshold}).`;
      recommendation = `Issue an informal attendance reminder and verify reason for recent absence.`;
    } else if (
      !is_defaulter &&
      previousAbsenceCount !== undefined &&
      previousAbsenceCount >= absence_threshold
    ) {
      // 🟢 RECOVERY: Recovered below threshold
      targetType = 'recovered';
      severity = 'recovery';
      title = `Risk Recovery: ${student_name}`;
      message = `${student_name} (${class_section}) improved attendance and is no longer at-risk (${absences_last_30_days}/${absence_threshold} absences in last 30 days).`;
      recommendation = `Acknowledge student progress and update guidance records.`;
    }

    if (!targetType) {
      return null;
    }

    // Deduplication check: Has a notification of the same type been generated for this student in the last 24h?
    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).getTime();
    const existingRecent = inMemoryStore.find(
      (n) =>
        n.student_id === student_id &&
        n.notification_type === targetType &&
        new Date(n.created_at).getTime() >= twentyFourHoursAgo
    );

    if (existingRecent) {
      return null;
    }

    const payload: TeacherNotification = {
      id: `notif-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      student_id,
      student_name,
      student_code: student_code || null,
      class_section,
      title,
      message,
      severity,
      notification_type: targetType,
      is_read: false,
      is_dismissed: false,
      created_at: new Date().toISOString(),
      read_at: null,
      triggered_by: 'recalculation_engine',
      recommendation,
      metadata: {
        absences_last_30_days,
        threshold: absence_threshold,
        attendance_percentage,
        is_defaulter,
        evaluation_date: summary.evaluation_date,
      },
    };

    inMemoryStore.unshift(payload);

    if (!this.useInMemory) {
      try {
        await (supabase.from('teacher_notifications' as any) as any).insert(payload);
      } catch {
        this.useInMemory = true;
      }
    }

    return payload;
  }
}

export const notificationService = new NotificationService();
