import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

const VALID_ENERGY = ["low", "medium", "high"];
const VALID_PAIN = ["none", "mild", "significant"];
const VALID_QUALITY = ["poor", "fair", "good"];

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const date = body?.date as string | undefined;
  const overall_day_rating = body?.overall_day_rating as number | undefined;
  const energy_level = body?.energy_level as string | undefined;
  const pain_discomfort = body?.pain_discomfort as string | undefined;
  const sleep_quality = body?.sleep_quality as string | undefined;

  if (!date || !overall_day_rating || overall_day_rating < 1 || overall_day_rating > 5) {
    return NextResponse.json({ error: "date and overall_day_rating (1-5) are required" }, { status: 400 });
  }
  if (energy_level && !VALID_ENERGY.includes(energy_level)) {
    return NextResponse.json({ error: "Invalid energy_level" }, { status: 400 });
  }
  if (pain_discomfort && !VALID_PAIN.includes(pain_discomfort)) {
    return NextResponse.json({ error: "Invalid pain_discomfort" }, { status: 400 });
  }
  if (sleep_quality && !VALID_QUALITY.includes(sleep_quality)) {
    return NextResponse.json({ error: "Invalid sleep_quality" }, { status: 400 });
  }

  const { error } = await supabaseAdmin.from("daily_checkins").upsert(
    {
      date,
      overall_day_rating,
      energy_level: energy_level || null,
      pain_discomfort: pain_discomfort || null,
      sleep_quality: sleep_quality || null,
      submitted_at: new Date().toISOString(),
    },
    { onConflict: "date" }
  );

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
