import { NextResponse } from "next/server";
import { requireAdminSession } from "@/lib/api-auth";
import { sendPushToRole } from "@/lib/push";

export async function POST() {
  const unauthorized = requireAdminSession();
  if (unauthorized) return unauthorized;

  try {
    await sendPushToRole("dad", {
      title: "Test notification 👋",
      body: "Push notifications are working! Dad will see messages like this.",
      url: "/",
    });
    return NextResponse.json({ ok: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Failed to send" }, { status: 500 });
  }
}
