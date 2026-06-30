"use client";

import { NavIcon } from "@/components/dad/icons";
import type { DadScreen } from "@/components/dad/CompanionApp";

const TABS: { key: DadScreen; label: string }[] = [
  { key: "home", label: "Home" },
  { key: "todos", label: "Todos" },
  { key: "calendar", label: "Calendar" },
  { key: "reports", label: "Reports" },
  { key: "notes", label: "Notes" },
];

export default function BottomNav({ screen, onChange }: { screen: DadScreen; onChange: (s: DadScreen) => void }) {
  return (
    <div
      style={{
        position: "fixed",
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: 100,
        background: "rgba(241,236,228,0.97)",
        borderTop: "1px solid rgba(200,190,180,0.35)",
        paddingBottom: "env(safe-area-inset-bottom)",
      }}
    >
      <div style={{ display: "flex", alignItems: "stretch", height: 56, padding: "0 2px" }}>
        {TABS.map((tab) => {
          const active = screen === tab.key;
          return (
            <button
              key={tab.key}
              onClick={() => onChange(tab.key)}
              aria-label={tab.label}
              style={{
                flex: 1,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                gap: 3,
                padding: "7px 0 3px",
                background: active ? "rgba(43,77,140,0.07)" : "transparent",
                borderRadius: 10,
              }}
            >
              <NavIcon tabKey={tab.key} color={active ? "#2B4D8C" : "#AFA89F"} />
              <span style={{ fontSize: 10, fontWeight: active ? 700 : 500, color: active ? "#2B4D8C" : "#AFA89F", letterSpacing: 0.2, lineHeight: 1.2 }}>
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
