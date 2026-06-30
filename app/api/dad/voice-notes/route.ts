import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { summarizeTranscript } from "@/lib/gemini";

export async function GET() {
  const { data, error } = await supabaseAdmin
    .from("voice_notes")
    .select("id, date, recorded_at, summary_bullets")
    .order("recorded_at", { ascending: false })
    .limit(50);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ notes: data });
}

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const rawTranscript = body?.raw_transcript as string | undefined;
  if (!rawTranscript || !rawTranscript.trim()) {
    return NextResponse.json({ error: "raw_transcript is required" }, { status: 400 });
  }

  const { summary_bullets, extracted_fields } = await summarizeTranscript(rawTranscript);
  const now = new Date();

  const { data, error } = await supabaseAdmin
    .from("voice_notes")
    .insert({
      date: now.toISOString().split("T")[0],
      recorded_at: now.toISOString(),
      raw_transcript: rawTranscript,
      summary_bullets,
      extracted_fields,
      shared: false,
    })
    .select("id, date, recorded_at, summary_bullets")
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ note: data }, { status: 201 });
}
