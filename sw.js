/* Offline cache for Rettungsleitstelle – Escape */
const CACHE_VERSION = 'v1-2025-08-22';
const CACHE_NAME = 'rls-cache-' + CACHE_VERSION;
const ASSETS = [
  './',
  './index.html',
  './manifest.webmanifest'
];

self.addEventListener('install', (event) => {
  event.waitUntil(caches.open(CACHE_NAME).then(cache => cache.addAll(ASSETS)));
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then(keys => Promise.all(keys.map(k => { if(!k.includes(CACHE_VERSION)) return caches.delete(k); })))
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method === 'GET' && new URL(req.url).origin === self.location.origin) {
    event.respondWith(
      caches.match(req).then(cached => cached || fetch(req).then(resp => {
        try {
          const copy = resp.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(req, copy));
        } catch(e) {}
        return resp;
      }).catch(()=> caches.match('./index.html')))
    );
  }
});
