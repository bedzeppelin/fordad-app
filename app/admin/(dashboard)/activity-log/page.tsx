"use client";

import { useEffect, useMemo, useState } from "react";
import { COLORS } from "@/lib/colors";
import { dayLabelForDate } from "@/lib/format";
import { TodoIcon } from "@/components/icons";
import type { ActivityLogEntry } from "@/lib/types";

export default function ActivityLogPage() {
  const [entries, setEntries] = useState<ActivityLogEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/activity-log")
      .then((r) => r.json())
      .then((d) => setEntries(d.entries ?? []))
      .finally(() => setLoading(false));
  }, []);

  const groups = useMemo(() => {
    const map = new Map<string, ActivityLogEntry[]>();
    const order: string[] = [];
    for (const e of entries) {
      const label = dayLabelForDate(e.completed_at);
      if (!map.has(label)) {
        map.set(label, []);
        order.push(label);
      }
      map.get(label)!.push(e);
    }
    return order.map((label) => ({ label, entries: map.get(label)! }));
  }, [entries]);

  return (
    <div style={{ padding: "28px 28px 60px", maxWidth: 680 }}>
      <div style={{ marginBottom: 22 }}>
        <h1 style={{ fontSize: 22, fontWeight: 700, color: COLORS.ink, margin: "0 0 3px", letterSpacing: -0.5 }}>Activity Log</h1>
        <p style={{ fontSize: 13, color: COLORS.inkFaint, margin: 0 }}>Every task Dad completed, with timestamps</p>
      </div>

      {!loading && entries.length === 0 && (
        <div
          style={{
            background: COLORS.card,
            borderRadius: 16,
            padding: "40px 24px",
            textAlign: "center",
            border: `1.5px dashed ${COLORS.border}`,
          }}
        >
          <p style={{ fontSize: 14, color: COLORS.inkFainter, margin: 0, lineHeight: 1.7 }}>
            No activity logged yet.
            <br />
            Completions from the companion app will appear here.
          </p>
        </div>
      )}

      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        {groups.map((group) => (
          <div key={group.label}>
            <p
              style={{
                fontSize: 10.5,
                fontWeight: 700,
                color: COLORS.inkFaint,
                letterSpacing: 1.1,
                textTransform: "uppercase",
                margin: "0 0 8px 2px",
              }}
            >
              {group.label}
            </p>
            <div
              style={{
                background: COLORS.card,
                borderRadius: 16,
                overflow: "hidden",
                boxShadow: "0 1px 2px rgba(20,14,8,0.03),0 3px 10px rgba(20,14,8,0.06)",
              }}
            >
              {group.entries.map((entry, i) => (
                <div
                  key={entry.id}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 11,
                    padding: "11px 15px",
                    borderBottom: i < group.entries.length - 1 ? `1px solid ${COLORS.borderSoft}` : "none",
                  }}
                >
                  <div style={{ width: 7, height: 7, borderRadius: "50%", background: "rgba(43,77,140,0.22)", flexShrink: 0 }} />
                  <div
                    style={{
                      width: 32,
                      height: 32,
                      borderRadius: 9,
                      background: COLORS.neutralBg,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexShrink: 0,
                    }}
                  >
                    <TodoIcon iconKey={entry.todo_icon} color={COLORS.inkFaint} size={16} />
                  </div>
                  <p
                    style={{
                      flex: 1,
                      fontSize: 14,
                      fontWeight: 500,
                      color: COLORS.ink,
                      margin: 0,
                      minWidth: 0,
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {entry.todo_title}
                  </p>
                  <span style={{ fontSize: 12, color: COLORS.inkFaint, fontWeight: 500, flexShrink: 0 }}>
                    {new Date(entry.completed_at).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", hour12: true })}
                  </span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
