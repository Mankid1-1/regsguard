const CACHE_NAME = "regsguard-v4";
const OFFLINE_URL = "/offline";

// Assets to cache on install (app shell only — icons and offline page).
// Never precache HTML routes or _next chunks; those change on every deploy
// and stale copies cause "Refused to execute script... MIME type text/html"
// errors when the old chunk hash doesn't exist anymore.
const PRECACHE_ASSETS = [
  "/offline",
  "/manifest.webmanifest",
  "/icons/icon-192x192.svg",
  "/icons/icon-512x512.svg",
];

// Install: cache app shell
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(PRECACHE_ASSETS))
  );
  self.skipWaiting();
});

// Activate: clean old caches
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((key) => key !== CACHE_NAME)
          .map((key) => caches.delete(key))
      )
    )
  );
  self.clients.claim();
});

// Fetch: network-first for API/navigation, cache-first for static assets
self.addEventListener("fetch", (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET requests
  if (request.method !== "GET") return;

  // Skip chrome-extension, etc.
  if (!url.protocol.startsWith("http")) return;

  // Only handle requests to our own origin. Third-party scripts
  // (Clerk, Stripe, Cloudflare Insights, etc.) must bypass the SW so
  // the page's CSP and CORS rules apply directly to their network
  // requests rather than going through our fetch handler.
  if (url.origin !== self.location.origin) return;

  // API requests: network only (don't cache sensitive data)
  if (url.pathname.startsWith("/api/")) return;

  // Never intercept Next.js build output. Next uses content-hashed
  // filenames (immutable, already optimally cached by the browser), and
  // intercepting them here causes deploy-skew bugs where an old chunk
  // hash in cache is served back to a new HTML that expects a different
  // hash (or vice versa), producing MIME-type errors on next-deploy.
  if (url.pathname.startsWith("/_next/")) return;

  // Navigation requests: network first, fall back to offline page
  if (request.mode === "navigate") {
    event.respondWith(
      fetch(request).catch(() =>
        caches.match(OFFLINE_URL).then((cached) => cached || new Response("Offline", { status: 503 }))
      )
    );
    return;
  }

  // Icons/images only -- safe to cache long-term since they're in /public
  if (
    url.pathname.startsWith("/icons/") ||
    url.pathname.endsWith(".svg") ||
    url.pathname.endsWith(".png")
  ) {
    event.respondWith(
      caches.open(CACHE_NAME).then((cache) =>
        cache.match(request).then((cached) => {
          const fetched = fetch(request).then((response) => {
            if (response.ok) cache.put(request, response.clone());
            return response;
          });
          return cached || fetched;
        })
      )
    );
    return;
  }

  // Everything else: network first, cache fallback
  event.respondWith(
    fetch(request)
      .then((response) => {
        if (response.ok) {
          const clone = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
        }
        return response;
      })
      .catch(() => caches.match(request))
  );
});

// Push notifications (future: deadline alerts)
self.addEventListener("push", (event) => {
  if (!event.data) return;
  const data = event.data.json();
  event.waitUntil(
    self.registration.showNotification(data.title || "RegsGuard", {
      body: data.body || "You have a compliance update",
      icon: "/icons/icon-192x192.svg",
      badge: "/icons/icon-192x192.svg",
      tag: data.tag || "default",
      data: { url: data.url || "/dashboard" },
    })
  );
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const url = event.notification.data?.url || "/dashboard";
  event.waitUntil(self.clients.openWindow(url));
});
