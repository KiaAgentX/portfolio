const V='fishkal-deepcatch-v2';
const CORE=['./','index.html','manifest.webmanifest','biz.css','biz.js','assets/icon-192.png','assets/icon-512.png'];
self.addEventListener('install',e=>{e.waitUntil(caches.open(V).then(c=>c.addAll(CORE)));self.skipWaiting();});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k!==V).map(k=>caches.delete(k)))));});
self.addEventListener('fetch',e=>{
  if(e.request.method!=='GET'||!e.request.url.startsWith(self.location.origin))return;
  e.respondWith(caches.match(e.request,{ignoreSearch:true}).then(h=>h||fetch(e.request).then(r=>{
    const cp=r.clone();caches.open(V).then(c=>c.put(e.request,cp));return r;
  }).catch(()=>caches.match('index.html'))));
});
