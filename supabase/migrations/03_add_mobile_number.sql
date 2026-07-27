-- Migration 03: Add mobile_number column to students table
alter table public.students add column if not exists mobile_number text;

comment on column public.students.mobile_number is 'Primary contact mobile number for student/guardian master record';

create index if not exists idx_students_mobile_number
  on public.students using btree (mobile_number);
