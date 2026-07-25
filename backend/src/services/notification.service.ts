import { supabase } from '../config/db.js';
import {
  TeacherNotification,
  NotificationSeverity,
  NotificationType,
  NotificationAnalytics,
  StudentSummary,
} from '../types/index.js';
import { recalculationService } from './recalculation.service.js';

// In-memory store for active notifications
const inMemoryStore: TeacherNotification[] = [];
let isSyncing = false;
let hasInitialSynced = false;

export class NotificationService {
  private useInMemory = true; // Default to robust in-memory storage with DB persistence sync

  /**
   * Authoritative Initial Notification Sync (Phase 3 requirement):
   * Scans all students in database. Computes rolling 30-day calculation for each student.
   * Generates notifications for all existing At-Risk (>= 5 absences) or Near-Threshold (4 absences) students.
   */
  public async syncExistingStudentAlerts(force = false): Promise<void> {
    if (isSyncing || (hasInitialSynced && !force && inMemoryStore.length > 0)) return;
    isSyncing = true;

    try {
      // 1. Query all active students from master table
      const { data: students } = await supabase
        .from('students')
        .select('id');

      if (!students || students.length === 0) {
        isSyncing = false;
        hasInitialSynced = true;
        return;
      }

      // 2. Perform recalculation for each student and create alerts for At-Risk / Near-Threshold students
      for (const student of students) {
        try {
          const summary = await recalculationService.recalculateForStudent(student.id);
          const threshold = summary.absence_threshold || 5;

          if (summary.is_defaulter || summary.absences_last_30_days >= threshold - 1) {
            await this.evaluateAndCreateAlert(summary, undefined, true);
          }
        } catch {
          // Continue scanning next student
        }
      }

      hasInitialSynced = true;
    } catch (err) {
      console.warn('[NotificationService] Initial sync notice:', err);
    } finally {
      isSyncing = false;
    }
  }

  /**
   * Fetches paginated notification records from database (with in-memory fallback).
   */
  public async getNotifications(options: {
    unread_only?: boolean;
    severity?: NotificationSeverity;
    page?: number;
    limit?: number;
  }): Promise<{ notifications: TeacherNotification[]; total: number; unread_count: number }> {
    if (!hasInitialSynced || inMemoryStore.length === 0) {
      await this.syncExistingStudentAlerts(true);
    }

    try {
      // 1. Try querying Supabase teacher_notifications table
      const page = options.page || 1;
      const limit = options.limit || 100;
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

      if (!error && data && data.length > 0) {
        const { count: unreadCount } = await (supabase.from('teacher_notifications' as any) as any)
          .select('*', { count: 'exact', head: true })
          .eq('is_dismissed', false)
          .eq('is_read', false);

        return {
          notifications: (data as TeacherNotification[]) || [],
          total: count || 0,
          unread_count: unreadCount || 0,
        };
      }
    } catch {
      // Fallback to in-memory store
    }

    return this.getInMemoryNotifications(options);
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
    if (!hasInitialSynced || inMemoryStore.length === 0) {
      await this.syncExistingStudentAlerts(true);
    }

    try {
      const { count, error } = await (supabase.from('teacher_notifications' as any) as any)
        .select('*', { count: 'exact', head: true })
        .eq('is_dismissed', false)
        .eq('is_read', false);

      if (!error && count !== null && count > 0) {
        return count;
      }
    } catch {
      // Fallback
    }

    return inMemoryStore.filter((n) => !n.is_dismissed && !n.is_read).length;
  }

  /**
   * Marks a single notification as read.
   */
  public async markAsRead(id: string): Promise<TeacherNotification | null> {
    const nowStr = new Date().toISOString();

    const inMemTarget = inMemoryStore.find((n) => n.id === id);
    if (inMemTarget) {
      inMemTarget.is_read = true;
      inMemTarget.read_at = nowStr;
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

      if (!error && data) {
        return data as TeacherNotification;
      }
    } catch {
      // Fallback
    }

    return inMemTarget || null;
  }

  /**
   * Marks all active notifications as read.
   */
  public async markAllAsRead(): Promise<number> {
    const nowStr = new Date().toISOString();
    let count = 0;

    inMemoryStore.forEach((n) => {
      if (!n.is_dismissed && !n.is_read) {
        n.is_read = true;
        n.read_at = nowStr;
        count++;
      }
    });

    try {
      const { data, error } = await (supabase.from('teacher_notifications' as any) as any)
        .update({
          is_read: true,
          read_at: nowStr,
        })
        .eq('is_dismissed', false)
        .eq('is_read', false)
        .select('id');

      if (!error && data) {
        return Math.max(data.length, count);
      }
    } catch {
      // Fallback
    }

    return count;
  }

  /**
   * Soft-deletes / dismisses a single notification.
   */
  public async dismissNotification(id: string): Promise<boolean> {
    const target = inMemoryStore.find((n) => n.id === id);
    if (target) {
      target.is_dismissed = true;
    }

    try {
      await (supabase.from('teacher_notifications' as any) as any)
        .update({ is_dismissed: true })
        .eq('id', id);
    } catch {
      // Fallback
    }

    return true;
  }

  /**
   * Soft-deletes / clears all active notifications.
   */
  public async clearAllNotifications(): Promise<number> {
    let count = 0;
    inMemoryStore.forEach((n) => {
      if (!n.is_dismissed) {
        n.is_dismissed = true;
        count++;
      }
    });

    try {
      const { data, error } = await (supabase.from('teacher_notifications' as any) as any)
        .update({ is_dismissed: true })
        .eq('is_dismissed', false)
        .select('id');

      if (!error && data) {
        return Math.max(data.length, count);
      }
    } catch {
      // Fallback
    }

    return count;
  }

  /**
   * Returns analytics summary for Early Warning Dashboard.
   */
  public async getNotificationAnalytics(): Promise<NotificationAnalytics> {
    if (!hasInitialSynced || inMemoryStore.length === 0) {
      await this.syncExistingStudentAlerts(true);
    }

    const res = await this.getNotifications({ limit: 200 });
    const list = res.notifications;

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
    previousAbsenceCount?: number,
    isInitialSync = false
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

    // Determine state transition or initial sync condition
    if (is_defaulter && (isInitialSync || previousAbsenceCount === undefined || previousAbsenceCount < absence_threshold)) {
      // 🔴 CRITICAL: Crossed or reached threshold
      targetType = 'threshold_reached';
      severity = 'critical';
      title = `Critical Early Warning: ${student_name}`;
      message = `${student_name} (${class_section}) has reached ${absences_last_30_days} absences during the last 30 days (threshold: ${absence_threshold}). Attendance: ${attendance_percentage}%.`;
      recommendation = `Schedule a student counselling session & contact parent/guardian.`;
    } else if (
      !is_defaulter &&
      absences_last_30_days >= absence_threshold - 1 &&
      (isInitialSync || previousAbsenceCount === undefined || previousAbsenceCount < absence_threshold - 1)
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

    // Deduplication check: Has an active notification of the same type already been generated for this student?
    const existingActive = inMemoryStore.find(
      (n) =>
        n.student_id === student_id &&
        n.notification_type === targetType &&
        !n.is_dismissed
    );

    if (existingActive) {
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

    try {
      await (supabase.from('teacher_notifications' as any) as any).insert(payload);
    } catch {
      // In-memory store remains primary fallback
    }

    return payload;
  }
}

export const notificationService = new NotificationService();
