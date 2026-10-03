// ============================================================
// DOGE Vault Premium – Service Worker v4.0
// Fully offline – The Dogefather Edition
// ============================================================

const CACHE_NAME = 'doge-vault-premium-v5';
const urlsToCache = [
  './',
  './index.html',
  './doge-vault.html',
  './setup.html',
  './walkthrough.html',
  './mini-journal.html',
  './easy-run.html',
  './doge-easy.html',
  './doge-normal.html',
  './doge-hard.html',
  './doge-veryhard.html',
  './doge-legendry.html',
  './doge-ict.html',
  './doge-starter.html',
  './doge-starterpro.html',
  './doge-history.html',
  './doge-history.txt',
  './doge-config.json',
  './manifest.json',
  './service-worker.js',
  './icon-192.png',
  './icon-512.png',
  './favicon.ico',
  './readme.md'
];

// Install event – cache all files
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(async cache => {
        console.log('CACHING (fault-tolerant) DOGE Vault files...');
        const results = await Promise.allSettled(urlsToCache.map(u => cache.add(u)));
        const failed = results.filter(r => r.status === 'rejected');
        if (failed.length) console.warn('SW: skipped', failed.length, 'uncacheable URL(s) - rest cached OK');
        return true;
      })
      .catch(error => {
        console.error('❌ Cache install failed:', error);
      })
  );
});

// Activate event – clean old caches
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME) {
            console.log('🧹 Removing old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  return self.clients.claim();
});

// Fetch event – serve from cache, fallback to network
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        if (response) {
          return response;
        }
        return fetch(event.request)
          .then(networkResponse => {
            if (networkResponse && networkResponse.status === 200) {
              const responseClone = networkResponse.clone();
              caches.open(CACHE_NAME).then(cache => {
                cache.put(event.request, responseClone);
              });
            }
            return networkResponse;
          })
          .catch(error => {
            console.error('❌ Fetch failed:', error);
            if (event.request.mode === 'navigate') {
              return caches.match('./index.html');
            }
            return new Response('Offline – Please check your connection.', {
              status: 503,
              statusText: 'Service Unavailable'
            });
          });
      })
  );
});