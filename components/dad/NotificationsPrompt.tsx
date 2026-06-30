"use client";

import { useEffect, useState } from "react";
import { pushSupported, subscribeToPush } from "@/lib/push-client";

const DISMISS_KEY = "companion-notif-dismissed-v1";

export default function NotificationsPrompt() {
  const [visible, setVisible] = useState(false);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!pushSupported()) return;
    if (localStorage.getItem(DISMISS_KEY)) return;

    if (Notification.permission === "granted") {
      // Already decided — keep the subscription fresh in the background, no UI needed.
      subscribeToPush("dad", "Dad's device").catch(() => {});
      return;
    }
    if (Notification.permission === "default") {
      setVisible(true);
    }
  }, []);

  async function handleEnable() {
    setBusy(true);
    await subscribeToPush("dad", "Dad's device");
    setBusy(false);
    setVisible(false);
    localStorage.setItem(DISMISS_KEY, "1");
  }

  function handleDismiss() {
    setVisible(false);
    localStorage.setItem(DISMISS_KEY, "1");
  }

  if (!visible) return null;

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 12,
        background: "#FFFFFF",
        borderRadius: 18,
        padding: "14px 16px",
        marginBottom: 14,
        boxShadow: "0 2px 16px rgba(20,14,8,0.07),0 1px 3px rgba(20,14,8,0.04)",
      }}
    >
      <span style={{ fontSize: 22, lineHeight: 1, flexShrink: 0 }}>🔔</span>
      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{ fontSize: 14, fontWeight: 600, color: "#1C1814", margin: 0, lineHeight: 1.3 }}>Get reminders for your tasks</p>
        <button onClick={handleEnable} disabled={busy} style={{ fontSize: 13, fontWeight: 600, color: "#2B4D8C", marginTop: 4 }}>
          {busy ? "Turning on…" : "Turn on"}
        </button>
      </div>
      <button onClick={handleDismiss} aria-label="Dismiss" style={{ fontSize: 12, color: "#C2BBB2", flexShrink: 0 }}>
        Not now
      </button>
    </div>
  );
}
