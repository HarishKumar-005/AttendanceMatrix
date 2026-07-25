-- supabase/migrations/01_schema.sql
-- AttendanceMatrix initial schema
-- 3-tier architecture support:
-- React UI -> Express REST API -> Supabase PostgreSQL
--
-- Design goals:
-- - preserve historical attendance snapshots
-- - enforce data integrity at the database layer
-- - support 30-day rolling recalculation queries
-- - keep the schema simple enough for a 2-day SIH build
-- - remain friendly to Supabase type generation workflows

create extension if not exists pgcrypto;

-- ------------------------------------------------------------
-- 1) Updated-at trigger helper
-- ------------------------------------------------------------
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- ------------------------------------------------------------
-- 2) Attendance status enum
-- ------------------------------------------------------------
do $$
begin
  if not exists (
    select 1
    from pg_type t
    join pg_namespace n on n.oid = t.typnamespace
    where t.typname = 'attendance_status'
      and n.nspname = 'public'
  ) then
    execute 'create type public.attendance_status as enum (''present'', ''absent'', ''excused'')';
  end if;
end
$$;

-- ------------------------------------------------------------
-- 3) Students
-- Canonical identity table.
-- Attendance records keep snapshots so history stays stable even if
-- a student's name or section changes later.
-- ------------------------------------------------------------
create table if not exists public.students (
  id uuid primary key default gen_random_uuid(),
  student_code text not null unique,
  full_name text not null,
  current_class_section text not null,
  roll_number text,
  guardian_name text,
  guardian_phone text,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  constraint students_student_code_not_blank check (length(trim(student_code)) > 0),
  constraint students_student_code_length check (length(trim(student_code)) <= 50),
  constraint students_full_name_not_blank check (length(trim(full_name)) > 0),
  constraint students_full_name_length check (length(trim(full_name)) <= 150),
  constraint students_current_class_section_not_blank check (length(trim(current_class_section)) > 0),
  constraint students_current_class_section_length check (length(trim(current_class_section)) <= 50),
  constraint students_roll_number_length check (roll_number is null or length(trim(roll_number)) <= 50),
  constraint students_guardian_name_length check (guardian_name is null or length(trim(guardian_name)) <= 150),
  constraint students_guardian_phone_length check (guardian_phone is null or length(trim(guardian_phone)) <= 30)
);

comment on table public.students is 'Canonical student master data. Attendance records store historical snapshots for auditability.';

create index if not exists idx_students_full_name_lower
  on public.students ((lower(full_name)));

create index if not exists idx_students_current_class_section
  on public.students using btree (current_class_section);

create index if not exists idx_students_is_active
  on public.students using btree (is_active);

drop trigger if exists trg_students_updated_at on public.students;
create trigger trg_students_updated_at
before update on public.students
for each row
execute function public.set_updated_at();

-- ------------------------------------------------------------
-- 4) Attendance records
-- One row per student per date.
-- This is the primary fact table used for search, filters,
-- and the 30-day recalculation workflow.
-- ------------------------------------------------------------
create table if not exists public.attendance_records (
  id uuid primary key default gen_random_uuid(),
  record_code text not null unique,
  student_id uuid not null references public.students(id) on delete restrict,
  student_name_snapshot text not null,
  class_section text not null,
  attendance_date date not null,
  status public.attendance_status not null,
  reason text,
  marked_by text,
  source text not null default 'manual',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  constraint attendance_records_record_code_not_blank check (length(trim(record_code)) > 0),
  constraint attendance_records_record_code_length check (length(trim(record_code)) <= 50),
  constraint attendance_records_student_name_not_blank check (length(trim(student_name_snapshot)) > 0),
  constraint attendance_records_student_name_length check (length(trim(student_name_snapshot)) <= 150),
  constraint attendance_records_class_section_not_blank check (length(trim(class_section)) > 0),
  constraint attendance_records_class_section_length check (length(trim(class_section)) <= 50),
  constraint attendance_records_reason_length check (reason is null or length(trim(reason)) <= 500),
  constraint attendance_records_reason_not_blank check (reason is null or length(trim(reason)) > 0),
  constraint attendance_records_marked_by_length check (marked_by is null or length(trim(marked_by)) <= 150),
  constraint attendance_records_marked_by_not_blank check (marked_by is null or length(trim(marked_by)) > 0),
  constraint attendance_records_source_allowed check (source in ('manual', 'seed', 'import')),
  constraint uq_attendance_student_day unique (student_id, attendance_date)
);

comment on table public.attendance_records is 'Daily attendance events. One row per student per date with immutable snapshots for history.';

create index if not exists idx_attendance_records_student_date
  on public.attendance_records using btree (student_id, attendance_date desc);

create index if not exists idx_attendance_records_class_date
  on public.attendance_records using btree (class_section, attendance_date desc);

create index if not exists idx_attendance_records_date
  on public.attendance_records using btree (attendance_date desc);

create index if not exists idx_attendance_records_status_date
  on public.attendance_records using btree (status, attendance_date desc);

