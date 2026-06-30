import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { addDays, weekdayForDate } from "@/lib/streak";

const DOW_NAMES = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

// Merges recurring todos + calendar_events + voice_notes for the Monday-start
// week containing `date`, per spec section 3.3 (Week view).
export async function GET(req: NextRequest) {
  const date = req.nextUrl.searchParams.get("date");
  if (!date) return NextResponse.json({ error: "date is required (YYYY-MM-DD)" }, { status: 400 });

  const dow = new Date(`${date}T12:00:00`).getDay(); // 0=Sun
  const moOffset = dow === 0 ? -6 : 1 - dow;
  const weekStart = addDays(date, moOffset);
  const weekEnd = addDays(weekStart, 6);
  const dates = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));

  const [{ data: todos }, { data: events }, { data: notes }] = await Promise.all([
    supabaseAdmin.from("todos").select("*").eq("active", true),
    supabaseAdmin.from("calendar_events").select("*").gte("date", weekStart).lte("date", weekEnd),
    supabaseAdmin.from("voice_notes").select("id, date, recorded_at, summary_bullets").gte("date", weekStart).lte("date", weekEnd),
  ]);

  const allTodos = todos ?? [];
  const allEvents = events ?? [];
  const allNotes = notes ?? [];

  const days = dates.map((d, i) => {
    const wd = weekdayForDate(d);
    const dt = new Date(`${d}T12:00:00`);

    const todoItems = allTodos
      .filter((t) => (t.recurrence_days as string[]).includes(wd))
      .map((t) => ({
        kind: "todo" as const,
        id: t.id,
        label: t.short_title || t.title.replace(/\n/g, " "),
        time: t.scheduled_time,
        icon: t.icon,
      }));

    const eventItems = allEvents
      .filter((e) => e.date === d)
      .map((e) => ({ kind: "event" as const, id: e.id, label: e.title, time: e.time, type: e.type, notes: e.notes }));

    const noteItems = allNotes
      .filter((n) => n.date === d)
      .map((n) => ({
        kind: "note" as const,
        id: n.id,
        label: n.summary_bullets?.[0] || "Voice note",
        time: new Date(n.recorded_at).toISOString().slice(11, 16),
      }));

    const items = [...todoItems, ...eventItems, ...noteItems].sort((a, b) => a.time.localeCompare(b.time));

    return {
      date: d,
      dayName: DOW_NAMES[i],
      dayNum: dt.getDate(),
      monthName: dt.toLocaleDateString("en-US", { month: "short" }),
      isToday: d === date,
      items,
    };
  });

  return NextResponse.json({ weekStart, weekEnd, days });
}
