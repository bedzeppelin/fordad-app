"use client";

import { useEffect, useState } from "react";
import { COLORS } from "@/lib/colors";
import { pushSupported, subscribeToPush } from "@/lib/push-client";

export default function SettingsPage() {
  const [patientName, setPatientName] = useState("");
  const [loading, setLoading] = useState(true);
  const [savingName, setSavingName] = useState(false);
  const [nameMessage, setNameMessage] = useState<{ ok: boolean; text: string } | null>(null);

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [savingPassword, setSavingPassword] = useState(false);
  const [passwordMessage, setPasswordMessage] = useState<{ ok: boolean; text: string } | null>(null);

  const [notifStatus, setNotifStatus] = useState<"idle" | "enabling" | "on" | "denied" | "unsupported">("idle");
  const [testStatus, setTestStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");

  useEffect(() => {
    if (!pushSupported()) {
      setNotifStatus("unsupported");
    } else if (Notification.permission === "granted") {
      setNotifStatus("on");
    } else if (Notification.permission === "denied") {
      setNotifStatus("denied");
    }
  }, []);

  async function enableNotifications() {
    setNotifStatus("enabling");
    const result = await subscribeToPush("admin", "Care Admin device");
    setNotifStatus(result.ok ? "on" : result.reason === "denied" ? "denied" : "idle");
  }

  async function sendTestNotification() {
    setTestStatus("sending");
    const res = await fetch("/api/push/test", { method: "POST" });
    setTestStatus(res.ok ? "sent" : "error");
    setTimeout(() => setTestStatus("idle"), 3000);
  }

  useEffect(() => {
    fetch("/api/admin/settings")
      .then((r) => r.json())
      .then((d) => setPatientName(d.patient_name || "Dad"))
      .finally(() => setLoading(false));
  }, []);

  async function saveName() {
    if (!patientName.trim() || savingName) return;
    setSavingName(true);
    setNameMessage(null);
    const res = await fetch("/api/admin/settings", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ patient_name: patientName.trim() }),
    });
    const data = await res.json();
    setNameMessage(res.ok ? { ok: true, text: "Saved" } : { ok: false, text: data.error || "Couldn't save" });
    setSavingName(false);
  }

  async function savePassword() {
    if (savingPassword) return;
    setPasswordMessage(null);
    if (!currentPassword || !newPassword) {
      setPasswordMessage({ ok: false, text: "Fill in both password fields" });
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordMessage({ ok: false, text: "New passwords don't match" });
      return;
    }
    if (newPassword.length < 6) {
      setPasswordMessage({ ok: false, text: "New password must be at least 6 characters" });
      return;
    }
    setSavingPassword(true);
    const res = await fetch("/api/admin/settings", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ current_password: currentPassword, new_password: newPassword }),
    });
    const data = await res.json();
    if (res.ok) {
      setPasswordMessage({ ok: true, text: "Password updated" });
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } else {
      setPasswordMessage({ ok: false, text: data.error || "Couldn't update password" });
    }
    setSavingPassword(false);
  }

  const labelStyle: React.CSSProperties = {
    display: "block",
    fontSize: 11,
    fontWeight: 700,
    color: COLORS.inkMuted,
    letterSpacing: 0.7,
    textTransform: "uppercase",
    marginBottom: 7,
  };
  const inputStyle: React.CSSProperties = {
    width: "100%",
    padding: "12px 14px",
    borderRadius: 12,
    border: `1.5px solid ${COLORS.border}`,
    fontSize: 15,
    background: COLORS.inputBg,
    color: COLORS.ink,
    outline: "none",
  };
  const cardStyle: React.CSSProperties = {
    background: COLORS.card,
    borderRadius: 18,
    padding: 22,
    boxShadow: "0 1px 2px rgba(20,14,8,0.03),0 3px 10px rgba(20,14,8,0.06)",
    marginBottom: 18,
  };
  const saveBtnStyle = (disabled: boolean): React.CSSProperties => ({
    padding: "11px 20px",
    borderRadius: 12,
    background: COLORS.blueGradient,
    color: "#FFF",
    fontSize: 14,
    fontWeight: 600,
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    opacity: disabled ? 0.6 : 1,
  });

  if (loading) {
    return (
      <div style={{ padding: "28px 28px 60px", maxWidth: 520 }}>
        <p style={{ fontSize: 13.5, color: COLORS.inkFaint }}>Loading…</p>
      </div>
    );
  }

  return (
    <div style={{ padding: "28px 28px 60px", maxWidth: 520 }}>
      <div style={{ marginBottom: 22 }}>
        <h1 style={{ fontSize: 22, fontWeight: 700, color: COLORS.ink, margin: "0 0 3px", letterSpacing: -0.5 }}>Settings</h1>
        <p style={{ fontSize: 13, color: COLORS.inkFaint, margin: 0 }}>Patient details and panel security</p>
      </div>

      <div style={cardStyle}>
        <p style={{ fontSize: 14, fontWeight: 700, color: COLORS.ink, margin: "0 0 14px" }}>Patient</p>
        <label style={labelStyle}>Patient name</label>
        <input type="text" value={patientName} onChange={(e) => setPatientName(e.target.value)} style={{ ...inputStyle, marginBottom: 12 }} />
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <button onClick={saveName} disabled={savingName} style={saveBtnStyle(savingName)}>
            {savingName ? "Saving…" : "Save"}
          </button>
          {nameMessage && (
            <span style={{ fontSize: 13, color: nameMessage.ok ? COLORS.green : COLORS.red, fontWeight: 500 }}>{nameMessage.text}</span>
          )}
        </div>
      </div>

      <div style={cardStyle}>
        <p style={{ fontSize: 14, fontWeight: 700, color: COLORS.ink, margin: "0 0 14px" }}>Notifications</p>
        <p style={{ fontSize: 13, color: COLORS.inkMuted, margin: "0 0 14px", lineHeight: 1.5 }}>
          Get alerted on this device/browser if a task goes more than 2 hours past its scheduled time without being marked done.
        </p>
        {notifStatus === "unsupported" && <span style={{ fontSize: 13, color: COLORS.inkFaint }}>Not supported in this browser.</span>}
        {notifStatus === "denied" && <span style={{ fontSize: 13, color: COLORS.red }}>Notifications are blocked — enable them in your browser's site settings.</span>}
        {notifStatus === "on" && <span style={{ fontSize: 13, color: COLORS.green, fontWeight: 500 }}>✓ Notifications on for this device</span>}
        {(notifStatus === "idle" || notifStatus === "enabling") && (
          <button onClick={enableNotifications} disabled={notifStatus === "enabling"} style={saveBtnStyle(notifStatus === "enabling")}>
            {notifStatus === "enabling" ? "Enabling…" : "Enable notifications on this device"}
          </button>
        )}
      </div>

      <div style={cardStyle}>
        <p style={{ fontSize: 14, fontWeight: 700, color: COLORS.ink, margin: "0 0 6px" }}>Test notification</p>
        <p style={{ fontSize: 13, color: COLORS.inkMuted, margin: "0 0 14px", lineHeight: 1.5 }}>
          Send a test push to Dad&apos;s device right now to confirm notifications are working.
          His app must be installed and he must have tapped &ldquo;Turn on reminders&rdquo; first.
        </p>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <button
            onClick={sendTestNotification}
            disabled={testStatus === "sending"}
            style={saveBtnStyle(testStatus === "sending")}
          >
            {testStatus === "sending" ? "Sending…" : "Send test notification"}
          </button>
          {testStatus === "sent" && (
            <span style={{ fontSize: 13, color: COLORS.green, fontWeight: 500 }}>✓ Sent — check his phone</span>
          )}
          {testStatus === "error" && (
            <span style={{ fontSize: 13, color: COLORS.red, fontWeight: 500 }}>
              Failed — make sure VAPID keys are set in Vercel env vars
            </span>
          )}
        </div>
      </div>

      <div style={cardStyle}>
        <p style={{ fontSize: 14, fontWeight: 700, color: COLORS.ink, margin: "0 0 14px" }}>Security</p>
        <div style={{ marginBottom: 12 }}>
          <label style={labelStyle}>Current password</label>
          <input type="password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} style={inputStyle} />
        </div>
        <div style={{ marginBottom: 12 }}>
          <label style={labelStyle}>New password</label>
          <input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} style={inputStyle} />
        </div>
        <div style={{ marginBottom: 16 }}>
          <label style={labelStyle}>Confirm new password</label>
          <input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} style={inputStyle} />
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <button onClick={savePassword} disabled={savingPassword} style={saveBtnStyle(savingPassword)}>
            {savingPassword ? "Updating…" : "Update password"}
          </button>
          {passwordMessage && (
            <span style={{ fontSize: 13, color: passwordMessage.ok ? COLORS.green : COLORS.red, fontWeight: 500 }}>
              {passwordMessage.text}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
