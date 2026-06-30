"use client";

import { COLORS } from "@/lib/colors";
import { CloseIcon } from "@/components/icons";

export default function ModalShell({
  title,
  onClose,
  children,
}: {
  title: string;
  onClose: () => void;
  children: React.ReactNode;
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
        zIndex: 300,
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: COLORS.card,
          borderRadius: 24,
          padding: "24px 24px 22px",
          width: "100%",
          maxWidth: 460,
          maxHeight: "92vh",
          overflowY: "auto",
          boxShadow: "0 24px 64px rgba(20,14,8,0.22)",
          animation: "fadeUp 0.2s ease",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 18 }}>
          <h2 style={{ fontSize: 19, fontWeight: 700, color: COLORS.ink, margin: 0, letterSpacing: -0.3 }}>{title}</h2>
          <button
            onClick={onClose}
            aria-label="Close"
            style={{
              width: 30,
              height: 30,
              borderRadius: 8,
              background: COLORS.neutralBgStrong,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <CloseIcon />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

export const fieldLabelStyle: React.CSSProperties = {
  display: "block",
  fontSize: 11,
  fontWeight: 700,
  color: COLORS.inkMuted,
  letterSpacing: 0.7,
  textTransform: "uppercase",
  marginBottom: 6,
};

export const fieldInputStyle: React.CSSProperties = {
  width: "100%",
  padding: "11px 13px",
  borderRadius: 11,
  border: `1.5px solid ${COLORS.border}`,
  fontSize: 15,
  background: COLORS.inputBg,
  color: COLORS.ink,
  outline: "none",
};
