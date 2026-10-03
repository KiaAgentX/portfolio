const CACHE_NAME = 'hesaban-v3-final-cache';
const urlsToCache = [
  '/',
  './index.html',
  './manifest.json',
  './sw.js',
  './how_to_start.html',
  './core/styles/base.css',
  './core/styles/layout.css',
  './core/styles/components.css',
  './core/styles/animations.css',
  './core/styles/chat.css',
  './core/scripts/main.js',
  './core/scripts/state.js',
  './core/scripts/ui.js',
  './core/scripts/interactions.js',
  './core/scripts/three_scene.js',
  './core/scripts/chat_widget.js',
  './core/scripts/chat_nova.js',
  './core/three/three.min.js',
  './core/three/OrbitControls.js',
  './core/three/CSS2DRenderer.js',
  './core/fonts/Vazirmatn-Regular.woff2',
  './core/fonts/Vazirmatn-Bold.woff2',
  './core/fonts/Vazirmatn-Black.woff2',
  './trading_hub/index.html',
  './ai_chat/index.html'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(urlsToCache))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => response || fetch(event.request))
  );
});
