const CACHE_NAME = 'accountant-tools-v2';
const urlsToCache = [
  'index.html',
  'client_output.html',
  'accounting_problem_solver.html',
  'trial_balance.html',
  'ratios.html',
  'icq.html',
  'substantive.html',
  'adjustments.html',
  'sampling.html',
  'fraud.html',
  'tax.html',
  'report.html',
  'setup.html',
  'manifest.json',
  'icon-192.png',
  'icon-512.png',
  'offline.html'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache =>
      // Tolerate single-file failures so one 404 can't break install
      Promise.allSettled(urlsToCache.map(u => cache.add(u)))
    ).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request).then(cached => {
      if (cached) return cached;
      return fetch(event.request).catch(() => {
        if (event.request.mode === 'navigate') {
          return caches.match('offline.html');
        }
        throw new Error('offline');
      });
    })
  );
});
