const CACHE = "type-mandarin-v1";

self.addEventListener("install", () => {
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((key) => key !== CACHE).map((key) => caches.delete(key))),
    ).then(() => self.clients.claim()),
  );
});

self.addEventListener("fetch", (event) => {
  const request = event.request;
  if (request.method !== "GET") return;
  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;

  const immutable = url.pathname.includes("/_next/static/");
  if (immutable) {
    event.respondWith(caches.match(request).then((hit) => hit || fetchAndStore(request)));
    return;
  }

  event.respondWith(
    fetchAndStore(request).catch(() => caches.match(request).then((hit) => hit || Response.error())),
  );
});

function fetchAndStore(request) {
  return fetch(request).then((response) => {
    if (response && response.ok) {
      const copy = response.clone();
      caches.open(CACHE).then((cache) => cache.put(request, copy));
    }
    return response;
  });
}
