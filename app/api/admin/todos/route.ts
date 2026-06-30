import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { requireAdminSession } from "@/lib/api-auth";
import { WEEKDAYS } from "@/lib/colors";

export async function GET() {
  const unauthorized = requireAdminSession();
  if (unauthorized) return unauthorized;

  const { data, error } = await supabaseAdmin
    .from("todos")
    .select("*")
    .eq("active", true)
    .order("sort_order", { ascending: true });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ todos: data });
}

export async function POST(req: NextRequest) {
  const unauthorized = requireAdminSession();
  if (unauthorized) return unauthorized;

  const body = await req.json().catch(() => null);
  if (!body || typeof body.title !== "string" || !body.title.trim()) {
    return NextResponse.json({ error: "Title is required" }, { status: 400 });
  }

  const recurrenceDays = Array.isArray(body.recurrence_days)
    ? body.recurrence_days.filter((d: unknown) => WEEKDAYS.includes(d as never))
    : [...WEEKDAYS];

  const { data: maxRow } = await supabaseAdmin
    .from("todos")
    .select("sort_order")
    .eq("active", true)
    .order("sort_order", { ascending: false })
    .limit(1)
    .maybeSingle();
  const nextSortOrder = (maxRow?.sort_order ?? -1) + 1;

  const { data, error } = await supabaseAdmin
    .from("todos")
    .insert({
      title: body.title.trim(),
      short_title: body.short_title || null,
      description: body.description || null,
      category_label: body.category_label || null,
      icon: body.icon || "pill",
      hint: body.hint || null,
      scheduled_time: body.scheduled_time || "09:00",
      recurrence_days: recurrenceDays,
      sort_order: nextSortOrder,
      active: true,
    })
    .select("*")
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ todo: data }, { status: 201 });
}
