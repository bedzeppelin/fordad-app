"use client";

import { useState } from "react";
import { localDateString } from "@/lib/format";
import { TaskIcon, ClockHintIcon, DoneCheckIcon, CheckBigIcon } from "@/components/dad/icons";
import type { DadTodayData } from "@/components/dad/CompanionApp";

export default function TodosScreen({
  active,
  data,
  onRefetch,
}: {
  active: boolean;
  data: DadTodayData | null;
  onRefetch: () => Promise<void>;
}) {
  const [pressed, setPressed] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const todos = data?.todos ?? [];
  const total = todos.length;
  const activeTasks = todos.filter((t) => !t.completed);
  const activeTask = activeTasks[0] ?? null;
  const nextTask = activeTasks[1] ?? null;
  const completedCount = total - activeTasks.length;

  async function handleDone() {
    if (!activeTask || submitting) return;
    setSubmitting(true);
    await fetch(`/api/dad/todos/${activeTask.id}/complete`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ date: localDateString() }),
    });
    await onRefetch();
    setSubmitting(false);
  }

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
      <div style={{ width: "100%", height: "100%", background: "linear-gradient(168deg,#EDE8DF 0%,#E4DCCE 100%)", display: "flex", flexDirection: "column", overflow: "hidden", position: "relative" }}>
        <div style={{ padding: "max(38px, env(safe-area-inset-top)) 22px 0", flexShrink: 0 }}>
          <h2 style={{ fontSize: 22, fontWeight: 700, color: "#1C1814", margin: "0 0 14px", letterSpacing: -0.4 }}>Daily tasks</h2>
          <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
            {todos.map((t) => (
              <div
                key={t.id}
                style={{
                  width: t.completed ? 20 : 8,
                  height: 8,
                  borderRadius: 4,
                  flexShrink: 0,
                  background: t.completed ? "#2B4D8C" : activeTask?.id === t.id ? "rgba(43,77,140,0.36)" : "#D6D0C8",
                }}
              />
            ))}
            <span style={{ fontSize: 12, color: "#C2BBB2", marginLeft: 8 }}>
              {total === 0 ? "No tasks configured" : completedCount === 0 ? "Starting your day" : completedCount === total ? "All done!" : `${completedCount} of ${total} complete`}
            </span>
          </div>
        </div>

        {total === 0 && (
          <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", padding: 32, textAlign: "center" }}>
            <p style={{ fontSize: 15, color: "#AFA89F", lineHeight: 1.6 }}>No tasks set up yet. Ask for help adding some in Care Admin.</p>
          </div>
        )}

        {activeTask && (
          <>
            <div style={{ flex: 1, display: "flex", flexDirection: "column", padding: "14px 16px 0", minHeight: 0 }}>
              <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
                <div
                  style={{
                    flex: 1,
                    display: "flex",
                    flexDirection: "column",
                    background: "#FFF",
                    borderRadius: 28,
                    boxShadow: "0 1px 3px rgba(20,14,8,0.04),0 8px 24px rgba(20,14,8,0.08),0 24px 48px rgba(20,14,8,0.08)",
                    padding: "22px 22px 20px",
                    overflow: "hidden",
                    position: "relative",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 18, flexShrink: 0 }}>
                    <div
                      style={{
                        width: 58,
                        height: 58,
                        borderRadius: 16,
                        background: "linear-gradient(148deg,#EDF1FB 0%,#E1E9F8 100%)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        flexShrink: 0,
                        boxShadow: "0 2px 8px rgba(43,77,140,0.10)",
                      }}
                    >
                      <TaskIcon iconKey={activeTask.icon} />
                    </div>
                    <div style={{ padding: "6px 13px", background: "#F2EEE8", borderRadius: 40, flexShrink: 0, marginTop: 2 }}>
                      <span style={{ fontSize: 10, fontWeight: 600, color: "#AFA89F", letterSpacing: 1.1, textTransform: "uppercase" }}>
                        {activeTask.category_label}
                      </span>
                    </div>
                  </div>
                  <h2 style={{ fontSize: 40, fontWeight: 700, color: "#1C1814", lineHeight: 1.02, margin: "0 0 12px", letterSpacing: -1.6, whiteSpace: "pre-line", flexShrink: 0 }}>
                    {activeTask.title}
                  </h2>
                  <p style={{ fontSize: 16, color: "#7E7870", lineHeight: 1.65, margin: 0, flexShrink: 0 }}>{activeTask.description}</p>
                  <div style={{ flex: 1, minHeight: 12 }} />
                  <div style={{ display: "flex", alignItems: "center", gap: 7, paddingTop: 14, borderTop: "1px solid #F0EAE0", flexShrink: 0 }}>
                    <ClockHintIcon />
                    <span style={{ fontSize: 13, color: "#C2BBB2" }}>{activeTask.hint}</span>
                  </div>
                </div>
              </div>
            </div>

            <div style={{ padding: "16px 16px max(90px, calc(env(safe-area-inset-bottom) + 74px))", flexShrink: 0 }}>
              <div style={{ height: 26, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 10 }}>
                {nextTask ? (
                  <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    <span style={{ fontSize: 12.5, color: "#C2BBB2" }}>Up next</span>
                    <span style={{ fontSize: 12.5, color: "#D8D1C8" }}>·</span>
                    <span style={{ fontSize: 12.5, fontWeight: 500, color: "#A09890" }}>{nextTask.short_title || nextTask.title.replace(/\n/g, " ")}</span>
                  </div>
                ) : (
                  <span style={{ fontSize: 12.5, color: "#C2BBB2" }}>Last one today — almost there.</span>
                )}
              </div>
              <button
                onClick={handleDone}
                onMouseDown={() => setPressed(true)}
                onMouseUp={() => setPressed(false)}
                onMouseLeave={() => setPressed(false)}
                onTouchStart={() => setPressed(true)}
                onTouchEnd={() => setPressed(false)}
                disabled={submitting}
                aria-label="Mark task as done"
                style={{
                  width: "100%",
                  height: 68,
                  borderRadius: 22,
                  background: pressed ? "linear-gradient(152deg,#1E3870 0%,#192E60 100%)" : "linear-gradient(152deg,#2B4D8C 0%,#1E3264 100%)",
                  boxShadow: pressed ? "0 4px 14px rgba(30,50,112,0.22)" : "0 4px 20px rgba(30,50,112,0.26),0 14px 40px rgba(30,50,112,0.16)",
                  transform: pressed ? "scale(0.975)" : "scale(1)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  opacity: submitting ? 0.7 : 1,
                }}
              >
                <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 10, pointerEvents: "none" }}>
                  <DoneCheckIcon />
                  <span style={{ fontSize: 19, fontWeight: 600, color: "#FFF", letterSpacing: -0.3 }}>Done</span>
                </div>
              </button>
            </div>
          </>
        )}

        {total > 0 && !activeTask && (
          <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "32px 24px" }}>
            <div
              style={{
                width: 72,
                height: 72,
                borderRadius: 24,
                background: "linear-gradient(148deg,#EDF6F1 0%,#D6EEE1 100%)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                marginBottom: 20,
                boxShadow: "0 4px 16px rgba(46,128,80,0.15)",
              }}
            >
              <CheckBigIcon />
            </div>
            <h3 style={{ fontSize: 22, fontWeight: 700, color: "#1C1814", margin: "0 0 8px", letterSpacing: -0.4, textAlign: "center" }}>All done for today!</h3>
            <p style={{ fontSize: 15, color: "#AFA89F", margin: 0, textAlign: "center", lineHeight: 1.65 }}>You&apos;ve completed every task on your list. Well done.</p>
          </div>
        )}
      </div>
    </div>
  );
}
