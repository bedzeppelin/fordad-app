import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { requireAdminSession } from "@/lib/api-auth";

const VALID_TYPES = ["appointment", "procedure", "therapy", "other"];

export async function GET() {
  const unauthorized = requireAdminSession();
  if (unauthorized) return unauthorized;

  const { data, error } = await supabaseAdmin
    .from("calendar_events")
    .select("*")
    .order("date", { ascending: true })
    .order("time", { ascending: true });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ events: data });
}

export async function POST(req: NextRequest) {
  const unauthorized = requireAdminSession();
  if (unauthorized) return unauthorized;

  const body = await req.json().catch(() => null);
  if (!body || typeof body.title !== "string" || !body.title.trim()) {
    return NextResponse.json({ error: "Title is required" }, { status: 400 });
  }
  if (!body.date || !body.time) {
    return NextResponse.json({ error: "Date and time are required" }, { status: 400 });
  }
  const type = VALID_TYPES.includes(body.type) ? body.type : "appointment";

  const { data, error } = await supabaseAdmin
    .from("calendar_events")
    .insert({
      title: body.title.trim(),
      type,
      date: body.date,
      time: body.time,
      notes: body.notes || null,
      created_by: "admin",
    })
    .select("*")
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ event: data }, { status: 201 });
}
