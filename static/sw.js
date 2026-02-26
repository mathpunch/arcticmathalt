importScripts('/uv/uv.bundle.js');
importScripts('/uv/uv.config.js');
importScripts('/uv/uv.sw.js');

const CACHE_NAME = 'arctic-v1.0';
const urlsToCache = [
  '/static/',
  '/static/index.html',
  '/static/settings.html',
  '/static/assets/css/app.css',
  '/static/assets/css/menu.css',
  '/static/assets/js/particles.js',
  '/static/assets/js/themes.js',
  '/static/assets/js/index.js',
  '/static/assets/js/anym.js',
  '/static/assets/js/main.js',
  '/static/assets/img/salyte.jpg',
  '/static/android-chrome-192x192.png',
  '/static/android-chrome-512x512.png',
  '/static/wk/wk2.js',
  '/static/wk/wk3.js'
];

const uv = new UVServiceWorker();

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      // Cache in parallel with individual catch so one failure doesnt block others
      return Promise.all(
        urlsToCache.map(url =>
          cache.add(new Request(url, { cache: 'reload' })).catch(() => {})
        )
      );
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames
          .filter(cacheName => cacheName !== CACHE_NAME)
          .map(cacheName => caches.delete(cacheName))
      );
    })
  );
  return self.clients.claim();
});

async function handleRequest(event) {
  // UV handles proxy routes first
  if (uv.route(event)) {
    return await uv.fetch(event);
  }

  // Serve from cache immediately if available
  const cachedResponse = await caches.match(event.request);
  if (cachedResponse) return cachedResponse;

  try {
    const response = await fetch(event.request);

    // Only cache valid same-origin responses
    if (response && response.status === 200 && response.type === 'basic') {
      const responseToCache = response.clone();
      // Non-blocking cache write so it doesnt delay the response
      caches.open(CACHE_NAME).then(cache => {
        cache.put(event.request, responseToCache);
      });
    }

    return response;
  } catch {
    // If network fails and nothing is cached, return offline fallback
    return new Response('Offline - please check your connection.', {
      status: 503,
      headers: { 'Content-Type': 'text/plain' }
    });
  }
}

self.addEventListener('fetch', (event) => {
  event.respondWith(handleRequest(event));
});
