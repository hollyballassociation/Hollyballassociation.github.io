/* Hollyball Association : service worker minimal.
   Réseau d'abord : le site affiche toujours la dernière version ; la copie en mémoire ne sert qu'en cas de coupure. */
var V = 'hol-v1';
self.addEventListener('install', function (e) { self.skipWaiting(); });
self.addEventListener('activate', function (e) {
  e.waitUntil(caches.keys().then(function (ks) {
    return Promise.all(ks.filter(function (k) { return k !== V; }).map(function (k) { return caches.delete(k); }));
  }).then(function () { return self.clients.claim(); }));
});
self.addEventListener('fetch', function (e) {
  var r = e.request, u = new URL(r.url);
  if (r.method !== 'GET' || u.origin !== self.location.origin) return;
  e.respondWith(fetch(r).then(function (res) {
    if (res && res.ok) { var c = res.clone(); caches.open(V).then(function (ca) { ca.put(r, c); }); }
    return res;
  }).catch(function () {
    return caches.match(r).then(function (m) { return m || caches.match('./'); });
  }));
});
