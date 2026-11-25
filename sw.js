/* The page: the network gets a short head start so a deploy shows up straight
   away, but if it hasn't answered in time the saved copy is used. With one bar
   of signal, waiting on the network indefinitely is the same as not opening.
   Everything else (icons, the sync library) is served from the cache, which
   only changes when the version below does. Every path is relative, because
   GitHub Pages serves each app from its own subfolder.

   CHANGE APP_ID FOR EVERY NEW APP (use the first part of APP.key in
   index.html, e.g. 'workout' for 'workout-v1'). All the apps share one site,
   so they share one cache store: the id keeps this app's cache apart. */
const APP_ID = 'app';
const CACHE = APP_ID + '-v2';
const SHELL = ['./', './index.html', './manifest.webmanifest',
               './icon-192.png', './icon-512.png',
               './firebase-app-compat.js', './firebase-database-compat.js'];
const PATIENCE = 2500;   // ms the network gets before the saved page is shown

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(SHELL)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', e => {
  /* clear only this app's old caches, never another app's */
  e.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k.startsWith(APP_ID + '-') && k !== CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return;   // never touch Firebase or GitHub

  const isPage = req.mode === 'navigate' ||
                 (req.headers.get('accept') || '').includes('text/html');

  if (isPage) {
    /* Asked for with the browser's own cache switched off: a restored tab can
       otherwise be handed a days-old page from that cache, which then gets
       saved here as if it were new. (A redirected answer can't be used for a
       page load, so that rare case goes the ordinary way.) */
    const fresh = fetch(url.href, { cache: 'no-store', credentials: 'same-origin' })
      .then(res => res.redirected ? fetch(req) : res)
      .then(res => {
        /* an error page from the host must never replace the saved copy */
        if (res.ok) { const copy = res.clone(); caches.open(CACHE).then(c => c.put('./index.html', copy)); }
        return res;
      });
    e.waitUntil(fresh.then(() => {}, () => {}));     // let a slow answer still refresh the cache
    e.respondWith((async () => {
      const saved = await caches.match('./index.html') || await caches.match('./');
      if (!saved) return fresh;                      // first ever visit: nothing to fall back on
      const late = new Promise(done => setTimeout(() => done(null), PATIENCE));
      const first = await Promise.race([fresh.catch(() => null), late]);
      return (first && first.ok) ? first : saved;
    })());
    return;
  }

  e.respondWith(
    caches.match(req).then(hit => hit || fetch(req).then(res => {
      if (res.ok) { const copy = res.clone(); caches.open(CACHE).then(c => c.put(req, copy)); }
      return res;
    }))
  );
});
