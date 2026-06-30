// Minimal service worker: network-first with a cached-shell fallback so the
// app still opens (read-only, last-known content) without a connection.
// Push notifications are NOT wired up yet — that's a separate piece of the
// spec (Section 3.6) that needs VAPID keys + a Vercel Cron job.
const CACHE_NAME = "dad-app-shell-v1";
const PRECACHE_URLS = ["/", "/manifest.json", "/icon.svg"];

self.addEventListener("install", (event) => {
  event.waitUntil(caches.open(CACHE_NAME).then((cache) => cache.addAll(PRECACHE_URLS)));
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) => Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k))))
  );
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  const { request } = event;
  if (request.method !== "GET") return;
  // Never cache API responses — Dad's data must always be fresh, never stale/offline.
  if (new URL(request.url).pathname.startsWith("/api/")) return;

  event.respondWith(
    fetch(request)
      .then((res) => {
        const copy = res.clone();
        caches.open(CACHE_NAME).then((cache) => cache.put(request, copy));
        return res;
      })
      .catch(() => caches.match(request).then((cached) => cached || caches.match("/")))
  );
});
