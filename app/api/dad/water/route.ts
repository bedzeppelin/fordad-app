import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const date = body?.date as string | undefined;
  const delta = body?.delta as number | undefined;
  if (!date || (delta !== 1 && delta !== -1)) {
    return NextResponse.json({ error: "date and delta (1 | -1) are required" }, { status: 400 });
  }

  const { data: existing } = await supabaseAdmin.from("water_intake").select("*").eq("date", date).maybeSingle();
  const target = existing?.target ?? 8;
  const nextCount = Math.max(0, Math.min(target, (existing?.count ?? 0) + delta));

  const { data, error } = await supabaseAdmin
    .from("water_intake")
    .upsert(
      { date, count: nextCount, target, last_updated_at: new Date().toISOString() },
      { onConflict: "date" }
    )
    .select("count, target")
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ water: data });
}
