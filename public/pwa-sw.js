// Service worker de la PWA. Regla de oro (ver src/test/service-worker-removal.test.ts): NUNCA sirve páginas desde la
// caché — un service worker anterior lo hacía y dejaba a la gente con una versión vieja para siempre.
//  · Navegación (HTML): siempre red; solo sin conexión se muestra /offline.html.
//  · /assets/*: llevan hash en el nombre (inmutables), así que caché primero es seguro.
//  · /api/* y otros orígenes: no se tocan.
const VERSION = "rd-pwa-v1";
const STATIC = `${VERSION}-static`;
const ASSETS = `${VERSION}-assets`;
const PRECACHE = ["/offline.html", "/favicon.svg", "/icon-192.png", "/icon-512.png"];

self.addEventListener("install", (event) => {
  event.waitUntil(caches.open(STATIC).then((c) => c.addAll(PRECACHE)).then(() => self.skipWaiting()));
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => !k.startsWith(VERSION)).map((k) => caches.delete(k))))
      .then(() => self.clients.claim()),
  );
});

self.addEventListener("fetch", (event) => {
  const req = event.request;
  if (req.method !== "GET") return;
  const url = new URL(req.url);
  if (url.origin !== self.location.origin || url.pathname.startsWith("/api/")) return;

  if (req.mode === "navigate") {
    event.respondWith(fetch(req).catch(() => caches.match("/offline.html")));
    return;
  }

  if (url.pathname.startsWith("/assets/")) {
    event.respondWith(
      caches.match(req).then((hit) => hit || fetch(req).then((res) => {
        if (res.ok) { const copy = res.clone(); caches.open(ASSETS).then((c) => c.put(req, copy)); }
        return res;
      })),
    );
  }
});
