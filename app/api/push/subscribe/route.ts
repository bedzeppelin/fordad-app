import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { requireAdminSession } from "@/lib/api-auth";

// Dad's device subscribes with no auth (his app has no login, per spec).
// An "admin" role subscription requires a valid admin session — otherwise
// anyone could register themselves to receive missed-task alerts.
export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const subscription = body?.subscription;
  const role = body?.role === "admin" ? "admin" : "dad";
  const deviceLabel = typeof body?.device_label === "string" ? body.device_label : null;

  if (!subscription?.endpoint || !subscription?.keys?.p256dh || !subscription?.keys?.auth) {
    return NextResponse.json({ error: "Invalid push subscription" }, { status: 400 });
  }

  if (role === "admin") {
    const unauthorized = requireAdminSession();
    if (unauthorized) return unauthorized;
  }

  const { error } = await supabaseAdmin.from("push_subscriptions").upsert(
    {
      endpoint: subscription.endpoint,
      keys: subscription.keys,
      device_label: deviceLabel,
      role,
    },
    { onConflict: "endpoint" }
  );

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}

export async function DELETE(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const endpoint = body?.endpoint as string | undefined;
  if (!endpoint) return NextResponse.json({ error: "endpoint is required" }, { status: 400 });

  const { error } = await supabaseAdmin.from("push_subscriptions").delete().eq("endpoint", endpoint);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
