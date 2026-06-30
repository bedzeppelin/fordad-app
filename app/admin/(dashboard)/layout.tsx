import { redirect } from "next/navigation";
import { hasValidAdminSession } from "@/lib/session";
import { supabaseAdmin } from "@/lib/supabase";
import { COLORS } from "@/lib/colors";
import Sidebar from "@/components/admin/Sidebar";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  if (!hasValidAdminSession()) {
    redirect("/admin/login");
  }

  const [{ count: todoCount }, { count: calCount }, { count: notesCount }, { data: settings }] = await Promise.all([
    supabaseAdmin.from("todos").select("id", { count: "exact", head: true }).eq("active", true),
    supabaseAdmin.from("calendar_events").select("id", { count: "exact", head: true }),
    supabaseAdmin.from("voice_notes").select("id", { count: "exact", head: true }),
    supabaseAdmin.from("admin_settings").select("patient_name").eq("id", 1).maybeSingle(),
  ]);

  return (
    <div style={{ display: "flex", height: "100vh", overflow: "hidden", background: COLORS.bg }}>
      <Sidebar
        patientName={settings?.patient_name ?? "Dad"}
        todoCount={todoCount ?? 0}
        calCount={calCount ?? 0}
        notesCount={notesCount ?? 0}
      />
      <main style={{ flex: 1, overflowY: "auto", background: COLORS.bg, minWidth: 0 }}>{children}</main>
    </div>
  );
}
