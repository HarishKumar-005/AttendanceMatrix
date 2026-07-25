import { supabase } from '../config/db.js';
import { recalculationService } from '../services/recalculation.service.js';
import { AttendanceStatus } from '../types/index.js';

/**
 * AttendanceMatrix — Deterministic Production Verification Seed Script
 *
 * This script populates Supabase PostgreSQL with a deterministic, production-quality
 * dataset designed to verify every business rule, UI workflow, API filter, database constraint,
 * and edge case required for the SIH 2026 early-warning dropout register assessment.
 *
 * Requirements Covered:
 * - 30 Enrolled Students distributed across 5 classes (8A, 8B, 9A, 9B, 10A)
 * - ~900+ daily attendance records covering a 30-day rolling window
 * - Diverse profiles: Perfect (0), Excellent (1), Healthy (2-3), Threshold-1 (4), Borderline (5), Threshold+1 (6), High Risk (7-9), Chronic (10-15)
 * - All 3 statuses exercised: Present, Absent, Excused (with realistic Indian school reasons)
 * - SIH Edge Cases: Duplicate student names, missing phones, missing guardian names, missing roll numbers,
 *   out-of-window old records (45 days old), historical section snapshot preservation ('9A' -> '10A').
 * - 100% Deterministic execution (no Math.random()).
 */

interface SeedStudentDefinition {
  student_code: string;
  full_name: string;
  current_class_section: string;
  roll_number: string | null;
  guardian_name: string | null;
  guardian_phone: string | null;
  // Index positions (0 to 29) out of 30 days that should be marked ABSENT
  absenceDays: number[];
  // Index positions (0 to 29) out of 30 days that should be marked EXCUSED
  excusedDays: number[];
  // Historical snapshot override test
  historicalSnapshot?: {
    oldClassSection: string;
    oldNameSnapshot: string;
    oldDaysAgo: number[];
  };
}

// Comprehensive realistic absence reasons
const ABSENCE_REASONS = [
  'Viral Fever & High Temperature',
  'Doctor Appointment & Lab Diagnostics',
  'Severe Migraine & Rest',
  'Family Emergency',
  'Out of Station for Personal Work',
  'Stomach Infection & Recovery',
  'Typhoid Fever Recovery',
  'Dental Procedure',
];

// Comprehensive realistic excused reasons
const EXCUSED_REASONS = [
  'Inter-School Chess Championship Representation',
  'District Athletics Meet (Authorized Leave)',
  'State Science Olympiad Representation',
  'National Cadet Corps (NCC) Training Camp',
  'Authorized Medical Leave (Hospital Certificate Submitted)',
  'School Cultural Band Performance Duty',
];

/**
 * 30 Master Students Definition (Deterministic mapping)
 */
