// Bump this version whenever the application shell changes.
const CACHE = 'weekly-sips-v5';
const ROOT = new URL('./', self.registration.scope).href;
const SHELL = [
  './', './index.html', './style.css?v=5', './logic.js', './app.js?v=5',
  './icon.png?v=5', './icon.svg?v=5', './manifest.webmanifest?v=5'
].map(path => new URL(path, ROOT).href);

self.addEventListener('install', event => {
  // Install a complete offline copy before replacing the previous version.
  event.waitUntil((async () => {
    const cache = await caches.open(CACHE);
    await cache.addAll(SHELL.map(url => new Request(url, { cache: 'reload' })));
    await self.skipWaiting();
  })());
});

self.addEventListener('activate', event => {
  event.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(keys.filter(key =>
      key.startsWith('weekly-sips-') && key !== CACHE
    ).map(key => caches.delete(key)));
    await self.clients.claim();
  })());
});

self.addEventListener('fetch', event => {
  const request = event.request;
  const url = new URL(request.url);
  if (request.method !== 'GET' || url.origin !== self.location.origin ||
      !url.href.startsWith(ROOT)) return;

  event.respondWith((async () => {
    const cache = await caches.open(CACHE);
    // All application entry URLs use the same offline home page.
    const isHome = request.mode === 'navigate' &&
      (url.pathname === new URL(ROOT).pathname ||
       url.pathname === new URL('index.html', ROOT).pathname);
    const key = isHome ? ROOT : request;
    const cached = await cache.match(key);
    if (cached) return cached;

    // Recover only missing resources; cached startup never waits for a network request.
    const response = await fetch(request);
    const usable = response.ok && !response.redirected &&
      (!isHome || (response.headers.get('content-type') || '').includes('text/html'));
    if (usable) {
      try { await cache.put(key, response.clone()); } catch {
        // A storage quota error must not prevent using the downloaded resource.
      }
    }
    return response;
  })());
});
