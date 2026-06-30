"use client";

import { useEffect, useState } from "react";
import { COLORS } from "@/lib/colors";

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
