import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { requireAdminSession } from "@/lib/api-auth";

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  const unauthorized = requireAdminSession();
  if (unauthorized) return unauthorized;

  const { error } = await supabaseAdmin.from("voice_notes").delete().eq("id", params.id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
