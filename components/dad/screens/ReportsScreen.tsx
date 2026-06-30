"use client";

import { useState } from "react";
import { localDateString } from "@/lib/format";
import type { DadTodayData } from "@/components/dad/CompanionApp";

const DAY_LABELS = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];
const RATING_OPTS = [
  { emoji: "😔", label: "Bad", num: "1", value: 1 },
  { emoji: "😕", label: "Meh", num: "2", value: 2 },
  { emoji: "😐", label: "Okay", num: "3", value: 3 },
  { emoji: "🙂", label: "Good", num: "4", value: 4 },
  { emoji: "😊", label: "Great", num: "5", value: 5 },
];
const ENERGY_OPTS = [
  { label: "Low", value: "low" },
  { label: "Medium", value: "medium" },
  { label: "High", value: "high" },
];
const DISCOMFORT_OPTS = [
  { label: "None", value: "none" },
  { label: "Mild", value: "mild" },
  { label: "Significant", value: "significant" },
];
const SLEEP_OPTS = [
  { label: "Poor", value: "poor" },
  { label: "Fair", value: "fair" },
  { label: "Good", value: "good" },
];
const RATING_TEXT: Record<number, string> = { 1: "Bad", 2: "Not great", 3: "Okay", 4: "Good", 5: "Great" };
const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

