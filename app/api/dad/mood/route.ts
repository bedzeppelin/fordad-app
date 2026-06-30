import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

const VALID_MOODS = ["great", "good", "okay", "low"];

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const date = body?.date as string | undefined;
  const mood = body?.mood as string | undefined;
  if (!date || !mood || !VALID_MOODS.includes(mood)) {
    return NextResponse.json({ error: "date and a valid mood are required" }, { status: 400 });
  }

  const { error } = await supabaseAdmin
    .from("mood_checkins")
    .upsert({ date, mood, submitted_at: new Date().toISOString() }, { onConflict: "date" });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
