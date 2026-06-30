"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { COLORS } from "@/lib/colors";
import {
  NavTodosIcon,
  NavCalendarIcon,
  NavNotesIcon,
  NavLogsIcon,
  NavSettingsIcon,
  SignOutIcon,
  LockIcon,
} from "@/components/icons";

type NavItem = {
  href: string;
  label: string;
  count?: number;
  Icon: (p: { color?: string }) => JSX.Element;
};

export default function Sidebar({
  patientName,
  todoCount,
  calCount,
  notesCount,
}: {
  patientName: string;
  todoCount: number;
  calCount: number;
  notesCount: number;
}) {
  const pathname = usePathname();
  const router = useRouter();

  const items: NavItem[] = [
    { href: "/admin/todos", label: "Daily Todos", count: todoCount, Icon: NavTodosIcon },
    { href: "/admin/calendar", label: "Calendar", count: calCount, Icon: NavCalendarIcon },
    { href: "/admin/voice-notes", label: "Voice Notes", count: notesCount, Icon: NavNotesIcon },
    { href: "/admin/activity-log", label: "Activity Log", Icon: NavLogsIcon },
    { href: "/admin/settings", label: "Settings", Icon: NavSettingsIcon },
  ];

  async function handleSignOut() {
    await fetch("/api/admin/logout", { method: "POST" });
    router.push("/admin/login");
    router.refresh();
  }

  return (
    <aside
      style={{
        width: 210,
        minWidth: 210,
        background: COLORS.card,
        display: "flex",
        flexDirection: "column",
        borderRight: `1px solid ${COLORS.borderSoft}`,
        overflowY: "auto",
        flexShrink: 0,
      }}
    >
      <div style={{ padding: "22px 18px 16px", borderBottom: `1px solid ${COLORS.borderSoft}` }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div
            style={{
              width: 36,
              height: 36,
              borderRadius: 11,
              background: COLORS.blueBg,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
            }}
          >
            <LockIcon size={16} />
          </div>
          <div>
            <p style={{ fontSize: 13.5, fontWeight: 700, color: COLORS.ink, margin: 0, letterSpacing: -0.2, lineHeight: 1.2 }}>
              Care Admin
            </p>
            <p style={{ fontSize: 11.5, color: COLORS.inkFaint, margin: 0, lineHeight: 1.3 }}>{patientName}&apos;s plan</p>
          </div>
        </div>
      </div>

      <nav style={{ flex: 1, padding: 10, display: "flex", flexDirection: "column", gap: 1 }}>
        {items.map((item) => {
          const active = pathname?.startsWith(item.href);
          const color = active ? COLORS.blue : "#8A837C";
          return (
            <Link
              key={item.href}
              href={item.href}
              style={{
                width: "100%",
                padding: "9px 11px",
                borderRadius: 10,
                background: active ? COLORS.blueBg : "transparent",
                display: "flex",
                alignItems: "center",
                gap: 9,
                textDecoration: "none",
              }}
            >
              <div
                style={{
                  width: 28,
                  height: 28,
                  borderRadius: 8,
                  background: active ? COLORS.blueBgStrong : COLORS.neutralBg,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                }}
              >
                <item.Icon color={color} />
              </div>
              <span style={{ fontSize: 13, fontWeight: 600, color: active ? COLORS.blue : COLORS.inkMuted, flex: 1, textAlign: "left" }}>
                {item.label}
              </span>
              {!!item.count && item.count > 0 && (
                <span
                  style={{
                    fontSize: 11,
                    fontWeight: 700,
                    color: active ? COLORS.blue : COLORS.inkFaint,
                    background: active ? COLORS.blueBgStrong : COLORS.neutralBgStrong,
                    padding: "1px 7px",
                    borderRadius: 10,
                  }}
                >
                  {item.count}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      <div style={{ padding: "12px 10px 20px", borderTop: `1px solid ${COLORS.borderSoft}` }}>
        <button
          onClick={handleSignOut}
          style={{
            width: "100%",
            padding: "10px 12px",
            borderRadius: 11,
            background: COLORS.redBg,
            display: "flex",
            alignItems: "center",
            gap: 9,
          }}
        >
          <SignOutIcon />
          <span style={{ fontSize: 13, fontWeight: 600, color: COLORS.red }}>Sign out</span>
        </button>
      </div>
    </aside>
  );
}
