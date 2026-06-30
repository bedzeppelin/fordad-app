import webpush from "web-push";
import { supabaseAdmin } from "@/lib/supabase";

let configured = false;
function ensureConfigured() {
  if (configured) return;
  const publicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
  const privateKey = process.env.VAPID_PRIVATE_KEY;
  const subject = process.env.VAPID_SUBJECT || "mailto:admin@example.com";
  if (!publicKey || !privateKey) {
    throw new Error("Missing NEXT_PUBLIC_VAPID_PUBLIC_KEY / VAPID_PRIVATE_KEY env vars — run `npm run generate:vapid`.");
  }
  webpush.setVapidDetails(subject, publicKey, privateKey);
  configured = true;
}

export interface PushSubscriptionRow {
  id: string;
  endpoint: string;
  keys: { p256dh: string; auth: string };
}

export interface PushPayload {
  title: string;
  body: string;
  url?: string;
}

/** Sends to every subscription with the given role, pruning ones the push service reports as gone. */
export async function sendPushToRole(role: "dad" | "admin", payload: PushPayload): Promise<void> {
  const { data: subs } = await supabaseAdmin
    .from("push_subscriptions")
    .select("id, endpoint, keys")
    .eq("role", role);

  await sendPushToSubscriptions((subs ?? []) as PushSubscriptionRow[], payload);
}

export async function sendPushToSubscriptions(subs: PushSubscriptionRow[], payload: PushPayload): Promise<void> {
  if (subs.length === 0) return;
  ensureConfigured();

  await Promise.all(
    subs.map(async (sub) => {
      try {
        await webpush.sendNotification(
          { endpoint: sub.endpoint, keys: sub.keys },
          JSON.stringify(payload)
        );
      } catch (err: any) {
        // 404/410 = the push service says this subscription is dead; clean it up.
        if (err?.statusCode === 404 || err?.statusCode === 410) {
          await supabaseAdmin.from("push_subscriptions").delete().eq("id", sub.id);
        }
      }
    })
  );
}
