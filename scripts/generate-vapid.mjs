// One-time setup: generates a VAPID key pair for Web Push.
// Usage: npm run generate:vapid
import webpush from "web-push";

const keys = webpush.generateVAPIDKeys();

console.log("\nAdd these to .env.local (and to your Vercel project's env vars when you deploy):\n");
console.log(`NEXT_PUBLIC_VAPID_PUBLIC_KEY=${keys.publicKey}`);
console.log(`VAPID_PRIVATE_KEY=${keys.privateKey}`);
console.log("\nKeep VAPID_PRIVATE_KEY secret — never commit it or expose it to the browser.\n");