export default function ReportsScreen({
  active,
  data,
  onRefetch,
}: {
  active: boolean;
  data: DadTodayData | null;
  onRefetch: () => Promise<void>;
}) {
  const [editing, setEditing] = useState(false);
  const [dayRating, setDayRating] = useState<number | null>(null);
  const [energy, setEnergy] = useState<string | null>(null);
  const [discomfort, setDiscomfort] = useState<string | null>(null);
  const [sleep, setSleep] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const checkin = data?.checkin;
  const showForm = !checkin?.submitted || editing;

  function startEdit() {
    setDayRating(checkin?.overall_day_rating ?? null);
    setEnergy(checkin?.energy_level ?? null);
    setDiscomfort(checkin?.pain_discomfort ?? null);
    setSleep(checkin?.sleep_quality ?? null);
    setEditing(true);
  }

  async function submitSurvey() {
    if (!dayRating || submitting) return;
    setSubmitting(true);
    await fetch("/api/dad/checkin", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        date: localDateString(),
        overall_day_rating: dayRating,
        energy_level: energy,
        pain_discomfort: discomfort,
        sleep_quality: sleep,
      }),
    });
    await onRefetch();
    setEditing(false);
    setSubmitting(false);
  }

  const total = data?.totalCount ?? 0;
  const completed = data?.completedCount ?? 0;
  const todayPct = total > 0 ? Math.round((completed / total) * 100) : 0;
  const todayPctLabel = total === 0 ? "Nothing scheduled" : todayPct === 100 ? "All done ✓" : todayPct > 0 ? `${todayPct}% done` : "Not started";
  const streak = data?.streak ?? 0;
  const weekBars = data?.weekBars ?? [0, 0, 0, 0, 0, 0, 0];
  const todayDow = new Date().getDay();

  const segStyle = (selected: boolean): React.CSSProperties => ({
    flex: 1,
    padding: "9px 4px",
    borderRadius: 11,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: selected ? "#2B4D8C" : "rgba(28,24,20,0.06)",
  });
  const segTextStyle = (selected: boolean): React.CSSProperties => ({ fontSize: 13, fontWeight: 600, color: selected ? "#FFF" : "#3A3430" });

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
          <h2 style={{ fontSize: 20, fontWeight: 700, color: "#1C1814", margin: 0, letterSpacing: -0.4 }}>Progress</h2>
        </div>

        <div style={{ flex: 1, overflowY: "auto", WebkitOverflowScrolling: "touch", padding: "14px 15px max(88px, calc(env(safe-area-inset-bottom) + 72px))" }}>
          <div style={{ display: "flex", gap: 10, marginBottom: 12 }}>
            <div style={{ flex: 1, background: "#FFF", borderRadius: 18, padding: 14, boxShadow: "0 1px 3px rgba(20,14,8,0.04),0 5px 14px rgba(20,14,8,0.07)" }}>
              <p style={{ fontSize: 10.5, fontWeight: 700, color: "#AFA89F", letterSpacing: 0.9, textTransform: "uppercase", margin: "0 0 7px" }}>Streak</p>
              <div style={{ display: "flex", alignItems: "baseline", gap: 4 }}>
                <span style={{ fontSize: 30, fontWeight: 700, color: "#1C1814", letterSpacing: -1.2, lineHeight: 1 }}>{streak}</span>
                <span style={{ fontSize: 13, color: "#AFA89F", fontWeight: 500 }}>days</span>
              </div>
              <p style={{ fontSize: 12, color: "#C49A30", margin: "5px 0 0", fontWeight: 600 }}>🔥 Keep it up!</p>
            </div>
            <div style={{ flex: 1, background: "#FFF", borderRadius: 18, padding: 14, boxShadow: "0 1px 3px rgba(20,14,8,0.04),0 5px 14px rgba(20,14,8,0.07)" }}>
              <p style={{ fontSize: 10.5, fontWeight: 700, color: "#AFA89F", letterSpacing: 0.9, textTransform: "uppercase", margin: "0 0 7px" }}>Today</p>
              <div style={{ display: "flex", alignItems: "baseline", gap: 4 }}>
                <span style={{ fontSize: 30, fontWeight: 700, color: "#1C1814", letterSpacing: -1.2, lineHeight: 1 }}>{completed}</span>
                <span style={{ fontSize: 13, color: "#AFA89F", fontWeight: 500 }}>/ {total}</span>
              </div>
              <p style={{ fontSize: 12, color: "#2B4D8C", margin: "5px 0 0", fontWeight: 600 }}>{todayPctLabel}</p>
            </div>
          </div>

          <div style={{ background: "#FFF", borderRadius: 20, padding: "15px 14px 13px", marginBottom: 12, boxShadow: "0 1px 3px rgba(20,14,8,0.04),0 5px 14px rgba(20,14,8,0.07)" }}>
            <p style={{ fontSize: 10.5, fontWeight: 700, color: "#AFA89F", letterSpacing: 1, textTransform: "uppercase", margin: "0 0 14px" }}>This week</p>
            <div style={{ display: "flex", gap: 5, alignItems: "flex-end", height: 90 }}>
              {weekBars.map((pct, i) => (
                <div key={i} style={{ flex: 1, height: "100%", display: "flex", flexDirection: "column", justifyContent: "flex-end", alignItems: "center", gap: 5 }}>
                  <div style={{ width: "100%", height: Math.max(5, Math.round((pct * 68) / 100)), borderRadius: 5, background: i === todayDow ? "#2B4D8C" : "rgba(43,77,140,0.22)", flexShrink: 0 }} />
                  <span style={{ fontSize: 10, fontWeight: i === todayDow ? 700 : 500, color: i === todayDow ? "#2B4D8C" : "#AFA89F", lineHeight: 1, flexShrink: 0 }}>{DAY_LABELS[i]}</span>
                </div>
              ))}
            </div>
          </div>

          {showForm ? (
            <div style={{ background: "#FFF", borderRadius: 20, padding: 20, marginBottom: 12, boxShadow: "0 1px 3px rgba(20,14,8,0.04),0 5px 14px rgba(20,14,8,0.07)" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
                <div style={{ width: 32, height: 32, borderRadius: 10, background: "#EDF1FB", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  <svg viewBox="0 0 18 18" width={16} height={16} fill="none">
                    <path d="M9 2a7 7 0 100 14A7 7 0 009 2z" stroke="#2B4D8C" strokeWidth={1.6} fill="none" />
                    <path d="M9 8v4" stroke="#2B4D8C" strokeWidth={1.6} strokeLinecap="round" />
                    <circle cx={9} cy={6} r={0.8} fill="#2B4D8C" />
                  </svg>
                </div>
                <p style={{ fontSize: 15, fontWeight: 700, color: "#1C1814", margin: 0, letterSpacing: -0.2 }}>Daily check-in</p>
              </div>

              <p style={{ fontSize: 13, fontWeight: 600, color: "#6E6660", margin: "0 0 11px" }}>How was your day overall?</p>
              <div style={{ display: "flex", gap: 5, marginBottom: 20 }}>
                {RATING_OPTS.map((o) => (
                  <button key={o.value} onClick={() => setDayRating(o.value)} style={segStyle(dayRating === o.value)}>
                    <span style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 3 }}>
                      <span style={{ fontSize: 22, lineHeight: 1.2 }}>{o.emoji}</span>
                      <span style={{ fontSize: 10, fontWeight: 600, color: dayRating === o.value ? "rgba(255,255,255,0.75)" : "#C2BBB2", lineHeight: 1.2 }}>{o.num}</span>
                    </span>
                  </button>
                ))}
              </div>

              <p style={{ fontSize: 13, fontWeight: 600, color: "#6E6660", margin: "0 0 11px" }}>Energy level?</p>
              <div style={{ display: "flex", gap: 6, marginBottom: 20 }}>
                {ENERGY_OPTS.map((o) => (
                  <button key={o.value} onClick={() => setEnergy(o.value)} style={segStyle(energy === o.value)}>
                    <span style={segTextStyle(energy === o.value)}>{o.label}</span>
                  </button>
                ))}
              </div>

              <p style={{ fontSize: 13, fontWeight: 600, color: "#6E6660", margin: "0 0 11px" }}>Any pain or discomfort?</p>
              <div style={{ display: "flex", gap: 6, marginBottom: 20 }}>
                {DISCOMFORT_OPTS.map((o) => (
                  <button key={o.value} onClick={() => setDiscomfort(o.value)} style={segStyle(discomfort === o.value)}>
                    <span style={segTextStyle(discomfort === o.value)}>{o.label}</span>
                  </button>
                ))}
              </div>

              <p style={{ fontSize: 13, fontWeight: 600, color: "#6E6660", margin: "0 0 11px" }}>How did you sleep last night?</p>
              <div style={{ display: "flex", gap: 6, marginBottom: 22 }}>
                {SLEEP_OPTS.map((o) => (
                  <button key={o.value} onClick={() => setSleep(o.value)} style={segStyle(sleep === o.value)}>
                    <span style={segTextStyle(sleep === o.value)}>{o.label}</span>
                  </button>
                ))}
              </div>

              <button
                onClick={submitSurvey}
                disabled={!dayRating || submitting}
                style={{
                  width: "100%",
                  height: 50,
                  borderRadius: 16,
                  background: dayRating ? "linear-gradient(152deg,#2B4D8C 0%,#1E3264 100%)" : "rgba(28,24,20,0.10)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  opacity: submitting ? 0.7 : 1,
                }}
              >
                <span style={{ fontSize: 15, fontWeight: 600, color: "#FFF" }}>{submitting ? "Saving…" : "Save check-in"}</span>
              </button>
            </div>
          ) : (
            <div style={{ background: "#FFF", borderRadius: 20, padding: 15, marginBottom: 12, boxShadow: "0 1px 3px rgba(20,14,8,0.04),0 5px 14px rgba(20,14,8,0.07)" }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
                <p style={{ fontSize: 15, fontWeight: 700, color: "#1C1814", margin: 0 }}>Today&apos;s check-in</p>
                <button onClick={startEdit} style={{ fontSize: 12, color: "#C2BBB2", fontWeight: 500 }}>
                  Edit
                </button>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                <Row q="Day overall" a={checkin?.overall_day_rating ? `${RATING_TEXT[checkin.overall_day_rating]} (${checkin.overall_day_rating}/5)` : "—"} />
                <Row q="Energy" a={checkin?.energy_level ? cap(checkin.energy_level) : "—"} />
                <Row q="Discomfort" a={checkin?.pain_discomfort ? cap(checkin.pain_discomfort) : "—"} />
                <Row q="Sleep" a={checkin?.sleep_quality ? cap(checkin.sleep_quality) : "—"} />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function Row({ q, a }: { q: string; a: string }) {
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
      <span style={{ fontSize: 13, color: "#AFA89F" }}>{q}</span>
      <span style={{ fontSize: 13, fontWeight: 600, color: "#1C1814" }}>{a}</span>
    </div>
  );
}
