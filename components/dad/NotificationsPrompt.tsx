"use client";

import { useEffect, useState } from "react";
import { pushSupported, subscribeToPush } from "@/lib/push-client";

type State = "checking" | "subscribed" | "prompt" | "busy" | "denied" | "unsupported" | "error";

export default function NotificationsPrompt() {
  const [state, setState] = useState<State>("checking");
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    if (!pushSupported()) {
      setState("unsupported");
      return;
    }

    const permission = Notification.permission;

    if (permission === "denied") {
      setState("denied");
      return;
    }

    // Check if already subscribed
    navigator.serviceWorker.ready
      .then((reg) => reg.pushManager.getSubscription())
      .then((sub) => {
        if (sub) {
          // Has a subscription object — make sure it's also saved server-side
          fetch("/api/push/subscribe", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              subscription: sub.toJSON(),
              role: "dad",
              device_label: "Dad's device",
            }),
          }).catch(() => {});
          setState("subscribed");
        } else if (permission === "granted") {
          // Permission granted but no subscription — subscribe now automatically
          handleSubscribe();
        } else {
          // permission === "default" — show the prompt
          setState("prompt");
        }
      })
      .catch(() => setState("prompt"));
  }, []);

  async function handleSubscribe() {
    setState("busy");
    setErrorMsg("");
    const result = await subscribeToPush("dad", "Dad's device");
    if (result.ok) {
      setState("subscribed");
    } else if (result.reason === "denied") {
      setState("denied");
    } else if (result.reason === "not-configured") {
      setState("error");
      setErrorMsg("Push notifications aren't configured yet (missing VAPID key in server settings).");
    } else {
      setState("error");
      setErrorMsg("Couldn't enable notifications — tap to try again.");
    }
  }

  if (state === "checking" || state === "subscribed" || state === "unsupported") return null;

  if (state === "denied") {
    return (
      <div style={{ display: "flex", alignItems: "center", gap: 12, background: "#FFF", borderRadius: 18, padding: "14px 16px", marginBottom: 14, boxShadow: "0 2px 16px rgba(20,14,8,0.07),0 1px 3px rgba(20,14,8,0.04)" }}>
        <span style={{ fontSize: 22, lineHeight: 1, flexShrink: 0 }}>🔔</span>
        <div style={{ flex: 1 }}>
          <p style={{ fontSize: 14, fontWeight: 600, color: "#1C1814", margin: 0, lineHeight: 1.3 }}>Reminders are blocked</p>
          <p style={{ fontSize: 12, color: "#AFA89F", margin: "3px 0 0" }}>Go to Settings → Apps → this app → Notifications to turn them on</p>
        </div>
      </div>
    );
  }

  if (state === "error") {
    return (
      <div style={{ display: "flex", alignItems: "center", gap: 12, background: "#FFF", borderRadius: 18, padding: "14px 16px", marginBottom: 14, boxShadow: "0 2px 16px rgba(20,14,8,0.07),0 1px 3px rgba(20,14,8,0.04)" }}>
        <span style={{ fontSize: 22, lineHeight: 1, flexShrink: 0 }}>🔔</span>
        <div style={{ flex: 1 }}>
          <p style={{ fontSize: 13, color: "#C84040", margin: 0, lineHeight: 1.4 }}>{errorMsg}</p>
        </div>
        <button onClick={handleSubscribe} style={{ fontSize: 13, fontWeight: 600, color: "#2B4D8C", flexShrink: 0 }}>
          Retry
        </button>
      </div>
    );
  }

  // state === "prompt" or "busy"
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 12, background: "#FFF", borderRadius: 18, padding: "14px 16px", marginBottom: 14, boxShadow: "0 2px 16px rgba(20,14,8,0.07),0 1px 3px rgba(20,14,8,0.04)" }}>
      <span style={{ fontSize: 22, lineHeight: 1, flexShrink: 0 }}>🔔</span>
      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{ fontSize: 14, fontWeight: 600, color: "#1C1814", margin: 0, lineHeight: 1.3 }}>Get reminders for your tasks</p>
        <button
          onClick={handleSubscribe}
          disabled={state === "busy"}
          style={{ fontSize: 13, fontWeight: 600, color: "#2B4D8C", marginTop: 4 }}
        >
          {state === "busy" ? "Turning on…" : "Turn on"}
        </button>
      </div>
    </div>
  );
}
