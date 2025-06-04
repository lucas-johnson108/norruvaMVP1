// public/sw.js
const CACHE_NAME = 'norruva-cache-v1';
const urlsToCache = [
  '/',
  '/app', // Add main app route
  '/dashboard', // Add dashboard route
  '/manifest.json',
  '/icons/icon-192x192.png',
  '/icons/icon-512x512.png',
  // Add other important assets: CSS, JS bundles (Next.js handles this mostly), key images
  // Be careful not to cache too much or dynamic API responses.
];

self.addEventListener('install', (event) => {
  console.log('[Service Worker] Install event');
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('[Service Worker] Opened cache:', CACHE_NAME);
        return cache.addAll(urlsToCache);
      })
      .catch(err => {
        console.error('[Service Worker] Cache addAll failed:', err);
      })
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  console.log('[Service Worker] Activate event');
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('[Service Worker] Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  return self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  // For navigation requests, try network first, then cache (Network-first or Stale-while-revalidate for HTML)
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request)
        .catch(() => {
          return caches.match(event.request)
            .then((response) => {
              return response || caches.match('/'); // Fallback to root if specific page not cached
            });
        })
    );
    return;
  }

  // For other requests (assets), use Cache-first strategy
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        if (response) {
          // console.log('[Service Worker] Serving from cache:', event.request.url);
          return response;
        }
        // console.log('[Service Worker] Fetching from network:', event.request.url);
        return fetch(event.request).then(
          (networkResponse) => {
            // Optionally cache new assets dynamically, but be careful with opaque responses or large files
            // if (networkResponse && networkResponse.status === 200 && networkResponse.type === 'basic') {
            //   const responseToCache = networkResponse.clone();
            //   caches.open(CACHE_NAME).then(cache => cache.put(event.request, responseToCache));
            // }
            return networkResponse;
          }
        );
      })
      .catch(err => {
        console.error('[Service Worker] Fetch error:', err, event.request.url);
        // Optionally, provide a fallback for specific asset types, e.g., a placeholder image
      })
  );
});
