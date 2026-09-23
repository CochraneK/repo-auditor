const CACHE = 'faketype-shell-v4';
const ASSETS = [
  './',
  './index.html',
  './styles.css',
  './enhancements.css',
  './qa.css',
  './app.js',
  './enhancements.js',
  './qa.js',
  './manifest.webmanifest',
  './favicon.svg'
];

self.addEventListener('install', (event) => {
  event.waitUntil(caches.open(CACHE).then((cache) => cache.addAll(ASSETS)));
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((key) => key !== CACHE).map((key) => caches.delete(key))))
      .then(() => self.clients.claim())
  );
});

async function networkFirst(request) {
  try {
    const response = await fetch(request);
    if (response?.ok) {
      const cache = await caches.open(CACHE);
      await cache.put(request, response.clone());
    }
    return response;
  } catch (_) {
    return (await caches.match(request)) || caches.match('./index.html');
  }
}

async function staleWhileRevalidate(request) {
  const cached = await caches.match(request);
  const update = fetch(request)
    .then(async (response) => {
      if (response?.ok) {
        const cache = await caches.open(CACHE);
        await cache.put(request, response.clone());
      }
      return response;
    })
    .catch(() => null);

  if (cached) {
    eventWaitUntilSafe(update);
    return cached;
  }

  const updated = await update;
  return updated || caches.match('./index.html');
}

function eventWaitUntilSafe(promise) {
  promise.catch(() => {});
}

self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);
  if (event.request.method !== 'GET' || url.origin !== self.location.origin) return;

  if (event.request.mode === 'navigate') {
    event.respondWith(networkFirst(event.request));
    return;
  }

  event.respondWith(staleWhileRevalidate(event.request));
});
