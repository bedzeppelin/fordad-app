-- Run this once in the Supabase SQL Editor (after the base schema.sql).
-- Tracks which reminder/escalation/admin-alert/mood/check-in pushes have
-- already been sent so the cron job (which runs every few minutes) doesn't
-- send duplicates.

create table if not exists push_notification_log (
  id                uuid primary key default gen_random_uuid(),
  date              date not null,
  notification_type text not null check (
    notification_type in ('reminder', 'escalation_1', 'escalation_2', 'admin_alert', 'mood_reminder', 'checkin_reminder')
  ),
  -- todo id for task-related notifications; 'mood' or 'checkin' sentinel for the daily reminders.
  target_id         text not null default 'none',
  sent_at           timestamptz not null default now(),
  unique (date, notification_type, target_id)
);

create index if not exists push_notification_log_date_idx on push_notification_log (date);

alter table push_notification_log enable row level security;
