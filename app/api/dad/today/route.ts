import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { computeStreakAndToday, computeWeekBars, weekdayForDate } from "@/lib/streak";

// Bootstrap data for Home / Todos / Reports screens. `date` is the caller's
// local YYYY-MM-DD — computed client-side so "today" matches Dad's clock,
// not the server's.
export async function GET(req: NextRequest) {
  const date = req.nextUrl.searchParams.get("date");
  if (!date) return NextResponse.json({ error: "date is required (YYYY-MM-DD)" }, { status: 400 });

  const wd = weekdayForDate(date);

  const [{ data: todos }, { data: completions }, { data: settings }, { data: water }, { data: mood }, { data: checkin }, { data: events }, weekBars, todayInfo] =
    await Promise.all([
      supabaseAdmin
        .from("todos")
        .select("*")
        .eq("active", true)
        .contains("recurrence_days", [wd])
        .order("sort_order", { ascending: true }),
      supabaseAdmin.from("todo_completions").select("todo_id").eq("date", date),
      supabaseAdmin.from("admin_settings").select("patient_name").eq("id", 1).maybeSingle(),
      supabaseAdmin.from("water_intake").select("*").eq("date", date).maybeSingle(),
      supabaseAdmin.from("mood_checkins").select("*").eq("date", date).maybeSingle(),
      supabaseAdmin.from("daily_checkins").select("*").eq("date", date).maybeSingle(),
      supabaseAdmin
        .from("calendar_events")
        .select("*")
        .gte("date", date)
        .order("date", { ascending: true })
        .order("time", { ascending: true })
        .limit(8),
      computeWeekBars(date),
      computeStreakAndToday(date),
    ]);

  const completedIds = new Set((completions ?? []).map((c) => c.todo_id));
  const todosToday = (todos ?? []).map((t) => ({ ...t, completed: completedIds.has(t.id) }));

  const now = new Date();
  const upcomingEvents = (events ?? [])
    .filter((e) => {
      if (e.date > date) return true;
      if (e.date < date) return false;
      // same day: only include events that haven't already passed
      const [h, m] = e.time.split(":").map(Number);
      const eventTime = new Date(`${date}T00:00:00`);
      eventTime.setHours(h, m, 0, 0);
      return eventTime >= now;
    })
    .slice(0, 2);

  return NextResponse.json({
    patientName: settings?.patient_name ?? "Dad",
    todos: todosToday,
    completedCount: todayInfo.todayCompletedCount,
    totalCount: todayInfo.todayTotalCount,
    streak: todayInfo.streak,
    weekBars,
    upcomingEvents,
    water: { count: water?.count ?? 0, target: water?.target ?? 8 },
    mood: { submitted: !!mood, value: mood?.mood ?? null },
    checkin: checkin
      ? {
          submitted: true,
          overall_day_rating: checkin.overall_day_rating,
          energy_level: checkin.energy_level,
          pain_discomfort: checkin.pain_discomfort,
          sleep_quality: checkin.sleep_quality,
        }
      : { submitted: false },
  });
}
