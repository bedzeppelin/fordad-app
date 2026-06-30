import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { sendPushToRole } from "@/lib/push";
import { weekdayForDate } from "@/lib/streak";

export const dynamic = "force-dynamic";

// How often Vercel Cron actually invokes this route (see vercel.json). Used
// as the tolerance window when matching a threshold like "+30 minutes".
const WINDOW_MINUTES = 5;

function nowInTimezone(tz: string): { date: string; minutesOfDay: number } {
  const fmt = new Intl.DateTimeFormat("en-CA", {
    timeZone: tz,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
  const parts = Object.fromEntries(fmt.formatToParts(new Date()).map((p) => [p.type, p.value])) as Record<string, string>;
  const date = `${parts.year}-${parts.month}-${parts.day}`;
  const minutesOfDay = Number(parts.hour) * 60 + Number(parts.minute);
  return { date, minutesOfDay };
}

function timeStrToMinutes(t: string): number {
  const [h, m] = t.split(":").map(Number);
  return h * 60 + m;
}

async function alreadySent(date: string, type: string, targetId: string): Promise<boolean> {
  const { data } = await supabaseAdmin
    .from("push_notification_log")
    .select("id")
    .eq("date", date)
    .eq("notification_type", type)
    .eq("target_id", targetId)
    .maybeSingle();
  return !!data;
}

async function logSent(date: string, type: string, targetId: string) {
  await supabaseAdmin.from("push_notification_log").insert({ date, notification_type: type, target_id: targetId });
}

export async function GET(req: NextRequest) {
  // Triggered by a GitHub Actions scheduled workflow (.github/workflows/push-cron.yml)
  // rather than Vercel's own Cron — Hobby plan only allows daily-or-slower
  // Vercel crons, and this needs ~5-minute granularity. The workflow sends
  // the same CRON_SECRET as a bearer token.
  if (process.env.CRON_SECRET && req.headers.get("authorization") !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const tz = process.env.TIMEZONE || "America/New_York";
  const { date, minutesOfDay } = nowInTimezone(tz);
  const wd = weekdayForDate(date);
  const sent: string[] = [];

  const inWindow = (target: number) => minutesOfDay >= target && minutesOfDay < target + WINDOW_MINUTES;

  // ── Todo reminders, escalations, and the admin missed-task alert ──
  const [{ data: todos }, { data: completions }] = await Promise.all([
    supabaseAdmin
      .from("todos")
      .select("id, title, short_title, scheduled_time")
      .eq("active", true)
      .contains("recurrence_days", [wd]),
    supabaseAdmin.from("todo_completions").select("todo_id").eq("date", date),
  ]);
  const completedIds = new Set((completions ?? []).map((c) => c.todo_id));

  for (const todo of todos ?? []) {
    if (completedIds.has(todo.id)) continue;
    const scheduledMin = timeStrToMinutes(todo.scheduled_time);
    const elapsed = minutesOfDay - scheduledMin;
    if (elapsed < 0) continue; // not due yet today
    const title = todo.short_title || todo.title.replace(/\n/g, " ");

    if (elapsed < WINDOW_MINUTES && !(await alreadySent(date, "reminder", todo.id))) {
      await sendPushToRole("dad", { title: "Task reminder", body: title, url: "/" });
      await logSent(date, "reminder", todo.id);
      sent.push(`reminder:${todo.id}`);
    } else if (elapsed >= 30 && elapsed < 30 + WINDOW_MINUTES && !(await alreadySent(date, "escalation_1", todo.id))) {
      await sendPushToRole("dad", { title: "Still waiting on this one", body: title, url: "/" });
      await logSent(date, "escalation_1", todo.id);
      sent.push(`escalation_1:${todo.id}`);
    } else if (elapsed >= 60 && elapsed < 60 + WINDOW_MINUTES && !(await alreadySent(date, "escalation_2", todo.id))) {
      await sendPushToRole("dad", { title: "Friendly reminder", body: title, url: "/" });
      await logSent(date, "escalation_2", todo.id);
      sent.push(`escalation_2:${todo.id}`);
    } else if (elapsed >= 120 && !(await alreadySent(date, "admin_alert", todo.id))) {
      await sendPushToRole("admin", { title: "Missed task alert", body: `"${title}" is more than 2 hours overdue`, url: "/admin/activity-log" });
      await logSent(date, "admin_alert", todo.id);
      sent.push(`admin_alert:${todo.id}`);
    }
  }

  // ── Mood check-in reminder (by midday, once) ──
  if (inWindow(12 * 60)) {
    const { data: mood } = await supabaseAdmin.from("mood_checkins").select("id").eq("date", date).maybeSingle();
    if (!mood && !(await alreadySent(date, "mood_reminder", "mood"))) {
      await sendPushToRole("dad", { title: "How are you feeling today?", body: "Tap to check in on Home", url: "/" });
      await logSent(date, "mood_reminder", "mood");
      sent.push("mood_reminder");
    }
  }

  // ── Evening check-in reminder (by 7pm, once) ──
  if (inWindow(19 * 60)) {
    const { data: checkin } = await supabaseAdmin.from("daily_checkins").select("id").eq("date", date).maybeSingle();
    if (!checkin && !(await alreadySent(date, "checkin_reminder", "checkin"))) {
      await sendPushToRole("dad", { title: "Daily check-in", body: "How was your day? Takes a minute.", url: "/" });
      await logSent(date, "checkin_reminder", "checkin");
      sent.push("checkin_reminder");
    }
  }

  return NextResponse.json({ ok: true, date, minutesOfDay, sent });
}
