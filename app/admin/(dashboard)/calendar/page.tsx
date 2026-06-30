"use client";

import { useEffect, useState } from "react";
import { COLORS, CAL_TYPE_CONFIG, getIconColors } from "@/lib/colors";
import { formatTime, formatDate, formatRecurrenceDays } from "@/lib/format";
import { TodoIcon, CalTypeIcon, PlusIcon, EditIcon, TrashIcon } from "@/components/icons";
import CalendarEventModal from "@/components/admin/CalendarEventModal";
import ConfirmDialog from "@/components/admin/ConfirmDialog";
import type { Todo, CalendarEvent } from "@/lib/types";

export default function CalendarPage() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState<{ mode: "add" | "edit"; event: CalendarEvent | null } | null>(null);
  const [pendingDelete, setPendingDelete] = useState<CalendarEvent | null>(null);

  async function load() {
    const [todosRes, eventsRes] = await Promise.all([fetch("/api/admin/todos"), fetch("/api/admin/calendar-events")]);
    if (todosRes.ok) setTodos((await todosRes.json()).todos);
    if (eventsRes.ok) setEvents((await eventsRes.json()).events);
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  function handleSaved(event: CalendarEvent) {
    setModal(null);
    setEvents((prev) => {
      const exists = prev.some((e) => e.id === event.id);
      const next = exists ? prev.map((e) => (e.id === event.id ? event : e)) : [...prev, event];
      return next.sort((a, b) => (a.date + a.time).localeCompare(b.date + b.time));
    });
  }

  async function handleDelete() {
    if (!pendingDelete) return;
    const id = pendingDelete.id;
    setPendingDelete(null);
    setEvents((prev) => prev.filter((e) => e.id !== id));
    await fetch(`/api/admin/calendar-events/${id}`, { method: "DELETE" });
  }

  return (
    <div style={{ padding: "28px 28px 60px", maxWidth: 680 }}>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 22, fontWeight: 700, color: COLORS.ink, margin: "0 0 3px", letterSpacing: -0.5 }}>Calendar</h1>
        <p style={{ fontSize: 13, color: COLORS.inkFaint, margin: 0 }}>Recurring schedule and upcoming appointments</p>
      </div>

      <div style={{ marginBottom: 24 }}>
        <p
          style={{
            fontSize: 10.5,
            fontWeight: 700,
            color: COLORS.inkFaint,
            letterSpacing: 1.1,
            textTransform: "uppercase",
            margin: "0 0 10px 2px",
          }}
        >
          Recurring Schedule
        </p>
        {!loading && todos.length === 0 ? (
          <p style={{ fontSize: 13, color: COLORS.inkFainter, margin: 0 }}>
            No recurring todos yet — add some in Daily Todos.
          </p>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
            {todos.map((t) => {
              const c = getIconColors(t.icon);
              return (
                <div
                  key={t.id}
                  style={{
                    background: COLORS.card,
                    borderRadius: 12,
                    padding: "11px 13px",
                    display: "flex",
                    alignItems: "center",
                    gap: 11,
                    boxShadow: "0 1px 2px rgba(20,14,8,0.03)",
                  }}
                >
                  <div
                    style={{
                      width: 34,
                      height: 34,
                      borderRadius: 9,
                      background: c.bg,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexShrink: 0,
                    }}
                  >
                    <TodoIcon iconKey={t.icon} color={c.accent} size={17} />
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontSize: 13.5, fontWeight: 600, color: COLORS.ink, margin: 0, lineHeight: 1.25 }}>
                      {t.short_title || t.title.replace(/\n/g, " ")}
                    </p>
                    <p style={{ fontSize: 11.5, color: COLORS.inkFaint, margin: "1px 0 0" }}>
                      {formatRecurrenceDays(t.recurrence_days)}
                    </p>
                  </div>
                  <span
                    style={{
                      fontSize: 12,
                      fontWeight: 600,
                      color: COLORS.inkMuted,
                      background: COLORS.neutralBgStrong,
                      padding: "3px 9px",
                      borderRadius: 7,
                    }}
                  >
                    {formatTime(t.scheduled_time)}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <div>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
          <p
            style={{
              fontSize: 10.5,
              fontWeight: 700,
              color: COLORS.inkFaint,
              letterSpacing: 1.1,
              textTransform: "uppercase",
              margin: 0,
            }}
          >
            Appointments &amp; Procedures
          </p>
          <button
            onClick={() => setModal({ mode: "add", event: null })}
            style={{ display: "flex", alignItems: "center", gap: 5, padding: "6px 12px", background: COLORS.blueBgStrong, borderRadius: 9 }}
          >
            <PlusIcon color={COLORS.blue} />
            <span style={{ fontSize: 13, fontWeight: 600, color: COLORS.blue }}>Add</span>
          </button>
        </div>

        {!loading && events.length === 0 ? (
          <div style={{ background: COLORS.card, borderRadius: 14, padding: "30px 20px", textAlign: "center", border: `1.5px dashed ${COLORS.border}` }}>
            <p style={{ fontSize: 13.5, color: COLORS.inkFainter, margin: 0, lineHeight: 1.65 }}>
              No appointments yet.
              <br />
              Add an appointment, procedure, or other event.
            </p>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {events.map((e) => {
              const cf = CAL_TYPE_CONFIG[e.type] || CAL_TYPE_CONFIG.other;
              return (
                <div
                  key={e.id}
                  style={{
                    background: COLORS.card,
                    borderRadius: 16,
                    padding: "14px 15px",
                    boxShadow: "0 1px 2px rgba(20,14,8,0.03),0 3px 10px rgba(20,14,8,0.06)",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "flex-start", gap: 11 }}>
                    <div
                      style={{
                        width: 36,
                        height: 36,
                        borderRadius: 10,
                        background: cf.bg,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        flexShrink: 0,
                      }}
                    >
                      <CalTypeIcon type={e.type} color={cf.color} />
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 7, marginBottom: 2, flexWrap: "wrap" }}>
                        <p style={{ fontSize: 15, fontWeight: 600, color: COLORS.ink, margin: 0, lineHeight: 1.3 }}>{e.title}</p>
                        <span style={{ fontSize: 10.5, fontWeight: 700, color: cf.color, background: cf.bg, padding: "3px 7px", borderRadius: 5, flexShrink: 0 }}>
                          {cf.label}
                        </span>
                      </div>
                      <p style={{ fontSize: 12.5, fontWeight: 500, color: COLORS.inkMuted, margin: 0, lineHeight: 1.4 }}>
                        {formatDate(e.date)} · {formatTime(e.time)}
                      </p>
                      {e.notes && (
                        <p style={{ fontSize: 12, color: COLORS.inkFaint, margin: "4px 0 0", lineHeight: 1.5 }}>{e.notes}</p>
                      )}
                    </div>
                    <div style={{ display: "flex", gap: 5, flexShrink: 0 }}>
                      <button
                        onClick={() => setModal({ mode: "edit", event: e })}
                        aria-label="Edit"
                        style={{ width: 29, height: 29, borderRadius: 8, background: COLORS.neutralBg, display: "flex", alignItems: "center", justifyContent: "center" }}
                      >
                        <EditIcon />
                      </button>
                      <button
                        onClick={() => setPendingDelete(e)}
                        aria-label="Delete"
                        style={{ width: 29, height: 29, borderRadius: 8, background: COLORS.redBg, display: "flex", alignItems: "center", justifyContent: "center" }}
                      >
                        <TrashIcon />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {modal && (
        <CalendarEventModal mode={modal.mode} initial={modal.event} onClose={() => setModal(null)} onSaved={handleSaved} />
      )}

      {pendingDelete && (
        <ConfirmDialog
          title="Delete this entry?"
          message={`"${pendingDelete.title}" will be removed from the calendar.`}
          onConfirm={handleDelete}
          onCancel={() => setPendingDelete(null)}
        />
      )}
    </div>
  );
}
