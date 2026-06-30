import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { requireAdminSession } from "@/lib/api-auth";

export async function POST(req: NextRequest) {
  const unauthorized = requireAdminSession();
  if (unauthorized) return unauthorized;

  const body = await req.json().catch(() => null);
  const id = body?.id as string | undefined;
  const direction = body?.direction as "up" | "down" | undefined;
  if (!id || (direction !== "up" && direction !== "down")) {
    return NextResponse.json({ error: "id and direction ('up'|'down') are required" }, { status: 400 });
  }

  const { data: todos, error } = await supabaseAdmin
    .from("todos")
    .select("id, sort_order")
    .eq("active", true)
    .order("sort_order", { ascending: true });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const idx = (todos ?? []).findIndex((t) => t.id === id);
  if (idx === -1) return NextResponse.json({ error: "Todo not found" }, { status: 404 });

  const swapIdx = direction === "up" ? idx - 1 : idx + 1;
  if (swapIdx < 0 || swapIdx >= (todos?.length ?? 0)) {
    return NextResponse.json({ ok: true }); // already at the edge, no-op
  }

  const a = todos![idx];
  const b = todos![swapIdx];

  const [{ error: e1 }, { error: e2 }] = await Promise.all([
    supabaseAdmin.from("todos").update({ sort_order: b.sort_order }).eq("id", a.id),
    supabaseAdmin.from("todos").update({ sort_order: a.sort_order }).eq("id", b.id),
  ]);

  if (e1 || e2) return NextResponse.json({ error: (e1 || e2)!.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
