import type { Weekday } from "@/lib/colors";

export interface Todo {
  id: string;
  title: string;
  short_title: string | null;
  description: string | null;
  category_label: string | null;
  icon: string;
  hint: string | null;
  scheduled_time: string; // "HH:MM:SS" from Postgres `time`
  recurrence_days: Weekday[];
  sort_order: number;
  active: boolean;
  created_at: string;
}

export interface TodoCompletion {
  id: string;
  todo_id: string;
  completed_at: string;
  date: string;
}

export interface CalendarEvent {
  id: string;
  title: string;
  type: "appointment" | "procedure" | "therapy" | "other";
  date: string; // "YYYY-MM-DD"
  time: string; // "HH:MM:SS"
  notes: string | null;
  created_by: string;
  created_at: string;
}

export interface VoiceNote {
  id: string;
  date: string;
  recorded_at: string;
  raw_transcript: string;
  summary_bullets: string[];
  extracted_fields: Record<string, unknown>;
  shared: boolean;
}

export interface ActivityLogEntry {
  id: string;
  todo_id: string;
  completed_at: string;
  date: string;
  todo_title: string;
  todo_icon: string;
}

export interface AdminSettingsPublic {
  patient_name: string;
}

// ─── Dad's companion app ───────────────────────────────────────────────

export interface DadTodoItem extends Todo {
  completed: boolean;
}

export interface DadUpcomingEvent {
  id: string;
  title: string;
  date: string;
  time: string;
  notes: string | null;
}

export interface DadTodayData {
  patientName: string;
  todos: DadTodoItem[];
  completedCount: number;
  totalCount: number;
  streak: number;
  weekBars: number[]; // 7 entries, Sun-Sat
  upcomingEvents: DadUpcomingEvent[];
  water: { count: number; target: number };
  mood: { submitted: boolean; value: string | null };
  checkin: {
    submitted: boolean;
    overall_day_rating?: number | null;
    energy_level?: string | null;
    pain_discomfort?: string | null;
    sleep_quality?: string | null;
  };
}

export interface DadCalendarItem {
  kind: "todo" | "event" | "note";
  id: string;
  label: string;
  time: string;
  icon?: string;
  type?: string;
  notes?: string | null;
}

export interface DadCalendarDay {
  date: string;
  dayName: string;
  dayNum: number;
  monthName: string;
  isToday: boolean;
  items: DadCalendarItem[];
}

export interface DadVoiceNote {
  id: string;
  date: string;
  recorded_at: string;
  summary_bullets: string[];
}
