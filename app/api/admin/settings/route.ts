import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { requireAdminSession } from "@/lib/api-auth";
import { hashPassword, verifyPassword } from "@/lib/auth";

export async function GET() {
  const unauthorized = requireAdminSession();
  if (unauthorized) return unauthorized;

  const { data, error } = await supabaseAdmin
    .from("admin_settings")
    .select("patient_name")
    .eq("id", 1)
    .maybeSingle();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ patient_name: data?.patient_name ?? "Dad" });
}

export async function PATCH(req: NextRequest) {
  const unauthorized = requireAdminSession();
  if (unauthorized) return unauthorized;

  const body = await req.json().catch(() => null);
  if (!body) return NextResponse.json({ error: "Invalid request" }, { status: 400 });

  const update: Record<string, unknown> = {};

  if (typeof body.patient_name === "string" && body.patient_name.trim()) {
    update.patient_name = body.patient_name.trim();
  }

  if (body.new_password) {
    if (typeof body.new_password !== "string" || body.new_password.length < 6) {
      return NextResponse.json({ error: "New password must be at least 6 characters" }, { status: 400 });
    }
    if (!body.current_password || typeof body.current_password !== "string") {
      return NextResponse.json({ error: "Current password is required to set a new password" }, { status: 400 });
    }

    const { data: existing, error: fetchErr } = await supabaseAdmin
      .from("admin_settings")
      .select("admin_password_hash")
      .eq("id", 1)
      .maybeSingle();
    if (fetchErr) return NextResponse.json({ error: fetchErr.message }, { status: 500 });
    if (!existing) return NextResponse.json({ error: "Admin settings not found" }, { status: 500 });

    const ok = await verifyPassword(body.current_password, existing.admin_password_hash);
    if (!ok) return NextResponse.json({ error: "Current password is incorrect" }, { status: 401 });

    update.admin_password_hash = await hashPassword(body.new_password);
  }

  if (Object.keys(update).length === 0) {
    return NextResponse.json({ error: "Nothing to update" }, { status: 400 });
  }

  const { error } = await supabaseAdmin.from("admin_settings").update(update).eq("id", 1);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ ok: true });
}
