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
