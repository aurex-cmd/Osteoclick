// Osteoclick: tiene in cache le immagini per mostrarle subito, anche offline.
// Le pagine si chiedono prima alla rete (così gli aggiornamenti arrivano subito),
// le immagini prima alla cache (il ?v= nel nome forza il ricaricamento quando cambiano).
const CACHE = "osteoclick-v2";
const IMGS = [1,2,3,4,5,6,7,8,9].flatMap(n => [`img/cfs-${n}-thumb.jpg?v=4`, `img/cfs-${n}.jpg?v=4`]);

self.addEventListener("install", e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(["./", ...IMGS])).then(() => self.skipWaiting()));
});
self.addEventListener("activate", e => {
  e.waitUntil(caches.keys()
    .then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k))))
    .then(() => self.clients.claim()));
});
self.addEventListener("fetch", e => {
  const req = e.request;
  if(req.method !== "GET" || new URL(req.url).origin !== location.origin) return;
  // il video arriva a pezzi (Range, risposte 206) che la cache non può salvare: sempre dalla rete
  if(req.destination === "video" || req.headers.has("range")) return;
  const isImg = req.destination === "image";
  e.respondWith(isImg
    ? caches.match(req).then(hit => hit || fetch(req).then(res => {
        if(res.ok){ const copy = res.clone(); caches.open(CACHE).then(c => c.put(req, copy)); }
        return res;
      }))
    : fetch(req).then(res => {
        if(res.ok){ const copy = res.clone(); caches.open(CACHE).then(c => c.put(req, copy)); }
        return res;
      }).catch(() => caches.match(req).then(hit => hit || caches.match("./"))));
});
