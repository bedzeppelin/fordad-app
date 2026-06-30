import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { requireAdminSession } from "@/lib/api-auth";

export async function GET() {
  const unauthorized = requireAdminSession();
  if (unauthorized) return unauthorized;

  const { data, error } = await supabaseAdmin
    .from("voice_notes")
    .select("*")
    .order("recorded_at", { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ notes: data });
}
