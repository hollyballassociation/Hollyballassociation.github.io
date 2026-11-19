/* Hollyball Association : service worker v3.
   - Pages, scripts, styles : réseau d'abord (toujours la dernière version), copie en mémoire si le réseau est lent (> 4 s) ou coupé.
   - Images, polices : copie en mémoire d'abord, mise à jour en arrière-plan (chargement instantané aux visites suivantes).
   - Hors connexion : les pages déjà visitées, le règlement et la présentation du sport restent lisibles. */
var V = 'hol-v3', PRE = ['./', 'index.html', 'sport.html', 'reglement.html', 'createurs.html', 'hero.jpg', 'logo-hollyball.png', 'carte.js', 'controle.html', 'controle.webmanifest', 'config.js'];
self.addEventListener('install', function (e) {
  e.waitUntil(caches.open(V).then(function (c) { return Promise.all(PRE.map(function (u) { return c.add(u).catch(function () {}); })); }).then(function () { return self.skipWaiting(); }));
});
self.addEventListener('activate', function (e) {
  e.waitUntil(caches.keys().then(function (ks) {
    return Promise.all(ks.filter(function (k) { return k !== V; }).map(function (k) { return caches.delete(k); }));
  }).then(function () { return self.clients.claim(); }));
});
function put(r, res) { if (res && res.ok) { var c = res.clone(); caches.open(V).then(function (ca) { ca.put(r, c); }); } return res; }
self.addEventListener('fetch', function (e) {
  var r = e.request, u = new URL(r.url);
  if (r.method !== 'GET' || u.origin !== self.location.origin) return;
  if (/\.(jpe?g|png|webp|gif|svg|ico|woff2?)$/i.test(u.pathname)) {
    e.respondWith(caches.match(r).then(function (m) {
      var net = fetch(r).then(function (res) { return put(r, res); }).catch(function () { return m; });
      return m || net;
    }));
    return;
  }
  e.respondWith(new Promise(function (ok) {
    var done = false, t = setTimeout(function () {
      caches.match(r).then(function (m) { if (m && !done) { done = true; ok(m); } });
    }, 4000);
    fetch(r).then(function (res) { clearTimeout(t); if (!done) { done = true; ok(put(r, res)); } else put(r, res); })
      .catch(function () { clearTimeout(t); if (done) return; caches.match(r).then(function (m) { done = true; ok(m || caches.match('./') || Response.error()); }); });
  }));
});
