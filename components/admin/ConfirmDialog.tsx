"use client";

import { COLORS } from "@/lib/colors";

export default function ConfirmDialog({
  title,
  message,
  confirmLabel = "Delete",
  onConfirm,
  onCancel,
}: {
  title: string;
  message: string;
  confirmLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(20,14,8,0.42)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 20,
        zIndex: 400,
      }}
      onClick={onCancel}
    >
      <div
        style={{
          background: COLORS.card,
          borderRadius: 20,
          padding: "24px 22px 20px",
          width: "100%",
          maxWidth: 360,
          boxShadow: "0 24px 64px rgba(20,14,8,0.22)",
          animation: "fadeUp 0.2s ease",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <h3 style={{ fontSize: 17, fontWeight: 700, color: COLORS.ink, margin: "0 0 8px" }}>{title}</h3>
        <p style={{ fontSize: 13.5, color: COLORS.inkMuted, margin: "0 0 20px", lineHeight: 1.5 }}>{message}</p>
        <div style={{ display: "flex", gap: 9 }}>
          <button
            onClick={onConfirm}
            style={{
              flex: 1,
              height: 44,
              borderRadius: 12,
              background: COLORS.red,
              color: "#FFF",
              fontSize: 14,
              fontWeight: 600,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            {confirmLabel}
          </button>
          <button
            onClick={onCancel}
            style={{
              flex: 1,
              height: 44,
              borderRadius: 12,
              background: COLORS.neutralBgStrong,
              color: COLORS.inkMuted,
              fontSize: 14,
              fontWeight: 600,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
