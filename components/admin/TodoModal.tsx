"use client";

import { useState } from "react";
import { COLORS, ICON_KEYS, WEEKDAYS, Weekday } from "@/lib/colors";
import { TodoIcon } from "@/components/icons";
import ModalShell, { fieldLabelStyle, fieldInputStyle } from "@/components/admin/ModalShell";
import type { Todo } from "@/lib/types";

export default function TodoModal({
  mode,
  initial,
  onClose,
  onSaved,
}: {
  mode: "add" | "edit";
  initial: Todo | null;
  onClose: () => void;
  onSaved: (todo: Todo) => void;
}) {
  const [title, setTitle] = useState(initial?.title ?? "");
  const [categoryLabel, setCategoryLabel] = useState(initial?.category_label ?? "");
  const [scheduledTime, setScheduledTime] = useState(initial?.scheduled_time?.slice(0, 5) ?? "09:00");
  const [description, setDescription] = useState(initial?.description ?? "");
  const [hint, setHint] = useState(initial?.hint ?? "");
  const [icon, setIcon] = useState(initial?.icon ?? "pill");
  const [days, setDays] = useState<Weekday[]>(initial?.recurrence_days ?? [...WEEKDAYS]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function toggleDay(d: Weekday) {
    setDays((prev) => (prev.includes(d) ? prev.filter((x) => x !== d) : [...prev, d]));
  }

  async function handleSave() {
    if (!title.trim() || saving) return;
    setSaving(true);
    setError(null);
    const payload = {
      title: title.trim(),
      short_title: title.trim().replace(/\n/g, " "),
      category_label: categoryLabel.trim() || null,
      scheduled_time: scheduledTime,
      description: description.trim() || null,
      hint: hint.trim() || null,
      icon,
      recurrence_days: days,
    };
    try {
      const res = await fetch(mode === "add" ? "/api/admin/todos" : `/api/admin/todos/${initial!.id}`, {
        method: mode === "add" ? "POST" : "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Couldn't save — try again");
        return;
      }
      onSaved(data.todo);
    } catch {
      setError("Couldn't reach the server — try again");
    } finally {
      setSaving(false);
    }
  }

  return (
    <ModalShell title={mode === "add" ? "Add todo" : "Edit todo"} onClose={onClose}>
      <div style={{ marginBottom: 12 }}>
        <label style={fieldLabelStyle}>Task title</label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="e.g. Morning medication"
          style={fieldInputStyle}
        />
      </div>

      <div style={{ display: "flex", gap: 11, marginBottom: 12 }}>
        <div style={{ flex: 1 }}>
          <label style={fieldLabelStyle}>Category label</label>
          <input
            type="text"
            value={categoryLabel}
            onChange={(e) => setCategoryLabel(e.target.value)}
            placeholder="e.g. Morning"
            style={fieldInputStyle}
          />
        </div>
        <div style={{ flex: 1 }}>
          <label style={fieldLabelStyle}>Notify at</label>
          <input type="time" value={scheduledTime} onChange={(e) => setScheduledTime(e.target.value)} style={fieldInputStyle} />
        </div>
      </div>

      <div style={{ marginBottom: 12 }}>
        <label style={fieldLabelStyle}>Description</label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Short description shown in the app…"
          rows={3}
          style={{ ...fieldInputStyle, resize: "vertical", display: "block" }}
        />
      </div>

      <div style={{ display: "flex", gap: 11, marginBottom: 12 }}>
        <div style={{ flex: 1.5 }}>
          <label style={fieldLabelStyle}>Time hint</label>
          <input
            type="text"
            value={hint}
            onChange={(e) => setHint(e.target.value)}
            placeholder="e.g. About 2 minutes"
            style={fieldInputStyle}
          />
        </div>
        <div style={{ flex: 1 }}>
          <label style={fieldLabelStyle}>Icon</label>
          <div style={{ display: "flex", gap: 5, flexWrap: "wrap", paddingTop: 2 }}>
            {ICON_KEYS.map((k) => {
              const selected = icon === k;
              return (
                <button
                  key={k}
                  onClick={() => setIcon(k)}
                  aria-label={k}
                  style={{
                    width: 34,
                    height: 34,
                    borderRadius: 9,
                    background: selected ? COLORS.blueBgStrong : COLORS.neutralBg,
                    border: `1.5px solid ${selected ? "rgba(43,77,140,0.25)" : "transparent"}`,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                  }}
                >
                  <TodoIcon iconKey={k} color={selected ? COLORS.blue : COLORS.inkFaint} size={17} />
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <div style={{ marginBottom: 18 }}>
        <label style={fieldLabelStyle}>Repeat on</label>
        <div style={{ display: "flex", gap: 6 }}>
          {WEEKDAYS.map((d) => {
            const selected = days.includes(d);
            return (
              <button
                key={d}
                onClick={() => toggleDay(d)}
                style={{
                  flex: 1,
                  height: 34,
                  borderRadius: 9,
                  background: selected ? COLORS.blueBgStrong : COLORS.neutralBg,
                  border: `1.5px solid ${selected ? "rgba(43,77,140,0.25)" : "transparent"}`,
                  fontSize: 12,
                  fontWeight: 700,
                  color: selected ? COLORS.blue : COLORS.inkFaint,
                }}
              >
                {d}
              </button>
            );
          })}
        </div>
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
            {saving ? "Saving…" : mode === "add" ? "Add todo" : "Save changes"}
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
