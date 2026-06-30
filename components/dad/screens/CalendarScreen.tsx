"use client";

import { useEffect, useState } from "react";
import { localDateString, formatTime } from "@/lib/format";
import { CalIcon } from "@/components/dad/icons";
import { getIconColors, WEEKDAYS, Weekday } from "@/lib/colors";
import type { DadCalendarDay } from "@/lib/types";
import type { Todo } from "@/lib/types";

const SD: Weekday[] = [...WEEKDAYS];

function itemIconColors(item: { kind: string; icon?: string; type?: string }) {
  if (item.kind === "todo") return getIconColors(item.icon || "pill");
  if (item.kind === "note") return { bg: "rgba(168,72,72,0.10)", accent: "#A84848" };
  // event
  if (item.type === "procedure") return { bg: "rgba(181,106,48,0.10)", accent: "#B56A30" };
  if (item.type === "therapy") return { bg: "rgba(46,128,80,0.10)", accent: "#2E8050" };
  return { bg: "#EDF1FB", accent: "#2B4D8C" };
}

export default function CalendarScreen({ active }: { active: boolean }) {
  const [view, setView] = useState<"week" | "list">("week");
  const [days, setDays] = useState<DadCalendarDay[] | null>(null);
  const [listTodos, setListTodos] = useState<Todo[] | null>(null);

  useEffect(() => {
    fetch(`/api/dad/calendar/week?date=${localDateString()}`)
      .then((r) => r.json())
      .then((d) => setDays(d.days))
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (view === "list" && listTodos === null) {
      fetch("/api/dad/todos")
        .then((r) => r.json())
        .then((d) => setListTodos(d.todos))
        .catch(() => {});
    }
  }, [view, listTodos]);

  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        opacity: active ? 1 : 0,
        pointerEvents: active ? "auto" : "none",
        visibility: active ? "visible" : "hidden",
      }}
    >
      <div style={{ width: "100%", height: "100%", background: "linear-gradient(168deg,#EDE8DF 0%,#E4DCCE 100%)", display: "flex", flexDirection: "column", overflow: "hidden" }}>
        <div style={{ padding: "max(26px, env(safe-area-inset-top)) 18px 14px", flexShrink: 0, borderBottom: "1px solid rgba(200,190,180,0.25)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <h2 style={{ fontSize: 20, fontWeight: 700, color: "#1C1814", margin: 0, letterSpacing: -0.4, flex: 1 }}>Calendar</h2>
            <div style={{ display: "flex", alignItems: "center", background: "rgba(28,24,20,0.07)", borderRadius: 10, padding: 3, gap: 2, flexShrink: 0 }}>
              <button
                onClick={() => setView("week")}
                aria-label="Week view"
                style={{ padding: "6px 14px", borderRadius: 7, background: view === "week" ? "#FFF" : "transparent", boxShadow: view === "week" ? "0 1px 3px rgba(20,14,8,0.10)" : "none" }}
              >
                <span style={{ fontSize: 13, fontWeight: 600, color: view === "week" ? "#1C1814" : "#AFA89F" }}>Week</span>
              </button>
              <button
                onClick={() => setView("list")}
                aria-label="List view"
                style={{ padding: "6px 14px", borderRadius: 7, background: view === "list" ? "#FFF" : "transparent", boxShadow: view === "list" ? "0 1px 3px rgba(20,14,8,0.10)" : "none" }}
              >
                <span style={{ fontSize: 13, fontWeight: 600, color: view === "list" ? "#1C1814" : "#AFA89F" }}>List</span>
              </button>
            </div>
          </div>
        </div>

        <div style={{ flex: 1, overflowY: "auto", WebkitOverflowScrolling: "touch", padding: "16px 16px max(88px, calc(env(safe-area-inset-bottom) + 72px))" }}>
          {view === "week" && (
            <div>
              {!days ? (
                <p style={{ fontSize: 13.5, color: "#C2BBB2" }}>Loading…</p>
              ) : (
                days.map((day) => (
                  <div key={day.date} style={{ marginBottom: 8 }}>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 6,
                        padding: day.isToday ? "7px 10px" : "7px 4px",
                        background: day.isToday ? "rgba(43,77,140,0.07)" : "transparent",
                        borderRadius: 10,
                      }}
                    >
                      {day.isToday && <div style={{ width: 7, height: 7, borderRadius: "50%", background: "#2B4D8C", flexShrink: 0 }} />}
                      <span style={{ fontSize: 11, fontWeight: day.isToday ? 700 : 600, color: day.isToday ? "#2B4D8C" : "#6E6660", textTransform: "uppercase", letterSpacing: 0.9 }}>
                        {day.dayName}
                      </span>
                      <span style={{ fontSize: 14, fontWeight: day.isToday ? 700 : 600, color: day.isToday ? "#2B4D8C" : "#3A3430" }}>{day.dayNum}</span>
                      <span style={{ fontSize: 12, color: day.isToday ? "rgba(43,77,140,0.55)" : "#AFA89F" }}> {day.monthName}</span>
                    </div>
                    {day.items.length > 0 ? (
                      <div style={{ display: "flex", flexDirection: "column", gap: 5, marginTop: 6 }}>
                        {day.items.map((item) => {
                          const c = itemIconColors(item);
                          return (
                            <div
                              key={`${item.kind}-${item.id}`}
                              style={{ display: "flex", alignItems: "center", gap: 10, background: "#FFF", borderRadius: 14, padding: "9px 12px", boxShadow: "0 1px 3px rgba(20,14,8,0.04),0 4px 10px rgba(20,14,8,0.06)" }}
                            >
                              <div style={{ width: 36, height: 36, borderRadius: 10, flexShrink: 0, background: c.bg, display: "flex", alignItems: "center", justifyContent: "center" }}>
                                {item.kind === "todo" ? <CalIcon iconKey={item.icon || "pill"} color={c.accent} /> : <CalIcon iconKey="" color={c.accent} />}
                              </div>
                              <div style={{ flex: 1, minWidth: 0 }}>
                                <p style={{ fontSize: 14, fontWeight: 600, color: "#1C1814", margin: 0, lineHeight: 1.25 }}>{item.label}</p>
                                <p style={{ fontSize: 12, color: "#AFA89F", margin: "2px 0 0", lineHeight: 1.2 }}>{formatTime(item.time)}</p>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <div style={{ padding: "10px 12px", background: "rgba(200,190,180,0.12)", borderRadius: 12, marginTop: 6 }}>
                        <p style={{ fontSize: 13, color: "#C2BBB2", margin: 0, fontStyle: "italic" }}>No treatments scheduled</p>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          )}

          {view === "list" && (
            <div>
              <p style={{ fontSize: 11, fontWeight: 600, color: "#AFA89F", letterSpacing: 1, textTransform: "uppercase", margin: "0 0 14px 2px" }}>All treatments</p>
              {!listTodos ? (
                <p style={{ fontSize: 13.5, color: "#C2BBB2" }}>Loading…</p>
              ) : listTodos.length === 0 ? (
                <p style={{ fontSize: 13.5, color: "#C2BBB2" }}>No recurring tasks set up yet.</p>
              ) : (
                listTodos.map((t) => {
                  const c = getIconColors(t.icon);
                  return (
                    <div key={t.id} style={{ background: "#FFF", borderRadius: 20, padding: "16px 16px 14px", marginBottom: 10, boxShadow: "0 1px 3px rgba(20,14,8,0.04),0 6px 16px rgba(20,14,8,0.07)" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 12 }}>
                        <div style={{ width: 42, height: 42, borderRadius: 12, flexShrink: 0, background: c.bg, display: "flex", alignItems: "center", justifyContent: "center" }}>
                          <CalIcon iconKey={t.icon} color={c.accent} />
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <p style={{ fontSize: 15, fontWeight: 600, color: "#1C1814", margin: 0, lineHeight: 1.25 }}>{t.short_title || t.title.replace(/\n/g, " ")}</p>
                          <p style={{ fontSize: 12.5, color: "#AFA89F", margin: "3px 0 0", lineHeight: 1.2 }}>{formatTime(t.scheduled_time)}</p>
                        </div>
                      </div>
                      <div style={{ display: "flex", gap: 5, alignItems: "center" }}>
                        {SD.map((d) => {
                          const on = t.recurrence_days.includes(d);
                          return (
                            <div
                              key={d}
                              style={{
                                width: 34,
                                height: 28,
                                borderRadius: 8,
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                background: on ? c.accent : "rgba(28,24,20,0.05)",
                                color: on ? "#FFF" : "#C2BBB2",
                                fontSize: 11,
                                fontWeight: on ? 700 : 500,
                              }}
                            >
                              {d}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
