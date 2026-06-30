import { supabaseAdmin } from "@/lib/supabase";
import type { Weekday } from "@/lib/colors";

const DOW_TO_WEEKDAY: Weekday[] = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];

function weekdayForDate(dateStr: string): Weekday {
  return DOW_TO_WEEKDAY[new Date(`${dateStr}T12:00:00`).getDay()];
}

function addDays(dateStr: string, delta: number): string {
  const d = new Date(`${dateStr}T12:00:00`);
  d.setDate(d.getDate() + delta);
  return d.toISOString().split("T")[0];
}

interface TodoLite {
  id: string;
  recurrence_days: string[];
}

/**
 * A day "counts" if every active todo scheduled for that weekday has a
 * todo_completions row on that date. A weekday with zero scheduled todos is
 * vacuously complete so it doesn't break the streak.
 */
function isDayComplete(dateStr: string, allTodos: TodoLite[], completedByDate: Map<string, Set<string>>): boolean {
  const wd = weekdayForDate(dateStr);
  const scheduled = allTodos.filter((t) => t.recurrence_days.includes(wd));
  if (scheduled.length === 0) return true;
  const done = completedByDate.get(dateStr) ?? new Set();
  return scheduled.every((t) => done.has(t.id));
}

export async function computeStreakAndToday(
  todayDate: string
): Promise<{ streak: number; todayCompletedCount: number; todayTotalCount: number }> {
  const { data: todos } = await supabaseAdmin.from("todos").select("id, recurrence_days").eq("active", true);
  const allTodos = (todos ?? []) as TodoLite[];

  const earliest = addDays(todayDate, -60);
  const { data: completions } = await supabaseAdmin
    .from("todo_completions")
    .select("todo_id, date")
    .gte("date", earliest)
    .lte("date", todayDate);

  const completedByDate = new Map<string, Set<string>>();
  for (const c of completions ?? []) {
    if (!completedByDate.has(c.date)) completedByDate.set(c.date, new Set());
    completedByDate.get(c.date)!.add(c.todo_id);
  }

  const todayWd = weekdayForDate(todayDate);
  const todayScheduled = allTodos.filter((t) => t.recurrence_days.includes(todayWd));
  const todayDone = completedByDate.get(todayDate) ?? new Set();
  const todayCompletedCount = todayScheduled.filter((t) => todayDone.has(t.id)).length;
  const todayTotalCount = todayScheduled.length;

  let cursor = isDayComplete(todayDate, allTodos, completedByDate) ? todayDate : addDays(todayDate, -1);
  let streak = 0;
  for (let i = 0; i < 60; i++) {
    if (isDayComplete(cursor, allTodos, completedByDate)) {
      streak++;
      cursor = addDays(cursor, -1);
    } else {
      break;
    }
  }

  return { streak, todayCompletedCount, todayTotalCount };
}

/** Percent-complete for each day (Sun-Sat) of the week containing todayDate. */
export async function computeWeekBars(todayDate: string): Promise<number[]> {
  const dow = new Date(`${todayDate}T12:00:00`).getDay();
  const weekStart = addDays(todayDate, -dow);
  const dates = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));

  const { data: todos } = await supabaseAdmin.from("todos").select("id, recurrence_days").eq("active", true);
  const allTodos = (todos ?? []) as TodoLite[];

  const { data: completions } = await supabaseAdmin
    .from("todo_completions")
    .select("todo_id, date")
    .gte("date", dates[0])
    .lte("date", dates[6]);

  const completedByDate = new Map<string, Set<string>>();
  for (const c of completions ?? []) {
    if (!completedByDate.has(c.date)) completedByDate.set(c.date, new Set());
    completedByDate.get(c.date)!.add(c.todo_id);
  }

  return dates.map((d) => {
    const wd = weekdayForDate(d);
    const scheduled = allTodos.filter((t) => t.recurrence_days.includes(wd));
    if (scheduled.length === 0) return 0;
    const done = completedByDate.get(d) ?? new Set();
    const completedN = scheduled.filter((t) => done.has(t.id)).length;
    return Math.round((completedN / scheduled.length) * 100);
  });
}

export { weekdayForDate, addDays };
