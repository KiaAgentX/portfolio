/* FISHKAL — Service Worker
   Simple cache-first strategy for static assets.
   The HTML itself uses network-first with a cache fallback. */

const VERSION = 'fishkal-v1.0.0';
const STATIC_CACHE = `${VERSION}-static`;
const RUNTIME_CACHE = `${VERSION}-runtime`;

const PRECACHE_URLS = [
  '/',
  '/deep-catch/',
  '/assets/css/style.css',
  '/assets/img/hero.webp',
  '/assets/img/hero.avif',
  '/assets/img/favicon.svg',
  '/assets/js/config.js',
  '/assets/js/motion.js',
  '/assets/js/i18n.js',
  '/assets/js/stage.js',
  '/assets/js/hero.js',
  '/assets/js/underwater.js',
  '/assets/js/fish.js',
  '/assets/js/audio.js',
  '/assets/js/hook.js',
  '/assets/js/game.js',
  '/assets/js/ui.js',
  '/assets/js/main.js'
];

/* Install — precache static assets */
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(STATIC_CACHE)
      .then(cache => cache.addAll(PRECACHE_URLS))
      .then(() => self.skipWaiting())
  );
});

/* Activate — clean up old caches */
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys
          .filter(key => key !== STATIC_CACHE && key !== RUNTIME_CACHE)
          .map(key => caches.delete(key))
      )
    ).then(() => self.clients.claim())
  );
});

/* Fetch — cache-first for assets, network-first for HTML */
self.addEventListener('fetch', event => {
  const { request } = event;
  const url = new URL(request.url);

  /* Skip cross-origin (fonts, analytics) */
  if (url.origin !== location.origin) return;

  /* HTML — network-first, fall back to cache */
  if (request.headers.get('accept')?.includes('text/html')) {
    event.respondWith(
      fetch(request)
        .then(response => {
          const copy = response.clone();
          caches.open(RUNTIME_CACHE).then(cache => cache.put(request, copy));
          return response;
        })
        .catch(() => caches.match(request).then(r => r || caches.match('/')))
    );
    return;
  }

  /* Everything else — cache-first */
  event.respondWith(
    caches.match(request).then(cached => {
      if (cached) return cached;
      return fetch(request).then(response => {
        /* Cache only successful GET responses */
        if (request.method === 'GET' && response.status === 200) {
          const copy = response.clone();
          caches.open(RUNTIME_CACHE).then(cache => cache.put(request, copy));
        }
        return response;
      });
    })
  );
});
