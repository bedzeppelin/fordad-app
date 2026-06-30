"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { COLORS } from "@/lib/colors";
import { LockIcon } from "@/components/icons";

export default function AdminLoginPage() {
  const router = useRouter();
  const [patientName, setPatientName] = useState("Dad");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(false);
  const [errorMessage, setErrorMessage] = useState("Incorrect password — try again");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetch("/api/public/patient-name")
      .then((r) => r.json())
      .then((d) => setPatientName(d.patient_name || "Dad"))
      .catch(() => {});
  }, []);

  async function handleLogin() {
    if (submitting) return;
    setSubmitting(true);
    setError(false);
    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      if (res.ok) {
        router.push("/admin/todos");
        router.refresh();
        return;
      }
      const data = await res.json().catch(() => ({}));
      setErrorMessage(data.error || "Incorrect password — try again");
      setError(true);
      setPassword("");
    } catch {
      setErrorMessage("Couldn't reach the server — try again");
      setError(true);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 20,
        background: COLORS.bg,
      }}
    >
      <div
        style={{
          background: COLORS.card,
          borderRadius: 26,
          padding: "40px 36px 34px",
          width: "100%",
          maxWidth: 374,
          boxShadow: "0 2px 8px rgba(20,14,8,0.05),0 20px 50px rgba(20,14,8,0.10)",
        }}
      >
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", marginBottom: 30 }}>
          <div
            style={{
              width: 58,
              height: 58,
              borderRadius: 17,
              background: "linear-gradient(145deg,#EDF1FB,#D5E2F5)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              marginBottom: 16,
              boxShadow: "0 3px 14px rgba(43,77,140,0.14)",
            }}
          >
            <LockIcon />
          </div>
          <h1 style={{ fontSize: 22, fontWeight: 700, color: COLORS.ink, margin: "0 0 5px", letterSpacing: -0.5 }}>
            Care Admin
          </h1>
          <p style={{ fontSize: 13.5, color: COLORS.inkFaint, margin: 0, textAlign: "center", lineHeight: 1.45 }}>
            Manage {patientName}&apos;s daily care plan
          </p>
        </div>

        <div style={{ marginBottom: 8 }}>
          <label
            style={{
              display: "block",
              fontSize: 11,
              fontWeight: 700,
              color: COLORS.inkMuted,
              letterSpacing: 0.7,
              textTransform: "uppercase",
              marginBottom: 7,
            }}
          >
            Admin password
          </label>
          <input
            type="password"
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
              setError(false);
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleLogin();
            }}
            placeholder="Enter password"
            style={{
              width: "100%",
              padding: "13px 14px",
              borderRadius: 13,
              border: `1.5px solid ${COLORS.border}`,
              fontSize: 16,
              background: COLORS.inputBg,
              color: COLORS.ink,
              outline: "none",
            }}
          />
        </div>

        {error && (
          <p style={{ fontSize: 13, color: COLORS.red, margin: "2px 0 10px 2px", fontWeight: 500 }}>{errorMessage}</p>
        )}

        <button
          onClick={handleLogin}
          disabled={submitting}
          style={{
            width: "100%",
            height: 54,
            borderRadius: 15,
            background: COLORS.blueGradient,
            color: "#FFF",
            fontSize: 16,
            fontWeight: 600,
            letterSpacing: -0.2,
            boxShadow: "0 4px 18px rgba(43,77,140,0.24)",
            marginTop: 6,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            opacity: submitting ? 0.7 : 1,
          }}
        >
          {submitting ? "Unlocking…" : "Unlock panel"}
        </button>
      </div>
    </div>
  );
}
