/* FantPub service worker — offline for stories you opened.
   HTML: network-first (fresh issue wins), cached copy when offline.
   Static assets: cache-first. API: never cached. */
const VERSION = "fp-v2";
const PAGES = `${VERSION}-pages`;
const STATIC = `${VERSION}-static`;
const SHELL = ["/", "/arhiv", "/o-proekte", "/manifest.webmanifest", "/icons/icon-192.png", "/pabchik/sad.webp", "/pabchik/reading.webp"];

self.addEventListener("install", (event) => {
  event.waitUntil(caches.open(PAGES).then((c) => c.addAll(SHELL).catch(() => {})));
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  if (self.registration.navigationPreload) event.waitUntil(self.registration.navigationPreload.enable().catch(() => {}));
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((k) => !k.startsWith(VERSION)).map((k) => caches.delete(k))))
      .then(() => self.clients.claim()),
  );
});

const OFFLINE_HTML = `<!doctype html><html lang="ru"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Нет сети · FantPub</title><body style="margin:0;min-height:100vh;display:grid;place-items:center;background:#f6f2e7;color:#1d1c17;font:17px/1.5 Georgia,serif;text-align:center;padding:24px"><div><p style="font-size:22px;margin:0 0 8px">Нет сети</p><p style="margin:0 0 16px;color:#4a473d">Эта страница ещё не сохранена на устройстве. Открытые раньше рассказы доступны и без интернета.</p><a href="/" style="color:#4e5d25">К рассказу дня</a></div></body></html>`;

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

  if (url.pathname.startsWith("/pabchik/") || url.pathname.startsWith("/icons/")) {
    // not content-hashed: serve cached, refresh in the background
    event.respondWith(
      caches.open(STATIC).then(async (c) => {
        const hit = await c.match(req);
        const fresh = fetch(req).then((res) => {
          if (res.ok) c.put(req, res.clone());
          return res;
        });
        return hit || fresh;
      }),
    );
    return;
  }

  if (url.pathname.startsWith("/_next/static/") || /\.(woff2)$/.test(url.pathname)) {
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
