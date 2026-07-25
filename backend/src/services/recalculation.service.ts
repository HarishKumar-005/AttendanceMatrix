import { supabase } from '../config/db.js';
import { StudentSummary } from '../types/index.js';
import { notificationService } from './notification.service.js';

export class RecalculationService {
  /**
   * Recalculates the 30-day rolling window absence count and early-warning status for a given student.
   *
   * @param studentId Canonical student UUID
   * @param evaluationDate Assessment date string (YYYY-MM-DD), defaults to today
   * @param sourceRecordId Optional source attendance record ID triggering this evaluation
   */
  public async recalculateForStudent(
    studentId: string,
    evaluationDate?: string,
    sourceRecordId?: string
  ): Promise<StudentSummary> {
    const targetDateStr = evaluationDate || new Date().toISOString().slice(0, 10);
    const evalDate = new Date(targetDateStr);

    // Compute 30-day rolling start boundary (inclusive of evaluationDate)
    const startDate = new Date(evalDate);
    startDate.setDate(startDate.getDate() - 30);
    const windowStartStr = startDate.toISOString().slice(0, 10);

    // 0. Fetch previous defaulter log entry to check prior absence state for smart alert triggers
    let previousAbsenceCount: number | undefined = undefined;
    try {
      const { data: prevLog } = await supabase
        .from('defaulter_logs')
        .select('absences_last_30_days, is_defaulter')
        .eq('student_id', studentId)
        .order('evaluated_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (prevLog) {
        previousAbsenceCount = prevLog.absences_last_30_days;
      }
    } catch {
      // Ignore fallback if previous log is absent
    }

    // 1. Fetch attendance policy (fallback to defaults if policy table is not seeded)
    let threshold = 5;
    let windowDays = 30;
    let minPercentage = 75.0;
    let policyId = 1;

    try {
      const { data: policyData } = await supabase
        .from('attendance_policy')
        .select('*')
        .eq('id', 1)
        .single();

      if (policyData) {
        threshold = policyData.absence_threshold;
        windowDays = policyData.warning_window_days;
        minPercentage = Number(policyData.minimum_attendance_percentage);
        policyId = policyData.id;
      }
    } catch {
      // Use fallback defaults if policy fetch encounters an issue
    }

    // 2. Fetch student master info
    let studentName = 'Unknown Student';
    let classSection = 'N/A';

    const { data: studentData } = await supabase
      .from('students')
      .select('student_code, full_name, current_class_section')
      .eq('id', studentId)
      .single();

    if (studentData) {
      studentName = studentData.full_name;
      classSection = studentData.current_class_section;
    }

    // 3. Query all attendance records for student (overall + 30-day window)
    const { data: allRecords, error: recordsError } = await supabase
      .from('attendance_records')
      .select('*')
      .eq('student_id', studentId);

    if (recordsError) {
      console.error(`[RecalculationService] Error querying records for student ${studentId}:`, recordsError);
    }

    const attendanceHistory = allRecords || [];

    // Filter 30-day window records for early-warning evaluation
    const windowRecords = attendanceHistory.filter(
      (r) => r.attendance_date >= windowStartStr && r.attendance_date <= targetDateStr
    );

    const absencesLast30Days = windowRecords.filter((r) => r.status === 'absent').length;
    const totalDays = attendanceHistory.length;
    const presentCount = attendanceHistory.filter((r) => r.status === 'present').length;
    const absentCount = attendanceHistory.filter((r) => r.status === 'absent').length;
    const excusedCount = attendanceHistory.filter((r) => r.status === 'excused').length;

    const attendancePercentage =
      totalDays > 0
        ? Number(((presentCount / totalDays) * 100).toFixed(1))
        : 100.0;

    const isDefaulter = absencesLast30Days >= threshold;
    const warningReason = isDefaulter
      ? `Exceeded absence threshold (${absencesLast30Days}/${threshold} absences in last ${windowDays} days)`
      : `Below absence threshold (${absencesLast30Days}/${threshold} absences in last ${windowDays} days)`;

    const summary: StudentSummary = {
      student_id: studentId,
      student_name: studentName,
      student_code: studentData ? studentData.student_code : studentId,
      class_section: classSection,
      evaluation_date: targetDateStr,
      window_start: windowStartStr,
      window_end: targetDateStr,
      window_days: windowDays,
      absences_last_30_days: absencesLast30Days,
      last_30_days_absent: absencesLast30Days,
      total_considered_days: totalDays,
      total_days: totalDays,
      present_count: presentCount,
      absent_count: absentCount,
      excused_count: excusedCount,
      attendance_percentage: attendancePercentage,
      threshold_applied: threshold,
      absence_threshold: threshold,
      is_defaulter: isDefaulter,
      warning_reason: warningReason,
      evaluated_at: new Date().toISOString(),
    };

    // 4. Log calculation result to defaulter_logs for audit
    try {
      await supabase.from('defaulter_logs').insert({
        student_id: studentId,
        student_name_snapshot: studentName,
        class_section: classSection,
        policy_id: policyId,
        evaluation_date: targetDateStr,
        window_start: windowStartStr,
        window_end: targetDateStr,
        window_days: windowDays,
        absences_last_30_days: absencesLast30Days,
        total_considered_days: totalDays,
        attendance_percentage: attendancePercentage,
        threshold_absences: threshold,
        minimum_attendance_percentage: minPercentage,
        is_defaulter: isDefaulter,
        warning_reason: warningReason,
        source_record_id: sourceRecordId || null,
        evaluated_at: summary.evaluated_at,
      });
    } catch (auditErr) {
      console.warn(`[RecalculationService] Failed to write audit log to defaulter_logs:`, auditErr);
    }

    // 5. Smart Alert Trigger Integration: evaluate and create notification if state transitioned
    try {
      await notificationService.evaluateAndCreateAlert(summary, previousAbsenceCount);
    } catch (notifErr) {
      console.warn(`[RecalculationService] Alert evaluation encountered error:`, notifErr);
    }

    return summary;
  }
}

export const recalculationService = new RecalculationService();