drop trigger if exists trg_attendance_records_updated_at on public.attendance_records;
create trigger trg_attendance_records_updated_at
before update on public.attendance_records
for each row
execute function public.set_updated_at();

-- ------------------------------------------------------------
-- 5) Attendance policy
-- Single-row configuration table for the warning rules.
-- Keeping this typed avoids parsing string settings in backend code.
-- ------------------------------------------------------------
create table if not exists public.attendance_policy (
  id smallint primary key default 1,
  absence_threshold integer not null default 5,
  warning_window_days integer not null default 30,
  minimum_attendance_percentage numeric(5,2) not null default 75.00,
  active boolean not null default true,
  updated_at timestamptz not null default now(),

  constraint attendance_policy_single_row check (id = 1),
  constraint attendance_policy_absence_threshold_nonnegative check (absence_threshold >= 0),
  constraint attendance_policy_window_days_positive check (warning_window_days >= 1 and warning_window_days <= 365),
  constraint attendance_policy_percentage_range check (minimum_attendance_percentage >= 0 and minimum_attendance_percentage <= 100)
);

comment on table public.attendance_policy is 'Single-row warning policy used by the backend for rolling attendance calculations.';

drop trigger if exists trg_attendance_policy_updated_at on public.attendance_policy;
create trigger trg_attendance_policy_updated_at
before update on public.attendance_policy
for each row
execute function public.set_updated_at();

insert into public.attendance_policy (
  id,
  absence_threshold,
  warning_window_days,
  minimum_attendance_percentage,
  active
)
values (
  1,
  5,
  30,
  75.00,
  true
)
on conflict (id) do update
set
  absence_threshold = excluded.absence_threshold,
  warning_window_days = excluded.warning_window_days,
  minimum_attendance_percentage = excluded.minimum_attendance_percentage,
  active = excluded.active,
  updated_at = now();

-- ------------------------------------------------------------
-- 6) Defaulter logs
-- Audit trail of the server-side warning evaluation.
-- Each row captures the exact policy and window used at the time
-- the warning was produced.
-- ------------------------------------------------------------
create table if not exists public.defaulter_logs (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references public.students(id) on delete restrict,
  student_name_snapshot text not null,
  class_section text not null,
  policy_id smallint not null references public.attendance_policy(id) on delete restrict,
  evaluation_date date not null,
  window_start date not null,
  window_end date not null,
  window_days integer not null,
  absences_last_30_days integer not null,
  total_considered_days integer not null,
  attendance_percentage numeric(5,2),
  threshold_absences integer not null,
  minimum_attendance_percentage numeric(5,2),
  is_defaulter boolean not null,
  warning_reason text not null,
  source_record_id uuid references public.attendance_records(id) on delete set null,
  evaluated_at timestamptz not null default now(),

  constraint defaulter_logs_student_name_not_blank check (length(trim(student_name_snapshot)) > 0),
  constraint defaulter_logs_student_name_length check (length(trim(student_name_snapshot)) <= 150),
  constraint defaulter_logs_class_section_not_blank check (length(trim(class_section)) > 0),
  constraint defaulter_logs_class_section_length check (length(trim(class_section)) <= 50),
  constraint defaulter_logs_window_valid check (window_end >= window_start),
  constraint defaulter_logs_window_days_positive check (window_days >= 1 and window_days <= 365),
  constraint defaulter_logs_absences_nonnegative check (absences_last_30_days >= 0),
  constraint defaulter_logs_total_days_nonnegative check (total_considered_days >= 0),
  constraint defaulter_logs_threshold_nonnegative check (threshold_absences >= 0),
  constraint defaulter_logs_warning_reason_not_blank check (length(trim(warning_reason)) > 0),
  constraint defaulter_logs_warning_reason_length check (length(trim(warning_reason)) <= 500),
  constraint defaulter_logs_percentage_range check (attendance_percentage is null or (attendance_percentage >= 0 and attendance_percentage <= 100)),
  constraint defaulter_logs_min_attendance_percentage_range check (minimum_attendance_percentage is null or (minimum_attendance_percentage >= 0 and minimum_attendance_percentage <= 100))
);

comment on table public.defaulter_logs is 'Historical snapshots of the backend warning evaluation for audit, demo, and verification.';

create index if not exists idx_defaulter_logs_student_evaluated
  on public.defaulter_logs using btree (student_id, evaluated_at desc);

create index if not exists idx_defaulter_logs_student_evaluation_date
  on public.defaulter_logs using btree (student_id, evaluation_date desc);

create index if not exists idx_defaulter_logs_warning_state
  on public.defaulter_logs using btree (is_defaulter);

create index if not exists idx_defaulter_logs_window
  on public.defaulter_logs using btree (window_end, window_start);

create index if not exists idx_defaulter_logs_policy_id
  on public.defaulter_logs using btree (policy_id);

-- ------------------------------------------------------------
-- 7) Optional lightweight database sanity seed
-- This is only the policy seed; attendance sample data should live
-- in a separate seed script so it can be reset independently.
-- ------------------------------------------------------------

-- End of initial schema migration