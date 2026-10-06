/* FantPub service worker — offline for stories you opened.
   HTML: network-first (fresh issue wins), cached copy when offline.
   Static assets: cache-first. API: never cached. */
const VERSION = "fp-v1";
const PAGES = `${VERSION}-pages`;
const STATIC = `${VERSION}-static`;
const SHELL = ["/", "/arhiv", "/o-proekte", "/manifest.webmanifest", "/icons/icon-192.png", "/pabchik/sad.webp", "/pabchik/reading.webp"];

self.addEventListener("install", (event) => {
  event.waitUntil(caches.open(PAGES).then((c) => c.addAll(SHELL).catch(() => {})));
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((k) => !k.startsWith(VERSION)).map((k) => caches.delete(k))))
      .then(() => self.clients.claim()),
  );
});

async function trim(cacheName, max) {
  const cache = await caches.open(cacheName);
  const keys = await cache.keys();
  for (let i = 0; i < keys.length - max; i++) await cache.delete(keys[i]);
}

self.addEventListener("fetch", (event) => {
  const req = event.request;
  if (req.method !== "GET") return;
  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return;
  if (url.pathname.startsWith("/api/")) return;

  if (req.mode === "navigate") {
    event.respondWith(
      (async () => {
        try {
          const ctrl = new AbortController();
          const t = setTimeout(() => ctrl.abort(), 4000);
          const res = await fetch(req, { signal: ctrl.signal });
          clearTimeout(t);
          if (res.ok) {
            const copy = res.clone();
            caches.open(PAGES).then((c) => c.put(req, copy).then(() => trim(PAGES, 60)));
          }
          return res;
        } catch {
          const cached = (await caches.match(req, { ignoreSearch: true })) || (await caches.match("/"));
          return cached || new Response("<h1>Нет сети</h1><p>Этот выпуск ещё не сохранён на устройстве.</p>", { headers: { "content-type": "text/html; charset=utf-8" } });
        }
      })(),
    );
    return;
  }

  if (url.pathname.startsWith("/_next/static/") || url.pathname.startsWith("/pabchik/") || url.pathname.startsWith("/icons/") || /\.(woff2|webp|png|svg)$/.test(url.pathname)) {
    event.respondWith(
      caches.match(req).then(
        (hit) =>
          hit ||
          fetch(req).then((res) => {
            if (res.ok) {
              const copy = res.clone();
              caches.open(STATIC).then((c) => c.put(req, copy).then(() => trim(STATIC, 200)));
            }
            return res;
          }),
      ),
    );
  }
});
