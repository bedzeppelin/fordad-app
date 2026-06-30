import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { SESSION_COOKIE_NAME, SESSION_MAX_AGE_SECONDS, createSessionToken, verifyPassword } from "@/lib/auth";

export async function POST(req: NextRequest) {
  let body: { password?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const password = body.password;
  if (!password || typeof password !== "string") {
    return NextResponse.json({ error: "Password is required" }, { status: 400 });
  }

  const { data, error } = await supabaseAdmin
    .from("admin_settings")
    .select("admin_password_hash")
    .eq("id", 1)
    .maybeSingle();

  if (error) {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
  if (!data) {
    return NextResponse.json(
      { error: "Admin password isn't set up yet. Run `npm run seed:admin` first." },
      { status: 500 }
    );
  }

  const ok = await verifyPassword(password, data.admin_password_hash);
  if (!ok) {
    return NextResponse.json({ error: "Incorrect password — try again" }, { status: 401 });
  }

  const res = NextResponse.json({ ok: true });
  res.cookies.set(SESSION_COOKIE_NAME, createSessionToken(), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_MAX_AGE_SECONDS,
  });
  return res;
}
