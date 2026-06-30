import { cookies } from "next/headers";
import { SESSION_COOKIE_NAME, verifySessionToken } from "@/lib/auth";

/** Server-only helper: true if the incoming request carries a valid admin session cookie. */
export function hasValidAdminSession(): boolean {
  const token = cookies().get(SESSION_COOKIE_NAME)?.value;
  return verifySessionToken(token);
}
