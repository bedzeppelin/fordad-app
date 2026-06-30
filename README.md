# Dad's Health App — Care Admin

Admin panel implementation per `dad-health-app-logic-spec.md`, built to match the
approved `Admin Panel.dc.html` design pixel-for-pixel. Scope: the Care Admin
dashboard only (Daily Todos, Calendar, Voice Notes, Activity Log, Settings) —
Dad's companion app, push notifications, voice transcription, and PWA/APK
packaging are separate, not-yet-built parts of the spec.

## Stack

- Next.js 14 (App Router) + TypeScript
- Supabase (Postgres) via the service-role key, server-side only — nothing
  talks to Supabase directly from the browser
- bcrypt-hashed admin password, signed stateless session cookie (no sessions
  table)

## 1. Set up Supabase

1. Create a free project at [supabase.com](https://supabase.com).
2. Open the SQL Editor and run [`supabase/schema.sql`](supabase/schema.sql) once.
3. Grab your **Project URL** and **service_role key** from Project Settings → API.

## 2. Configure environment variables

```bash
cp .env.local.example .env.local
```

Fill in:

- `NEXT_PUBLIC_SUPABASE_URL` — your Supabase project URL
- `SUPABASE_SERVICE_ROLE_KEY` — the service_role key (keep secret, server-only)
- `ADMIN_SESSION_SECRET` — a random secret, e.g. `openssl rand -hex 32`

## 3. Install dependencies

```bash
npm install
```

## 4. Set the admin password

There's no signup flow — the admin password is seeded directly:

```bash
npm run seed:admin -- --password "choose-a-real-password" --name "Dad"
```

Re-run this any time to reset the password or patient name from the command line.

## 5. Run it

```bash
npm run dev
```

Visit `http://localhost:3000/admin` → redirects to the login screen → enter
the password you seeded.

## What's implemented

- **Daily Todos** — full CRUD, reorder (sort_order), icon picker, recurrence
  day toggles, soft delete (`active = false`) so historical completions stay
  intact.
- **Calendar** — read-only recurring-schedule summary (mirrors Daily Todos)
  plus full CRUD for appointments/procedures (`calendar_events`).
- **Voice Notes** — read-only list synced from `voice_notes`: full raw
  transcript, AI summary bullets, extracted fields, delete with confirmation.
  (Nothing writes to this table yet — that happens once Dad's app and the
  Gemini summarization step are built.)
- **Activity Log** — direct read of `todo_completions`, grouped by day,
  newest first.
- **Settings** — patient name and admin password, pulled out of the todo
  editor into their own page per the spec's recommendation (§4.2/§8.3).

## Open decisions from the spec (not yet resolved)

See §8 of the logic spec — Calendar List view scope, evening check-in
placement, and the health metrics log are flagged there as confirm-before-build
checkpoints and aren't built yet.
