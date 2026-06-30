import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { requireAdminSession } from "@/lib/api-auth";

const VALID_TYPES = ["appointment", "procedure", "therapy", "other"];

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const unauthorized = requireAdminSession();
  if (unauthorized) return unauthorized;

  const body = await req.json().catch(() => null);
  if (!body) return NextResponse.json({ error: "Invalid request" }, { status: 400 });

  const update: Record<string, unknown> = {};
  if (typeof body.title === "string") update.title = body.title.trim();
  if (VALID_TYPES.includes(body.type)) update.type = body.type;
  if (body.date) update.date = body.date;
  if (body.time) update.time = body.time;
  if ("notes" in body) update.notes = body.notes || null;

  if (update.title === "") {
    return NextResponse.json({ error: "Title is required" }, { status: 400 });
  }

  const { data, error } = await supabaseAdmin
    .from("calendar_events")
    .update(update)
    .eq("id", params.id)
    .select("*")
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ event: data });
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  const unauthorized = requireAdminSession();
  if (unauthorized) return unauthorized;

  const { error } = await supabaseAdmin.from("calendar_events").delete().eq("id", params.id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
