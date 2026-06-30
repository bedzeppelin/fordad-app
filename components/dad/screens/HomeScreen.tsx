"use client";

import { useState } from "react";
import { localDateString, formatTime, formatDate } from "@/lib/format";
import { AppointmentIcon, MinusIcon, PlusBigIcon, WaterCupSvg } from "@/components/dad/icons";
import NotificationsPrompt from "@/components/dad/NotificationsPrompt";
import type { DadTodayData, DadScreen } from "@/components/dad/CompanionApp";

const MOODS = [
  { key: "great", emoji: "😊", label: "Great" },
  { key: "good", emoji: "🙂", label: "Good" },
  { key: "okay", emoji: "😐", label: "Okay" },
  { key: "low", emoji: "😞", label: "Low" },
];

export default function HomeScreen({
  active,
  data,
  patientName,
  onRefetch,
  onNavigate,
}: {
  active: boolean;
  data: DadTodayData | null;
  patientName: string;
  onRefetch: () => void;
  onNavigate: (s: DadScreen) => void;
}) {
  const [busy, setBusy] = useState(false);
  const hour = new Date().getHours();
  const greeting = `Good ${hour < 12 ? "morning" : hour < 17 ? "afternoon" : "evening"}, ${patientName}.`;
  const todayLabel = new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" });

  async function adjustWater(delta: 1 | -1) {
    if (busy) return;
    setBusy(true);
    await fetch("/api/dad/water", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ date: localDateString(), delta }),
    });
    onRefetch();
    setBusy(false);
  }

  async function selectMood(mood: string) {
    if (busy) return;
    setBusy(true);
    await fetch("/api/dad/mood", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ date: localDateString(), mood }),
    });
    onRefetch();
    setBusy(false);
  }

  const streak = data?.streak ?? 0;
  const water = data?.water ?? { count: 0, target: 8 };
  const mood = data?.mood ?? { submitted: false, value: null };
  const selectedMood = MOODS.find((m) => m.key === mood.value);

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
      <div style={{ width: "100%", height: "100%", background: "#EDE8DF", display: "flex", flexDirection: "column", overflow: "hidden" }}>
        <div style={{ flex: 1, overflowY: "auto", WebkitOverflowScrolling: "touch", padding: "max(36px, env(safe-area-inset-top)) 18px 100px" }}>
          <div style={{ marginBottom: 28, padding: "0 2px" }}>
            <h1 style={{ fontSize: 38, fontWeight: 800, color: "#1C1814", lineHeight: 1.06, margin: "0 0 5px", letterSpacing: -1 }}>{greeting}</h1>
            <p style={{ fontSize: 14.5, color: "#AFA89F", margin: 0, fontWeight: 400 }}>{todayLabel}</p>
          </div>

          <NotificationsPrompt />

          <div style={{ display: "flex", alignItems: "center", gap: 14, background: "#F6EDD6", borderRadius: 20, padding: "16px 18px", marginBottom: 16 }}>
            <span style={{ fontSize: 34, lineHeight: 1, flexShrink: 0 }}>🔥</span>
            <div style={{ flex: 1, minWidth: 0 }}>
              <p style={{ fontSize: 16, fontWeight: 700, color: "#C47800", margin: 0, lineHeight: 1.2 }}>
                {streak} day{streak !== 1 ? "s" : ""} in a row
              </p>
              <p style={{ fontSize: 13, color: "#D4A052", margin: "3px 0 0", lineHeight: 1.2 }}>Keep up the great work!</p>
            </div>
            <div style={{ display: "flex", gap: 5, alignItems: "center", flexShrink: 0 }}>
              {Array.from({ length: 7 }, (_, i) => (
                <div
                  key={i}
                  style={{ width: 9, height: 9, borderRadius: "50%", background: i < Math.min(streak, 7) ? "#D97000" : "rgba(210,138,0,0.22)", flexShrink: 0 }}
                />
              ))}
            </div>
          </div>

          <div style={{ background: "#FFFFFF", borderRadius: 22, padding: "20px 18px 16px", marginBottom: 14, boxShadow: "0 2px 16px rgba(20,14,8,0.07),0 1px 3px rgba(20,14,8,0.04)" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
              <span style={{ fontSize: 18, fontWeight: 700, color: "#1C1814", letterSpacing: -0.3 }}>Upcoming</span>
              <button onClick={() => onNavigate("calendar")} style={{ fontSize: 14, fontWeight: 600, color: "#2B4D8C" }}>
                See all →
              </button>
            </div>
            {(!data || data.upcomingEvents.length === 0) ? (
              <p style={{ fontSize: 13.5, color: "#C2BBB2", margin: 0 }}>Nothing scheduled right now.</p>
            ) : (
              data.upcomingEvents.map((appt, i) => (
                <div key={appt.id}>
                  <div style={{ display: "flex", alignItems: "center", gap: 14, padding: "4px 0" }}>
                    <div style={{ width: 52, height: 52, borderRadius: 14, background: "#EDF1FB", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                      <AppointmentIcon color="#2B4D8C" />
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ fontSize: 15.5, fontWeight: 600, color: "#1C1814", margin: 0, lineHeight: 1.25 }}>{appt.title}</p>
                      <p style={{ fontSize: 13, color: "#AFA89F", margin: "3px 0 0" }}>{formatDate(appt.date)}</p>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: 7, flexShrink: 0 }}>
                      <div style={{ padding: "8px 12px", background: "#F2EEE8", borderRadius: 10 }}>
                        <span style={{ fontSize: 13, fontWeight: 600, color: "#6E6660" }}>{formatTime(appt.time)}</span>
                      </div>
                    </div>
                  </div>
                  {i < data.upcomingEvents.length - 1 && <div style={{ height: 1, background: "rgba(200,190,180,0.30)", margin: "12px 0 4px" }} />}
                </div>
              ))
            )}
          </div>

          <div style={{ background: "#FFFFFF", borderRadius: 22, padding: "20px 18px", marginBottom: 14, boxShadow: "0 2px 16px rgba(20,14,8,0.07),0 1px 3px rgba(20,14,8,0.04)" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
                <span style={{ fontSize: 22, lineHeight: 1 }}>💧</span>
                <span style={{ fontSize: 16, fontWeight: 600, color: "#1C1814" }}>Water today</span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <button
                  onClick={() => adjustWater(-1)}
                  aria-label="Remove a glass"
                  style={{ width: 38, height: 38, borderRadius: 12, background: "#F2EEE8", display: "flex", alignItems: "center", justifyContent: "center" }}
                >
                  <MinusIcon />
                </button>
                <span style={{ fontSize: 22, fontWeight: 700, color: "#1C1814", minWidth: 24, textAlign: "center", lineHeight: 1 }}>{water.count}</span>
                <button
                  onClick={() => adjustWater(1)}
                  aria-label="Add a glass"
                  style={{ width: 38, height: 38, borderRadius: 12, background: "#2B4D8C", display: "flex", alignItems: "center", justifyContent: "center" }}
                >
                  <PlusBigIcon />
                </button>
              </div>
            </div>
            <div style={{ display: "flex", gap: 4, marginBottom: 12, alignItems: "flex-end" }}>
              {Array.from({ length: water.target }, (_, i) => (
                <div key={i} style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <WaterCupSvg filled={i < water.count} />
                </div>
              ))}
            </div>
            <p style={{ fontSize: 13, color: water.count >= water.target ? "#2E8050" : "#AFA89F", fontWeight: water.count >= water.target ? 600 : 400, margin: 0 }}>
              {water.count >= water.target
                ? "💧 Water goal complete for today!"
                : `${water.count} of ${water.target} glasses`}
            </p>
          </div>

          {!mood.submitted ? (
            <div style={{ background: "#FFFFFF", borderRadius: 22, padding: "20px 18px", marginBottom: 14, boxShadow: "0 2px 16px rgba(20,14,8,0.07),0 1px 3px rgba(20,14,8,0.04)" }}>
              <p style={{ fontSize: 18, fontWeight: 700, color: "#1C1814", margin: "0 0 16px", letterSpacing: -0.3 }}>How are you feeling?</p>
              <div style={{ display: "flex", gap: 8 }}>
                {MOODS.map((m) => (
                  <button
                    key={m.key}
                    onClick={() => selectMood(m.key)}
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: 8,
                      padding: "16px 8px 14px",
                      borderRadius: 16,
                      background: "#F5F3F0",
                      flex: 1,
                      border: "1.5px solid transparent",
                    }}
                  >
                    <span style={{ fontSize: 32, lineHeight: 1.2 }}>{m.emoji}</span>
                    <span style={{ fontSize: 13, fontWeight: 500, color: "#7E7870", lineHeight: 1.2 }}>{m.label}</span>
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div
              style={{
                background: "#FFFFFF",
                borderRadius: 22,
                padding: 18,
                marginBottom: 14,
                boxShadow: "0 2px 16px rgba(20,14,8,0.07),0 1px 3px rgba(20,14,8,0.04)",
                display: "flex",
                alignItems: "center",
                gap: 12,
              }}
            >
              <span style={{ fontSize: 28, lineHeight: 1 }}>{selectedMood?.emoji ?? "🙂"}</span>
              <div style={{ flex: 1 }}>
                <p style={{ fontSize: 15, fontWeight: 600, color: "#1C1814", margin: 0, lineHeight: 1.2 }}>
                  Feeling {selectedMood?.label.toLowerCase() ?? ""}
                </p>
                <p style={{ fontSize: 12, color: "#AFA89F", margin: "3px 0 0" }}>Checked in today</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