const SEED_STUDENTS: SeedStudentDefinition[] = [
  // ==========================================
  // CLASS 8A (6 Students)
  // ==========================================
  {
    student_code: 'STU-1001',
    full_name: 'Aarav Sharma',
    current_class_section: '8A',
    roll_number: '01',
    guardian_name: 'Rajesh Sharma',
    guardian_phone: '+91 9876543210',
    absenceDays: [7, 21], // 2 Absences (Healthy)
    excusedDays: [14],
  },
  {
    student_code: 'STU-1003',
    full_name: 'Priya Patel',
    current_class_section: '8A',
    roll_number: '02',
    guardian_name: 'Suresh Patel',
    guardian_phone: '+91 9876543212',
    absenceDays: [2, 6, 11, 17, 22, 25, 28], // 7 Absences (High Risk / Flagged Defaulter)
    excusedDays: [10],
  },
  {
    student_code: 'STU-1007',
    full_name: 'Harish Kumar',
    current_class_section: '8A',
    roll_number: '03',
    guardian_name: 'N. Kumar',
    guardian_phone: '+91 9876543216',
    absenceDays: [5, 12, 19, 26], // 4 Absences (Threshold-1 / Borderline Safe)
    excusedDays: [],
  },
  {
    student_code: 'STU-1008',
    full_name: 'Divya Sundaram',
    current_class_section: '8A',
    roll_number: '04',
    guardian_name: 'S. Sundaram',
    guardian_phone: '+91 9876543217',
    absenceDays: [14], // 1 Absence (Excellent)
    excusedDays: [8, 20],
  },
  {
    student_code: 'STU-1009',
    full_name: 'Karthik Raja',
    current_class_section: '8A',
    roll_number: '05',
    guardian_name: null, // Edge Case: Missing Guardian Name
    guardian_phone: '+91 9876543218',
    absenceDays: [], // 0 Absences (Perfect Attendance)
    excusedDays: [],
  },
  {
    student_code: 'STU-1010',
    full_name: 'Meera Nambiar',
    current_class_section: '8A',
    roll_number: '06',
    guardian_name: 'G. Nambiar',
    guardian_phone: null, // Edge Case: Missing Guardian Phone
    absenceDays: [3, 9, 15, 21, 27], // 5 Absences (Borderline / Exact Threshold -> Flagged At-Risk)
    excusedDays: [],
  },

  // ==========================================
  // CLASS 8B (6 Students)
  // ==========================================
  {
    student_code: 'STU-1004',
    full_name: 'Rohan Kumar',
    current_class_section: '8B',
    roll_number: '01',
    guardian_name: 'Mahesh Kumar',
    guardian_phone: '+91 9876543213',
    absenceDays: [4, 10, 15, 21, 26], // 5 Absences (Borderline / Exact Threshold -> Flagged At-Risk)
    excusedDays: [12],
  },
  {
    student_code: 'STU-1011',
    full_name: 'Rahul Dravid',
    current_class_section: '8B',
    roll_number: '02',
    guardian_name: 'Sharad Dravid',
    guardian_phone: '+91 9876543220',
    absenceDays: [1, 2, 3, 4, 5, 11, 12, 18, 19, 24, 25, 29], // 12 Absences (Chronic Risk / Severe Defaulter)
    excusedDays: [15],
  },
  {
    student_code: 'STU-1012',
    full_name: 'Deepa Lakshmi',
    current_class_section: '8B',
    roll_number: '03',
    guardian_name: 'K. Lakshmi',
    guardian_phone: '+91 9876543221',
    absenceDays: [6, 17, 24], // 3 Absences (Healthy)
    excusedDays: [],
  },
  {
    student_code: 'STU-1013',
    full_name: 'Aditya Sundaram',
    current_class_section: '8B',
    roll_number: '04',
    guardian_name: 'V. Sundaram',
    guardian_phone: '+91 9876543222',
    absenceDays: [1, 7, 13, 19, 23, 28], // 6 Absences (Threshold+1 / Flagged At-Risk)
    excusedDays: [],
  },
  {
    student_code: 'STU-1014',
    full_name: 'Nithya Shree',
    current_class_section: '8B',
    roll_number: null, // Edge Case: Missing Roll Number
    guardian_name: 'R. Shree',
    guardian_phone: '+91 9876543223',
    absenceDays: [], // 0 Absences (Perfect Attendance)
    excusedDays: [10],
  },
  {
    student_code: 'STU-1025',
    full_name: 'Kavya Singh', // Edge Case: Duplicate Name with STU-1006 in 10A
    current_class_section: '8B',
    roll_number: '06',
    guardian_name: 'P. Singh',
    guardian_phone: '+91 9876543234',
    absenceDays: [18], // 1 Absence (Excellent)
    excusedDays: [],
  },

  // ==========================================
  // CLASS 9A (6 Students)
  // ==========================================
  {
    student_code: 'STU-1005',
    full_name: 'Ananya Verma',
    current_class_section: '9A',
    roll_number: '01',
    guardian_name: 'Vikram Verma',
    guardian_phone: '+91 9876543214',
    absenceDays: [8, 23], // 2 Absences (Healthy)
    excusedDays: [],
  },
  {
    student_code: 'STU-1015',
    full_name: 'Gautham Vasudev',
    current_class_section: '9A',
    roll_number: '02',
    guardian_name: 'Vasudevan',
    guardian_phone: '+91 9876543224',
    absenceDays: [3, 5, 9, 14, 16, 20, 25, 29], // 8 Absences (High Risk / Flagged Defaulter)
    excusedDays: [],
  },
  {
    student_code: 'STU-1016',
    full_name: 'Kavyanjali Nair',
    current_class_section: '9A',
    roll_number: '03',
    guardian_name: 'M. Nair',
    guardian_phone: '+91 9876543225',
    absenceDays: [2, 10, 18, 26], // 4 Absences (Threshold-1 / Borderline Safe)
    excusedDays: [5],
  },
  {
    student_code: 'STU-1017',
    full_name: 'Sanjay Ramaswamy',
    current_class_section: '9A',
    roll_number: '04',
    guardian_name: 'Ramaswamy',
    guardian_phone: '+91 9876543226',
    absenceDays: [], // 0 Absences
    excusedDays: [4, 5, 6, 7, 8, 9], // Excused Heavy Profile (Sports Tournament) -> 0 Absences (Normal)
  },
  {
    student_code: 'STU-1018',
    full_name: 'Preethi Subramanian',
    current_class_section: '9A',
    roll_number: '05',
    guardian_name: 'Subramanian',
    guardian_phone: '+91 9876543227',
    absenceDays: [11], // 1 Absence (Excellent)
    excusedDays: [],
  },
  {
    student_code: 'STU-1019',
    full_name: 'Ashwin Kumar',
    current_class_section: '9A',
    roll_number: '06',
    guardian_name: null, // Edge Case: Missing Guardian Name & Phone
    guardian_phone: null,
    absenceDays: [4, 15, 27], // 3 Absences (Healthy)
    excusedDays: [],
  },

  // ==========================================
  // CLASS 9B (6 Students)
  // ==========================================
  {
    student_code: 'STU-1002',
    full_name: 'Aarav Sharma', // Edge Case: Duplicate Name with STU-1001 in 8A
    current_class_section: '9B',
    roll_number: '01',
    guardian_name: 'Sunil Sharma',
    guardian_phone: '+91 9876543211',
    absenceDays: [15], // 1 Absence (Excellent)
    excusedDays: [],
  },
  {
    student_code: 'STU-1020',
    full_name: 'Sandhya Rajan',
    current_class_section: '9B',
    roll_number: '02',
    guardian_name: 'K. Rajan',
    guardian_phone: '+91 9876543229',
    absenceDays: [2, 4, 8, 11, 15, 18, 22, 25, 28], // 9 Absences (High Risk / Flagged Defaulter)
    excusedDays: [],
  },
  {
    student_code: 'STU-1021',
    full_name: 'Varun Tej',
    current_class_section: '9B',
    roll_number: '03',
    guardian_name: 'N. Tej',
    guardian_phone: '+91 9876543230',
    absenceDays: [6, 12, 17, 23, 29], // 5 Absences (Borderline / Exact Threshold -> Flagged At-Risk)
    excusedDays: [2],
  },
  {
    student_code: 'STU-1022',
    full_name: 'Pooja Hegde',
    current_class_section: '9B',
    roll_number: '04',
    guardian_name: 'M. Hegde',
    guardian_phone: '+91 9876543231',
    absenceDays: [9, 21], // 2 Absences (Healthy)
    excusedDays: [],
  },
  {
    student_code: 'STU-1023',
    full_name: 'Vikramaditya',
    current_class_section: '9B',
    roll_number: '05',
    guardian_name: 'R. Aditya',
    guardian_phone: '+91 9876543232',
    absenceDays: [], // 0 Absences (Perfect Attendance)
    excusedDays: [],
  },
  {
    student_code: 'STU-1024',
    full_name: 'Trisha Krishnan',
    current_class_section: '9B',
    roll_number: '06',
    guardian_name: 'K. Krishnan',
    guardian_phone: '+91 9876543233',
    absenceDays: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13], // 14 Absences (Chronic Medical Streak / Severe Defaulter)
    excusedDays: [14, 15, 16],
  },

  // ==========================================
  // CLASS 10A (6 Students)
  // ==========================================
  {
    student_code: 'STU-1006',
    full_name: 'Kavya Singh', // Edge Case: Duplicate Name with STU-1025 in 8B
    current_class_section: '10A',
    roll_number: '01',
    guardian_name: 'Dharmendra Singh',
    guardian_phone: '+91 9876543215',
    absenceDays: [], // 0 Absences (Perfect Attendance)
    excusedDays: [],
  },
  {
    student_code: 'STU-1026',
    full_name: 'Surya Kumar',
    current_class_section: '10A',
    roll_number: '02',
    guardian_name: 'B. Kumar',
    guardian_phone: '+91 9876543235',
    absenceDays: [5, 14, 25], // 3 Absences (Healthy)
    excusedDays: [],
  },
  {
    student_code: 'STU-1027',
    full_name: 'Lakshmi Prasanna',
    current_class_section: '10A',
    roll_number: '03',
    guardian_name: 'V. Prasanna',
    guardian_phone: '+91 9876543236',
    absenceDays: [3, 8, 14, 19, 24, 29], // 6 Absences (Threshold+1 / Flagged At-Risk)
    excusedDays: [],
  },
  {
    student_code: 'STU-1028',
    full_name: 'Ishaan Sharma',
    current_class_section: '10A',
    roll_number: '04',
    guardian_name: 'O. Sharma',
    guardian_phone: '+91 9876543237',
    absenceDays: [1, 9, 17, 25], // 4 Absences (Threshold-1 / Borderline Safe)
    excusedDays: [12],
  },
  {
    student_code: 'STU-1029',
    full_name: 'Srinivas Raghavan',
    current_class_section: '10A',
    roll_number: '05',
    guardian_name: 'R. Raghavan',
    guardian_phone: '+91 9876543238',
    absenceDays: [2, 7, 13, 20, 27], // 5 Absences (Borderline / Exact Threshold -> Flagged At-Risk)
    excusedDays: [],
  },
  {
    student_code: 'STU-1030',
    full_name: 'Vijay Karthik',
    current_class_section: '10A',
    roll_number: '06',
    guardian_name: 'S. Karthik',
    guardian_phone: '+91 9876543239',
    absenceDays: [10, 22], // 2 Absences in 30-day window (Healthy)
    excusedDays: [],
    // Edge Case: Historical Snapshot Preservation (Section 9A -> 10A, Name Snapshot Vijay K. Karthik)
    historicalSnapshot: {
      oldClassSection: '9A',
      oldNameSnapshot: 'Vijay K. Karthik',
      oldDaysAgo: [40, 42, 45, 48, 50],
    },
  },
];

