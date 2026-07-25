-- supabase/migrations/02_teacher_notifications.sql
-- Teacher Notification Center & Early Warning System schema

-- 1) Create Notification Enums if not present
do $$
begin
  if not exists (select 1 from pg_type where typname = 'notification_severity') then
    create type public.notification_severity as enum ('critical', 'warning', 'recovery', 'info');
  end if;
  if not exists (select 1 from pg_type where typname = 'notification_type') then
    create type public.notification_type as enum ('threshold_reached', 'approaching_threshold', 'recovered', 'policy_updated');
  end if;
end $$;

-- 2) Create teacher_notifications Table
create table if not exists public.teacher_notifications (
  id uuid primary key default gen_random_uuid(),
  student_id uuid references public.students(id) on delete set null,
  student_name text,
  student_code text,
  class_section text,
  title text not null,
  message text not null,
  severity public.notification_severity not null default 'warning',
  notification_type public.notification_type not null default 'threshold_reached',
  is_read boolean not null default false,
  is_dismissed boolean not null default false,
  created_at timestamptz not null default now(),
  read_at timestamptz,
  metadata jsonb not null default '{}'::jsonb,
  triggered_by text not null default 'recalculation_engine',
  recommendation text,

  constraint teacher_notifications_title_not_blank check (length(trim(title)) > 0),
  constraint teacher_notifications_message_not_blank check (length(trim(message)) > 0)
);

comment on table public.teacher_notifications is 'Durable store for automated early warning alerts, recovery notifications, and teacher updates.';

-- Indexes for performance
create index if not exists idx_teacher_notifications_read_created
  on public.teacher_notifications (is_read, created_at desc);

create index if not exists idx_teacher_notifications_student
  on public.teacher_notifications (student_id, created_at desc);

create index if not exists idx_teacher_notifications_severity
  on public.teacher_notifications (severity, created_at desc);

create index if not exists idx_teacher_notifications_dismissed
  on public.teacher_notifications (is_dismissed, created_at desc);
