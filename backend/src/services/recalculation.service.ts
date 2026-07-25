import { supabase } from '../config/db.js';
import { StudentSummary } from '../types/index.js';

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
      .select('full_name, current_class_section')
      .eq('id', studentId)
      .single();

    if (studentData) {
      studentName = studentData.full_name;
      classSection = studentData.current_class_section;
    }

    // 3. Query attendance records for student within 30-day window
    const { data: records, error: recordsError } = await supabase
      .from('attendance_records')
      .select('*')
      .eq('student_id', studentId)
      .gte('attendance_date', windowStartStr)
      .lte('attendance_date', targetDateStr);

    if (recordsError) {
      console.error(`[RecalculationService] Error querying records for student ${studentId}:`, recordsError);
    }

    const attendanceHistory = records || [];
    const absencesLast30Days = attendanceHistory.filter((r) => r.status === 'absent').length;
    const presentCount = attendanceHistory.filter((r) => r.status === 'present').length;
    const totalConsideredDays = attendanceHistory.length;

    const attendancePercentage =
      totalConsideredDays > 0
        ? Number(((presentCount / totalConsideredDays) * 100).toFixed(2))
        : 100.0;

    const isDefaulter = absencesLast30Days >= threshold;
    const warningReason = isDefaulter
      ? `Exceeded absence threshold (${absencesLast30Days}/${threshold} absences in last ${windowDays} days)`
      : `Below absence threshold (${absencesLast30Days}/${threshold} absences in last ${windowDays} days)`;

    const summary: StudentSummary = {
      student_id: studentId,
      student_name: studentName,
      class_section: classSection,
      evaluation_date: targetDateStr,
      window_start: windowStartStr,
      window_end: targetDateStr,
      window_days: windowDays,
      absences_last_30_days: absencesLast30Days,
      total_considered_days: totalConsideredDays,
      attendance_percentage: attendancePercentage,
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
        total_considered_days: totalConsideredDays,
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

    return summary;
  }
}

export const recalculationService = new RecalculationService();
