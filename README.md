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
- Web Push (VAPID) + Vercel Cron for scheduled reminders/escalations
- PWA: manifest + service worker (offline shell caching + push handling)

## 1. Set up Supabase

1. Create a free project at [supabase.com](https://supabase.com).
2. Open the SQL Editor and run [`supabase/schema.sql`](supabase/schema.sql) once.
   - If you already ran an older version of this file, also run
     [`supabase/migrations/001_push_notification_log.sql`](supabase/migrations/001_push_notification_log.sql)
     to add the table the cron job needs.
3. Grab your **Project URL** and **service_role key** from Project Settings → API.

## 2. Configure environment variables

```bash
cp .env.local.example .env.local
```

Required: `NEXT_PUBLIC_SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`,
`ADMIN_SESSION_SECRET` (`openssl rand -hex 32`).

For push notifications, also run:

```bash
npm install
npm run generate:vapid
```

and paste the printed `NEXT_PUBLIC_VAPID_PUBLIC_KEY` / `VAPID_PRIVATE_KEY`
into `.env.local`. Set `TIMEZONE` to the IANA zone Dad actually lives in
(e.g. `America/Chicago`) — it's used to decide when "8am" actually is.
`GEMINI_API_KEY` and `CRON_SECRET` can be left blank for local dev.

## 3. Set the Care Admin password

```bash
npm run seed:admin -- --password "choose-a-real-password" --name "Dad"
```

## 4. Run it

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
- Home — greeting, streak banner, upcoming appointments, water counter, mood check-in, "turn on reminders" prompt
- Todos — one task at a time, marks `todo_completions`, advances automatically
- Calendar — Week view (merged todos + appointments + voice note markers) and List view (recurring schedule reference)
- Reports — streak, today's completion, weekly bar chart, 4-question daily check-in
- Voice Notes — live transcription (Web Speech API), AI summary + extracted fields, save/delete, native share

**Care Admin:** Daily Todos, Calendar, Voice Notes, Activity Log, Settings (patient name, password, enable notifications on this device).

**Push notifications (spec §3.6):**
- Reminder at each todo's `scheduled_time`, for the days it's scheduled
- Escalation pushes to Dad at +30 min and +60 min if still not marked done
- Missed-task alert to the Admin's device at +2 hours
- Mood check-in reminder by midday if not yet logged
- Evening check-in reminder by 7pm if not yet submitted
- Driven by `vercel.json`'s cron (`/api/push/cron`, every 5 minutes) — `lib/push.ts` sends via `web-push`, `push_notification_log` prevents duplicate sends across runs

## Not built yet / open items

1. **Maskable icon variant.** `public/icon-192.png` / `icon-512.png` are real
   PNGs now, but only declared as `purpose: "any"` — the source art doesn't
   have the safe-zone padding maskable icons need (Android can crop a
   maskable icon's outer ~33%). Fine for installability; revisit if Android
   crops the icon oddly on some launchers.
2. **Open spec decisions** (§8) — Calendar List view scope, and the optional
   health metrics log — still unresolved, per the spec's own flag.
3. **Vercel Hobby cron frequency.** The free tier's allowed cron interval has
   changed over time — if Vercel rejects `*/5 * * * *` on deploy, widen it in
   `vercel.json` (e.g. every 15 min); the reminder windows tolerate that fine,
   just less precisely timed.

## Generating the APK

1. **Deploy to Vercel.** Import the GitHub repo at vercel.com, set every env
   var from `.env.local` (including the VAPID keys, `CRON_SECRET` — pick a
   new random value here, Vercel sends it back as the `Authorization` header
   automatically — and `TIMEZONE`), deploy.
2. Run `npm run seed:admin -- --password "..."` once against production
   (either locally with `.env.local` pointed at the same Supabase project, or
   via `vercel env pull` first) so Care Admin has a password.
3. Confirm the deployed site passes Lighthouse's installability check
   (Chrome DevTools → Lighthouse → PWA).
4. Go to **[pwabuilder.com](https://www.pwabuilder.com)**, paste the deployed
   URL, and generate the **Android (TWA)** package.
5. Download the APK and send it to Dad's Pixel 4XL — install it directly
   (Settings → allow installs from unknown sources, once; not from the Play
   Store).
6. **First-launch setup:** on his phone, go to Settings → Apps → Chrome →
   Battery → set to **Unrestricted**, so Android doesn't kill background push
   delivery (per spec §7).
