import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

// Read-only: all active recurring todos, for Calendar's "All treatments" list view.
export async function GET() {
  const { data, error } = await supabaseAdmin
    .from("todos")
    .select("*")
    .eq("active", true)
    .order("sort_order", { ascending: true });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ todos: data });
}
