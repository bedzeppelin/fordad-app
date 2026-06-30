import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const body = await req.json().catch(() => null);
  const date = body?.date as string | undefined;
  if (!date) return NextResponse.json({ error: "date is required (YYYY-MM-DD)" }, { status: 400 });

  const { data: existing } = await supabaseAdmin
    .from("todo_completions")
    .select("id")
    .eq("todo_id", params.id)
    .eq("date", date)
    .maybeSingle();

  if (existing) return NextResponse.json({ ok: true, alreadyCompleted: true });

  const { error } = await supabaseAdmin.from("todo_completions").insert({
    todo_id: params.id,
    date,
    completed_at: new Date().toISOString(),
  });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