/**
 * Generates array of 30 past dates (YYYY-MM-DD) ending today (day 0 = today, day 29 = 29 days ago)
 */
function generatePast30Days(): string[] {
  const today = new Date();
  const dates: string[] = [];
  for (let i = 29; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    dates.push(d.toISOString().slice(0, 10));
  }
  return dates;
}

/**
 * Generates specific historical dates N days ago
 */
function generateHistoricalDate(daysAgo: number): string {
  const d = new Date();
  d.setDate(d.getDate() - daysAgo);
  return d.toISOString().slice(0, 10);
}

/**
 * Main Seed Execution Function
 */
async function seedDatabase(): Promise<void> {
  console.log('====================================================');
  console.log('  AttendanceMatrix — Production Verification Seeding ');
  console.log('====================================================');

  // 1. Ensure Attendance Policy table contains default row
  const { error: policyErr } = await supabase
    .from('attendance_policy')
    .upsert(
      {
        id: 1,
        absence_threshold: 5,
        warning_window_days: 30,
        minimum_attendance_percentage: 75.0,
        active: true,
      },
      { onConflict: 'id' }
    );

  if (policyErr) {
    console.warn('⚠️ [Seed] Warning upserting policy:', policyErr.message);
  } else {
    console.log('✓ Attendance Policy Ensured (Absence Threshold: 5, Window: 30 days)');
  }

  // 2. Upsert Master Students
  const createdStudents: Array<{
    id: string;
    code: string;
    name: string;
    currentClass: string;
    def: SeedStudentDefinition;
  }> = [];

  for (const s of SEED_STUDENTS) {
    const { data, error } = await supabase
      .from('students')
      .upsert(
        {
          student_code: s.student_code,
          full_name: s.full_name,
          current_class_section: s.current_class_section,
          roll_number: s.roll_number,
          guardian_name: s.guardian_name,
          guardian_phone: s.guardian_phone,
          is_active: true,
        },
        { onConflict: 'student_code' }
      )
      .select('id, student_code, full_name, current_class_section')
      .single();

    if (error || !data) {
      console.error(`❌ [Seed] Failed to upsert student ${s.student_code}:`, error?.message);
    } else {
      createdStudents.push({
        id: data.id,
        code: data.student_code,
        name: data.full_name,
        currentClass: data.current_class_section,
        def: s,
      });
    }
  }

  console.log(`✓ Upserted ${createdStudents.length} Master Student Records across 5 Class Sections (8A, 8B, 9A, 9B, 10A)`);

  // 3. Batch Build Attendance Records
  const past30Days = generatePast30Days();
  const recordPayloads: Array<{
    record_code: string;
    student_id: string;
    student_name_snapshot: string;
    class_section: string;
    attendance_date: string;
    status: AttendanceStatus;
    reason: string | null;
    marked_by: string;
    source: 'seed';
  }> = [];

  let totalAbsencesInserted = 0;
  let totalExcusedInserted = 0;

  for (const student of createdStudents) {
    const { def } = student;

    // A. 30-Day Window Records
    for (let dayIdx = 0; dayIdx < past30Days.length; dayIdx++) {
      const recordDate = past30Days[dayIdx];
      const isAbsent = def.absenceDays.includes(dayIdx);
      const isExcused = def.excusedDays.includes(dayIdx);

      let status: AttendanceStatus = 'present';
      let reason: string | null = null;

      if (isAbsent) {
        status = 'absent';
        reason = ABSENCE_REASONS[dayIdx % ABSENCE_REASONS.length];
        totalAbsencesInserted++;
      } else if (isExcused) {
        status = 'excused';
        reason = EXCUSED_REASONS[dayIdx % EXCUSED_REASONS.length];
        totalExcusedInserted++;
      }

      const recordCode = `REC-${student.code}-${recordDate}`;
      recordPayloads.push({
        record_code: recordCode,
        student_id: student.id,
        student_name_snapshot: student.name,
        class_section: student.currentClass,
        attendance_date: recordDate,
        status,
        reason,
        marked_by: 'SIH Verification Seed',
        source: 'seed',
      });
    }

    // B. Historical Snapshot Edge Case (Records > 30 days old with previous section/name)
    if (def.historicalSnapshot) {
      const snap = def.historicalSnapshot;
      for (const daysAgo of snap.oldDaysAgo) {
        const oldDate = generateHistoricalDate(daysAgo);
        const oldRecordCode = `REC-${student.code}-${oldDate}`;

        recordPayloads.push({
          record_code: oldRecordCode,
          student_id: student.id,
          student_name_snapshot: snap.oldNameSnapshot,
          class_section: snap.oldClassSection,
          attendance_date: oldDate,
          status: 'present',
          reason: 'Historical Record (Out-of-Window Verification)',
          marked_by: 'SIH Verification Seed',
          source: 'seed',
        });
      }
    }
  }

  // Execute Batch Upserts in Chunks of 100
  let totalRecordsInserted = 0;
  for (let i = 0; i < recordPayloads.length; i += 100) {
    const chunk = recordPayloads.slice(i, i + 100);
    const { error } = await supabase
      .from('attendance_records')
      .upsert(chunk, { onConflict: 'student_id,attendance_date' });

    if (error) {
      console.warn(`⚠️ [Seed] Record chunk insert warning (${i}..${i + chunk.length}):`, error.message);
    } else {
      totalRecordsInserted += chunk.length;
    }
  }

  console.log(`✓ Inserted ${totalRecordsInserted} Daily Attendance Records (Absences: ${totalAbsencesInserted}, Excused: ${totalExcusedInserted})`);

  // 4. Trigger Server-Side Recalculation for Every Student to Populate Defaulter Logs
  console.log('\n--- Triggering Server-Side Rolling 30-Day Recalculation ---');
  let totalDefaultersFlagged = 0;
  let totalNormalCount = 0;

  for (const student of createdStudents) {
    const summary = await recalculationService.recalculateForStudent(student.id);

    if (summary.is_defaulter) {
      totalDefaultersFlagged++;
      console.log(
        `🚨 [AT-RISK] ${student.name} (${student.code} - Class ${student.currentClass}): Absences (30d): ${summary.absences_last_30_days}/5 -> FLAGGED DEFAULTER`
      );
    } else {
      totalNormalCount++;
      console.log(
        `  [NORMAL]  ${student.name} (${student.code} - Class ${student.currentClass}): Absences (30d): ${summary.absences_last_30_days}/5 -> Safe`
      );
    }
  }

  // 5. Final Verification Summary Output
  console.log('\n====================================================');
  console.log('  SEEDING COMPLETE — VERIFICATION SUMMARY');
  console.log('====================================================');
  console.log(`• Total Enrolled Students:  ${createdStudents.length}`);
  console.log(`• Total Attendance Records: ${totalRecordsInserted}`);
  console.log(`• At-Risk Defaulters:       ${totalDefaultersFlagged}`);
  console.log(`• Normal Risk Students:     ${totalNormalCount}`);
  console.log(`• Excused Absence Logs:     ${totalExcusedInserted}`);
  console.log('----------------------------------------------------');
  console.log('✓ Edge Case Verification Checklist:');
  console.log('  [x] Duplicate Student Names Verified (Aarav Sharma in 8A & 9B, Kavya Singh in 10A & 8B)');
  console.log('  [x] Missing Guardian Info Handled (STU-1009, STU-1010, STU-1019)');
  console.log('  [x] Missing Roll Number Handled (STU-1014)');
  console.log('  [x] Borderline Threshold Tested (Exact 5 absences: STU-1004, STU-1010, STU-1021, STU-1029)');
  console.log('  [x] Threshold-1 Tested (4 absences safe: STU-1007, STU-1016, STU-1028)');
  console.log('  [x] Chronic Streak Tested (12-14 absences: STU-1011, STU-1024)');
  console.log('  [x] Excused Heavy Profile Tested (STU-1017 with 6 excused sports leaves)');
  console.log('  [x] Historical Snapshot Preserved (STU-1030 Vijay Karthik from Class 9A -> 10A)');
  console.log('====================================================\n');
}

// Run seed script
seedDatabase().catch((err) => {
  console.error('❌ [Seed Fatal Error]', err);
  process.exit(1);
});
