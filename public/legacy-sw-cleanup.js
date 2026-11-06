// One-time cleanup: an earlier production build registered a PWA
// service worker on this origin. Once installed, it serves its own
// cached (and now stale) copy of the app forever, ignoring whatever
// the server actually serves - no server-side fix can reach it.
// Unregister it, clear its caches, and reload once (guarded by
// sessionStorage) so the tab stops being controlled by it. If no
// registration exists, nothing is touched.
(function () {
  if (!("serviceWorker" in navigator)) return;
  navigator.serviceWorker.getRegistrations().then(function (regs) {
    // El de la PWA actual (/pwa-sw.js, nunca sirve páginas desde la caché) se respeta; solo se quita el antiguo.
    regs = regs.filter(function (r) {
      var w = r.active || r.waiting || r.installing;
      return !(w && /\/pwa-sw\.js$/.test(new URL(w.scriptURL).pathname));
    });
    if (!regs.length) return;
    Promise.all(regs.map(function (r) { return r.unregister(); })).then(function () {
      var clear = "caches" in window
        ? caches.keys().then(function (keys) {
            return Promise.all(keys.map(function (k) { return caches.delete(k); }));
          })
        : Promise.resolve();
      clear.catch(function () {}).then(function () {
        var reloadKey = "dr-sw-cleanup-v1";
        try {
          if (sessionStorage.getItem(reloadKey)) return;
          sessionStorage.setItem(reloadKey, "1");
        } catch (e) {
          return;
        }
        location.reload();
      });
    });
  }).catch(function () {});
})();
