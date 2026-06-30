-- Dad's Health App — Supabase schema
-- Run this once against a fresh Supabase project (SQL Editor -> New query -> paste -> Run).
--
-- Access model: every table has Row Level Security enabled with NO policies.
-- That means the anon/authenticated roles get zero access by default; only
-- the service_role key (used exclusively by Next.js server-side API routes)
-- can read/write. Nothing talks to Supabase directly from the browser.

create extension if not exists pgcrypto;

-- ─────────────────────────────────────────────────────────────────────────
-- todos — recurring daily tasks, admin-editable
-- ─────────────────────────────────────────────────────────────────────────
create table if not exists todos (
  id               uuid primary key default gen_random_uuid(),
  title            text not null,
  short_title      text,                      -- compact label for lists/admin (falls back to title)
  description      text,
  category_label   text,                      -- e.g. "Morning", "Hydration"
  icon             text not null default 'pill',  -- pill | water | bowl | walk | phone
  hint             text,                      -- estimated-time text, e.g. "About 2 minutes"
  scheduled_time   time not null,
  recurrence_days  text[] not null default '{Mo,Tu,We,Th,Fr,Sa,Su}'
                     constraint todos_recurrence_days_valid
                     check (recurrence_days <@ array['Mo','Tu','We','Th','Fr','Sa','Su']::text[]),
  sort_order       integer not null default 0,
  active           boolean not null default true,  -- soft delete
  created_at       timestamptz not null default now()
);
create index if not exists todos_active_sort_idx on todos (active, sort_order);

-- ─────────────────────────────────────────────────────────────────────────
-- todo_completions — log of what Dad actually did
-- ─────────────────────────────────────────────────────────────────────────
create table if not exists todo_completions (
  id            uuid primary key default gen_random_uuid(),
  todo_id       uuid not null references todos(id) on delete cascade,
  completed_at  timestamptz not null default now(),
  date          date not null default current_date
);
create index if not exists todo_completions_todo_date_idx on todo_completions (todo_id, date);
create index if not exists todo_completions_date_idx on todo_completions (date);

-- ─────────────────────────────────────────────────────────────────────────
-- water_intake
-- ─────────────────────────────────────────────────────────────────────────
create table if not exists water_intake (
  id               uuid primary key default gen_random_uuid(),
  date             date not null unique,
  count            integer not null default 0,
  target           integer not null default 8,
  last_updated_at  timestamptz
);

-- ─────────────────────────────────────────────────────────────────────────
-- mood_checkins — Home screen "How are you feeling?" prompt
-- ─────────────────────────────────────────────────────────────────────────
create type mood_type as enum ('great', 'good', 'okay', 'low');

create table if not exists mood_checkins (
  id            uuid primary key default gen_random_uuid(),
  date          date not null unique,
  mood          mood_type not null,
  submitted_at  timestamptz not null default now()
);

-- ─────────────────────────────────────────────────────────────────────────
-- daily_checkins — Reports tab end-of-day health questions
-- ─────────────────────────────────────────────────────────────────────────
create type energy_level_type as enum ('low', 'medium', 'high');
create type pain_level_type as enum ('none', 'mild', 'significant');
create type quality_level_type as enum ('poor', 'fair', 'good'); -- used for sleep_quality and rested_feeling

create table if not exists daily_checkins (
  id                 uuid primary key default gen_random_uuid(),
  date               date not null unique,
  overall_day_rating smallint check (overall_day_rating between 1 and 5),
  energy_level       energy_level_type,
  pain_discomfort    pain_level_type,
  sleep_quality      quality_level_type,
  felt_unwell        boolean,
  felt_nauseous      boolean,
  dropping_things    boolean,
  rested_feeling     quality_level_type,
  submitted_at       timestamptz not null default now()
);

-- ─────────────────────────────────────────────────────────────────────────
-- voice_notes
-- ─────────────────────────────────────────────────────────────────────────
create table if not exists voice_notes (
  id               uuid primary key default gen_random_uuid(),
  date             date not null default current_date,
  recorded_at      timestamptz not null default now(),
  raw_transcript   text not null default '',
  summary_bullets  text[] not null default '{}',
  extracted_fields jsonb not null default '{}'::jsonb,
  shared           boolean not null default false
);
create index if not exists voice_notes_date_idx on voice_notes (date);
create index if not exists voice_notes_recorded_at_idx on voice_notes (recorded_at desc);

-- ─────────────────────────────────────────────────────────────────────────
-- calendar_events — admin-added appointments/procedures
-- ─────────────────────────────────────────────────────────────────────────
create type calendar_event_type as enum ('appointment', 'procedure', 'therapy', 'other');

create table if not exists calendar_events (
  id          uuid primary key default gen_random_uuid(),
  title       text not null,
  type        calendar_event_type not null default 'appointment',
  date        date not null,
  time        time not null,
  notes       text,
  created_by  text not null default 'admin',
  created_at  timestamptz not null default now()
);
create index if not exists calendar_events_date_idx on calendar_events (date, time);

-- ─────────────────────────────────────────────────────────────────────────
-- push_subscriptions
-- ─────────────────────────────────────────────────────────────────────────
create table if not exists push_subscriptions (
  id            uuid primary key default gen_random_uuid(),
  endpoint      text not null unique,
  keys          jsonb not null,
  device_label  text,
  role          text not null default 'dad' check (role in ('dad', 'admin')),
  created_at    timestamptz not null default now()
);

-- ─────────────────────────────────────────────────────────────────────────
-- push_notification_log — dedupes reminder/escalation/alert sends across
-- the cron job's repeated runs (every few minutes).
-- ─────────────────────────────────────────────────────────────────────────
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

-- ─────────────────────────────────────────────────────────────────────────
-- admin_settings — single-row settings table
-- ─────────────────────────────────────────────────────────────────────────
create table if not exists admin_settings (
  id                  smallint primary key default 1 check (id = 1),
  admin_password_hash text not null,
  patient_name        text not null default 'Dad'
);

-- ─────────────────────────────────────────────────────────────────────────
-- Row Level Security — lock every table to the service role only.
-- ─────────────────────────────────────────────────────────────────────────
alter table push_notification_log enable row level security;
alter table todos              enable row level security;
alter table todo_completions   enable row level security;
alter table water_intake       enable row level security;
alter table mood_checkins      enable row level security;
alter table daily_checkins     enable row level security;
alter table voice_notes        enable row level security;
alter table calendar_events    enable row level security;
alter table push_subscriptions enable row level security;
alter table admin_settings     enable row level security;
