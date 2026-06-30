import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { requireAdminSession } from "@/lib/api-auth";

// Direct read of todo_completions, newest day first, newest time first within each day.
export async function GET() {
  const unauthorized = requireAdminSession();
  if (unauthorized) return unauthorized;

  const { data, error } = await supabaseAdmin
    .from("todo_completions")
    .select("id, todo_id, completed_at, date, todos ( title, short_title, icon )")
    .order("completed_at", { ascending: false })
    .limit(500);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const entries = (data ?? []).map((row: any) => ({
    id: row.id,
    todo_id: row.todo_id,
    completed_at: row.completed_at,
    date: row.date,
    todo_title: row.todos?.short_title || row.todos?.title?.replace(/\n/g, " ") || "Deleted task",
    todo_icon: row.todos?.icon || "pill",
  }));

  return NextResponse.json({ entries });
}
