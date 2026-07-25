import { supabase } from '../config/db.js';
import { recalculationService } from '../services/recalculation.service.js';

interface SeedStudent {
  student_code: string;
  full_name: string;
  current_class_section: string;
  roll_number: string;
  guardian_name: string;
  guardian_phone: string;
}

const SAMPLE_STUDENTS: SeedStudent[] = [
  {
    student_code: 'STU-1001',
    full_name: 'Aarav Sharma',
    current_class_section: '8A',
    roll_number: '01',
    guardian_name: 'Rajesh Sharma',
    guardian_phone: '+91 9876543210',
  },
  {
    // Duplicate Name Edge Case (Different Student ID, Code, and Class)
    student_code: 'STU-1002',
    full_name: 'Aarav Sharma',
    current_class_section: '9B',
    roll_number: '04',
    guardian_name: 'Sunil Sharma',
    guardian_phone: '+91 9876543211',
  },
  {
    // High Risk / Threshold Exceeded Case (6 Absences)
    student_code: 'STU-1003',
    full_name: 'Priya Patel',
    current_class_section: '8A',
    roll_number: '12',
    guardian_name: 'Suresh Patel',
    guardian_phone: '+91 9876543212',
  },
  {
    // Borderline Threshold Case (Exactly 5 Absences)
    student_code: 'STU-1004',
    full_name: 'Rohan Kumar',
    current_class_section: '8B',
    roll_number: '18',
    guardian_name: 'Mahesh Kumar',
    guardian_phone: '+91 9876543213',
  },
  {
    // Low Absence / Healthy Attendance (2 Absences)
    student_code: 'STU-1005',
    full_name: 'Ananya Verma',
    current_class_section: '9A',
    roll_number: '05',
    guardian_name: 'Vikram Verma',
    guardian_phone: '+91 9876543214',
  },
  {
    // Perfect Attendance (0 Absences)
    student_code: 'STU-1006',
    full_name: 'Kavya Singh',
    current_class_section: '10A',
    roll_number: '09',
    guardian_name: 'Dharmendra Singh',
    guardian_phone: '+91 9876543215',
  },
];

async function seed() {
  console.log('--- Starting AttendanceMatrix Database Seeding ---');

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
    console.warn('[Seed] Warning upserting policy:', policyErr.message);
  } else {
    console.log('✓ Attendance policy ensured (Threshold: 5 absences / 30 days)');
  }

  // 2. Upsert Students
  const createdStudents: { id: string; code: string; name: string; class: string }[] = [];

  for (const s of SAMPLE_STUDENTS) {
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
      console.error(`[Seed] Failed to upsert student ${s.student_code}:`, error?.message);
    } else {
      createdStudents.push({
        id: data.id,
        code: data.student_code,
        name: data.full_name,
        class: data.current_class_section,
      });
      console.log(`✓ Upserted Student: [${data.student_code}] ${data.full_name} (${data.current_class_section})`);
    }
  }

  // Generate date array for the past 30 days
  const today = new Date();
  const past30Days: string[] = [];
  for (let i = 29; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    past30Days.push(d.toISOString().slice(0, 10));
  }

  // Pattern of absence indices out of 30 days for target test cases:
  // STU-1001 (Aarav Sharma 8A): 3 absences (days 5, 12, 20)
  // STU-1002 (Aarav Sharma 9B - Duplicate name): 1 absence (day 15)
  // STU-1003 (Priya Patel 8A - Exceeded threshold): 6 absences (days 2, 6, 11, 17, 22, 27)
  // STU-1004 (Rohan Kumar 8B - Borderline threshold): 5 absences (days 4, 10, 15, 21, 26)
  // STU-1005 (Ananya Verma 9A): 2 absences (days 8, 23)
  // STU-1006 (Kavya Singh 10A): 0 absences (perfect)
  const absenceMap: Record<string, number[]> = {
    'STU-1001': [5, 12, 20],
    'STU-1002': [15],
    'STU-1003': [2, 6, 11, 17, 22, 27],
    'STU-1004': [4, 10, 15, 21, 26],
    'STU-1005': [8, 23],
    'STU-1006': [],
  };

  // 3. Upsert historical attendance records
  let totalRecordsInserted = 0;

  for (const student of createdStudents) {
    const absenceIndices = absenceMap[student.code] || [5];

    for (let dayIdx = 0; dayIdx < past30Days.length; dayIdx++) {
      const recordDate = past30Days[dayIdx];
      const isAbsent = absenceIndices.includes(dayIdx);
      const status: 'present' | 'absent' = isAbsent ? 'absent' : 'present';
      const reason = isAbsent ? 'Fever / Unwell' : null;
      const recordCode = `REC-${student.code}-${recordDate}`;

      const { error } = await supabase
        .from('attendance_records')
        .upsert(
          {
            record_code: recordCode,
            student_id: student.id,
            student_name_snapshot: student.name,
            class_section: student.class,
            attendance_date: recordDate,
            status,
            reason,
            marked_by: 'Seed Script',
            source: 'seed',
          },
          { onConflict: 'student_id,attendance_date' }
        );

      if (error) {
        console.warn(`[Seed] Record insert warning for ${student.code} on ${recordDate}:`, error.message);
      } else {
        totalRecordsInserted++;
      }
    }

    // 4. Trigger 30-day rolling recalculation for each student
    const summary = await recalculationService.recalculateForStudent(student.id);
    console.log(
      `✓ Recalculated ${student.name} [${student.code}]: Absences (30d): ${summary.absences_last_30_days}, Defaulter: ${summary.is_defaulter ? 'YES (FLAGGED)' : 'NO'}`
    );
  }

  console.log(`\n--- Seeding Complete: Inserted ${totalRecordsInserted} attendance records across ${createdStudents.length} students ---`);
}

seed().catch((err) => {
  console.error('[Seed Error]', err);
  process.exit(1);
});
