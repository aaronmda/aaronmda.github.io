const CACHE = "ricavista-app-v1";
const SHELL = [
  "/ricavista/app/",
  "/ricavista/app/index.html",
  "/ricavista/app/manifest.json",
  "/ricavista/css/styles.css",
  "/ricavista/js/store.js",
  "/ricavista/js/ui.js",
  "/ricavista/js/qr.js",
  "/ricavista/js/app.js",
  "/ricavista/icons/logo.svg",
  "/ricavista/icons/icon.svg"
];
self.addEventListener("install", (event) => {
  event.waitUntil(caches.open(CACHE).then((c) => c.addAll(SHELL)).then(() => self.skipWaiting()));
});
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))).then(() => self.clients.claim())
  );
});
self.addEventListener("fetch", (event) => {
  const req = event.request;
  if (req.method !== "GET") return;
  event.respondWith(
    caches.match(req).then((hit) => hit || fetch(req).then((res) => {
      const copy = res.clone();
      caches.open(CACHE).then((c) => c.put(req, copy)).catch(() => {});
      return res;
    }).catch(() => caches.match("/ricavista/app/index.html")))
  );
});
