import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { requireAdminSession } from "@/lib/api-auth";
import { WEEKDAYS } from "@/lib/colors";

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const unauthorized = requireAdminSession();
  if (unauthorized) return unauthorized;

  const body = await req.json().catch(() => null);
  if (!body) return NextResponse.json({ error: "Invalid request" }, { status: 400 });

  const update: Record<string, unknown> = {};
  if (typeof body.title === "string") update.title = body.title.trim();
  if ("short_title" in body) update.short_title = body.short_title || null;
  if ("description" in body) update.description = body.description || null;
  if ("category_label" in body) update.category_label = body.category_label || null;
  if ("icon" in body) update.icon = body.icon || "pill";
  if ("hint" in body) update.hint = body.hint || null;
  if ("scheduled_time" in body) update.scheduled_time = body.scheduled_time;
  if (Array.isArray(body.recurrence_days)) {
    update.recurrence_days = body.recurrence_days.filter((d: unknown) => WEEKDAYS.includes(d as never));
  }

  if (update.title === "") {
    return NextResponse.json({ error: "Title is required" }, { status: 400 });
  }

  const { data, error } = await supabaseAdmin
    .from("todos")
    .update(update)
    .eq("id", params.id)
    .select("*")
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ todo: data });
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  const unauthorized = requireAdminSession();
  if (unauthorized) return unauthorized;

  // Soft delete so historical todo_completions stay intact for Activity Log / Reports.
  const { error } = await supabaseAdmin.from("todos").update({ active: false }).eq("id", params.id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
