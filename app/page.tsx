import Link from "next/link";
import { COLORS } from "@/lib/colors";

// Placeholder root route — Dad's companion app will eventually live here.
// The Care Admin panel is the part of the spec implemented so far.
export default function HomePage() {
  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexDirection: "column",
        gap: 14,
        padding: 20,
        textAlign: "center",
      }}
    >
      <p style={{ fontSize: 14, color: COLORS.inkFaint, margin: 0 }}>
        Dad&apos;s companion app isn&apos;t built yet.
      </p>
      <Link
        href="/admin"
        style={{
          fontSize: 15,
          fontWeight: 600,
          color: "#FFFFFF",
          background: COLORS.blueGradient,
          padding: "12px 22px",
          borderRadius: 13,
          textDecoration: "none",
        }}
      >
        Go to Care Admin
      </Link>
    </div>
  );
}
