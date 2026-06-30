"use client";

import { useState } from "react";
import { COLORS } from "@/lib/colors";
import ModalShell, { fieldLabelStyle, fieldInputStyle } from "@/components/admin/ModalShell";
import type { CalendarEvent } from "@/lib/types";

export default function CalendarEventModal({
  mode,
  initial,
  onClose,
  onSaved,
}: {
  mode: "add" | "edit";
  initial: CalendarEvent | null;
  onClose: () => void;
  onSaved: (event: CalendarEvent) => void;
}) {
  const todayIso = new Date().toISOString().split("T")[0];
  const [title, setTitle] = useState(initial?.title ?? "");
  const [type, setType] = useState<CalendarEvent["type"]>(initial?.type ?? "appointment");
  const [date, setDate] = useState(initial?.date ?? todayIso);
  const [time, setTime] = useState(initial?.time?.slice(0, 5) ?? "10:00");
  const [notes, setNotes] = useState(initial?.notes ?? "");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSave() {
    if (!title.trim() || saving) return;
    setSaving(true);
    setError(null);
    const payload = { title: title.trim(), type, date, time, notes: notes.trim() || null };
    try {
      const res = await fetch(
        mode === "add" ? "/api/admin/calendar-events" : `/api/admin/calendar-events/${initial!.id}`,
        {
          method: mode === "add" ? "POST" : "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }
      );
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Couldn't save — try again");
        return;
      }
      onSaved(data.event);
    } catch {
      setError("Couldn't reach the server — try again");
    } finally {
      setSaving(false);
    }
  }

  return (
    <ModalShell title={mode === "add" ? "Add appointment" : "Edit appointment"} onClose={onClose}>
      <div style={{ display: "flex", gap: 11, marginBottom: 12 }}>
        <div style={{ flex: 2 }}>
          <label style={fieldLabelStyle}>Title</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. GP check-up"
            style={fieldInputStyle}
          />
        </div>
        <div style={{ flex: 1 }}>
          <label style={fieldLabelStyle}>Type</label>
          <select
            value={type}
            onChange={(e) => setType(e.target.value as CalendarEvent["type"])}
            style={{ ...fieldInputStyle, appearance: "none", cursor: "pointer" }}
          >
            <option value="appointment">Appointment</option>
            <option value="procedure">Procedure</option>
            <option value="therapy">Therapy</option>
            <option value="other">Other</option>
          </select>
        </div>
      </div>

      <div style={{ display: "flex", gap: 11, marginBottom: 12 }}>
        <div style={{ flex: 1 }}>
          <label style={fieldLabelStyle}>Date</label>
          <input type="date" value={date} onChange={(e) => setDate(e.target.value)} style={fieldInputStyle} />
        </div>
        <div style={{ flex: 1 }}>
          <label style={fieldLabelStyle}>Time</label>
          <input type="time" value={time} onChange={(e) => setTime(e.target.value)} style={fieldInputStyle} />
        </div>
      </div>

      <div style={{ marginBottom: 18 }}>
        <label style={fieldLabelStyle}>Notes</label>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Any details, reminders, or instructions…"
          rows={3}
          style={{ ...fieldInputStyle, resize: "vertical", display: "block" }}
        />
      </div>

      {error && <p style={{ fontSize: 13, color: COLORS.red, margin: "-8px 0 14px", fontWeight: 500 }}>{error}</p>}

      <div style={{ display: "flex", gap: 9 }}>
        <button
          onClick={handleSave}
          disabled={saving}
          style={{
            flex: 1,
            height: 48,
            borderRadius: 13,
            background: COLORS.blueGradient,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            boxShadow: "0 3px 12px rgba(43,77,140,0.20)",
            opacity: saving ? 0.7 : 1,
          }}
        >
          <span style={{ fontSize: 15, fontWeight: 600, color: "#FFF" }}>
            {saving ? "Saving…" : mode === "add" ? "Add appointment" : "Save changes"}
          </span>
        </button>
        <button
          onClick={onClose}
          style={{
            width: 48,
            height: 48,
            borderRadius: 13,
            background: COLORS.neutralBgStrong,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <span style={{ fontSize: 13, color: COLORS.inkMuted }}>✕</span>
        </button>
      </div>
    </ModalShell>
  );
}
