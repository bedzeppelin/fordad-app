"use client";

import { useEffect, useMemo, useState } from "react";
import { COLORS } from "@/lib/colors";
import { formatDateTimeShort } from "@/lib/format";
import { MicSmallIcon, TrashIcon } from "@/components/icons";
import ConfirmDialog from "@/components/admin/ConfirmDialog";
import type { VoiceNote } from "@/lib/types";

export default function VoiceNotesPage() {
  const [notes, setNotes] = useState<VoiceNote[]>([]);
  const [loading, setLoading] = useState(true);
  const [dateFilter, setDateFilter] = useState("");
  const [pendingDelete, setPendingDelete] = useState<VoiceNote | null>(null);

  useEffect(() => {
    fetch("/api/admin/voice-notes")
      .then((r) => r.json())
      .then((d) => setNotes(d.notes ?? []))
      .finally(() => setLoading(false));
  }, []);

  const filtered = useMemo(
    () => (dateFilter ? notes.filter((n) => n.date === dateFilter) : notes),
    [notes, dateFilter]
  );

  async function handleDelete() {
    if (!pendingDelete) return;
    const id = pendingDelete.id;
    setPendingDelete(null);
    setNotes((prev) => prev.filter((n) => n.id !== id));
    await fetch(`/api/admin/voice-notes/${id}`, { method: "DELETE" });
  }

  return (
    <div style={{ padding: "28px 28px 60px", maxWidth: 680 }}>
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12, marginBottom: 22 }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 700, color: COLORS.ink, margin: "0 0 3px", letterSpacing: -0.5 }}>Voice Notes</h1>
          <p style={{ fontSize: 13, color: COLORS.inkFaint, margin: 0 }}>
            {notes.length === 0 ? "No notes yet" : `${notes.length} note${notes.length !== 1 ? "s" : ""}`} · synced live from the app
          </p>
        </div>
        <input
          type="date"
          value={dateFilter}
          onChange={(e) => setDateFilter(e.target.value)}
          style={{
            padding: "8px 11px",
            borderRadius: 10,
            border: `1.5px solid ${COLORS.border}`,
            fontSize: 13,
            background: COLORS.inputBg,
            color: COLORS.ink,
            outline: "none",
          }}
        />
      </div>

      {!loading && filtered.length === 0 && (
        <div
          style={{
            background: COLORS.card,
            borderRadius: 16,
            padding: "40px 24px",
            textAlign: "center",
            border: `1.5px dashed ${COLORS.border}`,
          }}
        >
          <div
            style={{
              width: 44,
              height: 44,
              borderRadius: 13,
              background: "rgba(168,72,72,0.08)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "0 auto 14px",
            }}
          >
            <MicSmallIcon />
          </div>
          <p style={{ fontSize: 14, color: COLORS.inkFainter, margin: 0, lineHeight: 1.7 }}>
            {notes.length === 0
              ? "No notes yet. When Dad records a voice note in the companion app, it will appear here in full."
              : "No notes on that date."}
          </p>
        </div>
      )}

      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {filtered.map((note) => {
          const { date, time } = formatDateTimeShort(note.recorded_at);
          const fields = note.extracted_fields || {};
          const hasFields = fields && Object.values(fields).some((v) => Array.isArray(v) ? v.length > 0 : !!v);
          return (
            <div
              key={note.id}
              style={{
                background: COLORS.card,
                borderRadius: 18,
                padding: 18,
                boxShadow: "0 1px 2px rgba(20,14,8,0.03),0 3px 10px rgba(20,14,8,0.06)",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <div
                    style={{
                      width: 27,
                      height: 27,
                      borderRadius: 8,
                      background: "rgba(168,72,72,0.08)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <MicSmallIcon />
                  </div>
                  <span style={{ fontSize: 12, fontWeight: 500, color: COLORS.inkFaint }}>
                    {date} · {time}
                  </span>
                </div>
                <button
                  onClick={() => setPendingDelete(note)}
                  aria-label="Delete"
                  style={{ width: 28, height: 28, borderRadius: 7, background: COLORS.redBgStrong, display: "flex", alignItems: "center", justifyContent: "center" }}
                >
                  <TrashIcon />
                </button>
              </div>

              {note.summary_bullets?.length > 0 ? (
                <ul style={{ margin: "0 0 14px", padding: "0 0 0 18px" }}>
                  {note.summary_bullets.map((b, i) => (
                    <li key={i} style={{ fontSize: 14, color: COLORS.ink, lineHeight: 1.6 }}>
                      {b}
                    </li>
                  ))}
                </ul>
              ) : (
                <p style={{ fontSize: 13.5, color: COLORS.inkFainter, margin: "0 0 14px" }}>No summary generated yet.</p>
              )}

              {hasFields && (
                <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 14 }}>
                  {Object.entries(fields).map(([key, value]) => {
                    if (!value || (Array.isArray(value) && value.length === 0)) return null;
                    const display = Array.isArray(value) ? value.join(", ") : String(value);
                    return (
                      <span
                        key={key}
                        style={{
                          fontSize: 11.5,
                          fontWeight: 600,
                          color: COLORS.blue,
                          background: COLORS.blueBg,
                          padding: "4px 9px",
                          borderRadius: 7,
                        }}
                      >
                        {key.replace(/_/g, " ")}: {display}
                      </span>
                    );
                  })}
                </div>
              )}

              <details>
                <summary style={{ fontSize: 12, fontWeight: 600, color: COLORS.inkMuted, cursor: "pointer" }}>
                  Full transcript
                </summary>
                <p style={{ fontSize: 13, color: COLORS.inkMuted, lineHeight: 1.6, margin: "8px 0 0", whiteSpace: "pre-wrap" }}>
                  {note.raw_transcript || "(empty)"}
                </p>
              </details>
            </div>
          );
        })}
      </div>

      {pendingDelete && (
        <ConfirmDialog
          title="Delete this voice note?"
          message="This removes the recording's transcript and summary permanently."
          onConfirm={handleDelete}
          onCancel={() => setPendingDelete(null)}
        />
      )}
    </div>
  );
}
