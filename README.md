# Dad's Health App

Implementation of `dad-health-app-logic-spec.md`, matching the approved
`Admin Panel.dc.html` and `Daily Companion.dc.html` designs.

## Two experiences, one codebase

- **`/` — Dad's companion app.** No login. Home, Todos (one-task-at-a-time),
  Calendar (Week/List), Reports (streak + daily check-in), Voice Notes. This
  is what gets packaged as the installable APK.
- **`/admin` — Care Admin.** Password-protected dashboard for managing the
  daily todo list, appointments, reviewing voice notes, and the activity log.

## Stack

- Next.js 14 (App Router) + TypeScript
- Supabase (Postgres), accessed only via server-side API routes using the
  service-role key — nothing talks to Supabase directly from the browser
- Web Speech API for in-browser transcription (Chrome/Safari)
- Gemini Flash for voice note summarization, with a heuristic fallback if no
  API key is configured
- PWA: manifest + service worker (offline shell caching). Push notifications
  are **not** wired up yet — see "Not built yet" below.

## 1. Set up Supabase

1. Create a free project at [supabase.com](https://supabase.com).
2. Open the SQL Editor and run [`supabase/schema.sql`](supabase/schema.sql) once.
3. Grab your **Project URL** and **service_role key** from Project Settings → API.

## 2. Configure environment variables

```bash
cp .env.local.example .env.local
```

Fill in `NEXT_PUBLIC_SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, and
`ADMIN_SESSION_SECRET` (`openssl rand -hex 32`). `GEMINI_API_KEY` is optional.

## 3. Install dependencies

```bash
npm install
```

## 4. Set the Care Admin password

```bash
npm run seed:admin -- --password "choose-a-real-password" --name "Dad"
```

## 5. Run it

```bash
npm run dev
```

- `http://localhost:3000/` → Dad's companion app
- `http://localhost:3000/admin` → Care Admin (login with the password you seeded)

Add at least one todo in Care Admin → Daily Todos before opening Dad's app,
or the Todos/Home/Reports screens will just show empty states.

> Don't add a "Drink water" todo in Daily Todos — Home already has a
> dedicated water counter card. Adding it as a todo too would double-log it
> (the spec calls this out explicitly).

## What's implemented

**Dad's app:**
- Home — greeting, streak banner, upcoming appointments, water counter, mood check-in
- Todos — one task at a time, marks `todo_completions`, advances automatically
- Calendar — Week view (merged todos + appointments + voice note markers) and List view (recurring schedule reference)
- Reports — streak, today's completion, weekly bar chart, 4-question daily check-in
- Voice Notes — live transcription (Web Speech API), AI summary + extracted fields, save/delete, native share

**Care Admin:** see the admin section added previously — Daily Todos, Calendar, Voice Notes, Activity Log, Settings.

## Not built yet (flagged, not silently skipped)

1. **Push notifications** (spec §3.6) — scheduled reminders, escalation on
   missed medication, admin alerts. Needs VAPID keys, a `push_subscriptions`
   write path, and a Vercel Cron job. The `push_subscriptions` table exists
   in the schema but nothing writes to it yet.
2. **Real PNG app icons.** `public/icon.svg` is a placeholder; PWABuilder's
   Android packaging step wants real 192×192 / 512×512 (and maskable) PNGs.
   Swap these in before running it through pwabuilder.com.
3. **Open spec decisions** (§8) — Calendar List view scope, and the optional
   health metrics log — still unresolved, per the spec's own flag.

## Generating the APK

Once deployed (e.g. to Vercel) and the manifest/service worker pass
Lighthouse's installability check, go to **pwabuilder.com**, paste the
deployed URL, and generate the Android (TWA) package. No Play Store account
needed — install the generated APK directly on Dad's Pixel 4XL (Settings →
allow installs from unknown sources, once).
