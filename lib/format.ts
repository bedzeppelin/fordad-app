/** "08:00" or "08:00:00" -> "8:00 AM" */
export function formatTime(t: string | null | undefined): string {
  if (!t) return "";
  const [hStr, mStr] = t.split(":");
  const h = Number(hStr);
  const m = Number(mStr);
  if (!Number.isFinite(h) || !Number.isFinite(m)) return "";
  const period = h >= 12 ? "PM" : "AM";
  const h12 = h % 12 || 12;
  return `${h12}:${String(m).padStart(2, "0")} ${period}`;
}

/** "2026-07-08" -> "Wed, Jul 8" */
export function formatDate(d: string | null | undefined): string {
  if (!d) return "";
  try {
    return new Date(`${d}T12:00:00`).toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
    });
  } catch {
    return d;
  }
}

export function formatDateTimeShort(iso: string): { date: string; time: string } {
  const dt = new Date(iso);
  return {
    date: dt.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
    time: dt.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", hour12: true }),
  };
}

const WEEKDAY_DISPLAY: Record<string, string> = {
  Mo: "Mon",
  Tu: "Tue",
  We: "Wed",
  Th: "Thu",
  Fr: "Fri",
  Sa: "Sat",
  Su: "Sun",
};
const ORDER = ["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"];

export function formatRecurrenceDays(days: string[] | null | undefined): string {
  if (!days || days.length === 0) return "Not scheduled";
  if (days.length === 7) return "Every day";
  return [...days]
    .sort((a, b) => ORDER.indexOf(a) - ORDER.indexOf(b))
    .map((d) => WEEKDAY_DISPLAY[d] || d)
    .join(", ");
}

export function dayLabelForDate(iso: string): string {
  const dt = new Date(iso);
  const ds = dt.toDateString();
  const todayS = new Date().toDateString();
  const yst = new Date();
  yst.setDate(yst.getDate() - 1);
  if (ds === todayS) return "Today";
  if (ds === yst.toDateString()) return "Yesterday";
  return dt.toLocaleDateString("en-US", { weekday: "long", month: "short", day: "numeric" });
}
