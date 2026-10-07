/* FantPub service worker — offline for stories you opened. No precache: pages are saved as you visit them.
   HTML: network-first (fresh issue wins), cached copy when offline.
   Covers and hashed assets: cache-first. Pabchik and icons: cached, refreshed in the background. API: never cached. */
const VERSION = "fp-v3";
const PAGES = `${VERSION}-pages`;
const STATIC = `${VERSION}-static`;
const COVERS = `${VERSION}-covers`;

self.addEventListener("install", () => self.skipWaiting());

self.addEventListener("activate", (event) => {
  if (self.registration.navigationPreload) event.waitUntil(self.registration.navigationPreload.enable().catch(() => {}));
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((k) => !k.startsWith(`${VERSION}-`)).map((k) => caches.delete(k))))
      .then(() => self.clients.claim()),
  );
});

const OFFLINE_HTML = `<!doctype html><html lang="ru"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover"><meta name="color-scheme" content="light dark"><title>Нет сети · FantPub</title><style>:root{color-scheme:light dark;--bg:#fff;--label:#000;--label-2:rgb(60 60 67/.66);--fill:rgb(120 120 128/.14)}@media (prefers-color-scheme:dark){:root{--bg:#000;--label:#fff;--label-2:rgb(235 235 245/.64);--fill:rgb(120 120 128/.28)}}body{margin:0;min-height:100dvh;display:grid;place-items:center;padding:24px;box-sizing:border-box;background:var(--bg);color:var(--label);font:17px/1.35 system-ui,-apple-system,sans-serif;text-align:center}h1{margin:0 0 8px;font:700 34px/1.12 ui-serif,"New York",Georgia,serif}p{margin:0 0 28px;color:var(--label-2);font-size:15px}a{display:inline-flex;align-items:center;min-height:50px;padding:0 24px;border-radius:999px;background:var(--label);color:var(--bg);font-weight:600;text-decoration:none}</style><body><div><h1>Нет сети</h1><p>Эта страница ещё не сохранена. Открытые раньше рассказы доступны и без интернета.</p><a href="/">Рассказ дня</a></div></body></html>`;

async function trim(cacheName, max) {
  const cache = await caches.open(cacheName);
  const keys = await cache.keys();
  for (let i = 0; i < keys.length - max; i++) await cache.delete(keys[i]);
}

/** Serve from cache; on a miss fetch, store (bounded) and return. */
function cacheFirst(req, cacheName, max) {
  return caches.open(cacheName).then(async (c) => {
    const hit = await c.match(req);
    if (hit) return hit;
    const res = await fetch(req);
    if (res.ok) c.put(req, res.clone()).then(() => trim(cacheName, max));
    return res;
  });
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
        const network = (async () => {
          const pre = await event.preloadResponse;
          const res = pre || (await fetch(req));
          if (res.ok && res.type === "basic") {
            const copy = res.clone();
            caches.open(PAGES).then((c) => c.put(req, copy).then(() => trim(PAGES, 60)));
          }
          return res;
        })();
        const cached = await caches.match(req, { ignoreSearch: true });
        if (!cached) {
          // nothing saved for this exact page: wait for the network, show an honest offline note on failure
          try {
            return await network;
          } catch {
            return new Response(OFFLINE_HTML, { status: 503, headers: { "content-type": "text/html; charset=utf-8" } });
          }
        }
        // saved copy exists: prefer fresh, fall back to the copy if the network is down or very slow
        const timeout = new Promise((resolve) => setTimeout(() => resolve(cached), 6000));
        try {
          return await Promise.race([network, timeout]);
        } catch {
          return cached;
        }
      })(),
    );
    return;
  }

  // cover art never changes under the same name (served immutable)
  if (url.pathname.startsWith("/covers/")) {
    event.respondWith(cacheFirst(req, COVERS, 120));
    return;
  }

  if (url.pathname.startsWith("/pabchik/") || url.pathname.startsWith("/icons/")) {
    // not content-hashed: serve cached, refresh in the background
    event.respondWith(
      caches.open(STATIC).then(async (c) => {
        const hit = await c.match(req);
        const fresh = fetch(req).then((res) => {
          if (res.ok) c.put(req, res.clone());
          return res;
        });
        if (hit) {
          event.waitUntil(fresh.catch(() => {}));
          return hit;
        }
        return fresh;
      }),
    );
    return;
  }

  if (url.pathname.startsWith("/_next/static/") || url.pathname.endsWith(".woff2")) {
    event.respondWith(cacheFirst(req, STATIC, 200));
  }
});
