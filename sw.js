const CACHE_PREFIX = 'mbtd-app-code-v1-';
const CACHE_NAME = CACHE_PREFIX + '13556fef3f13f269d0b0';
const PRECACHE = ["/","/assets/index-BNRwT4Ht.css","/assets/index-C_CTI2fH.js","/index.html","/manifest.webmanifest","/icons/budget.svg","/icons/budget-192.png","/icons/budget-512.png","/fonts/anton-latin.woff2","/fonts/anton-OFL.txt","/univers/caraibes-jour.webp","/univers/caraibes-nuit.webp"];
const INTEGRITY = {"/assets/index-BNRwT4Ht.css":"sha256-71v5kRj7HIhragvGh6/Vo76bCOLjp5iQOzUqca2dndU=","/assets/index-C_CTI2fH.js":"sha256-80+C4RmS+Da2YN6LsvXHVbyQMsM6cxrMwwt9LE7ZWEk=","/index.html":"sha256-8PnsDmOeCm6rpeSgICtm/+Gh5wVZkqh6lGwf0Bzsf0E=","/manifest.webmanifest":"sha256-bdgpFJYX6xmvOnfY8G/k6aEmyodaO3/wQY9UtmcW0dk=","/icons/budget.svg":"sha256-CLvc0SL+U6gOlWODVUvy4JJRgjQsJXk5W4b8+HbAePM=","/icons/budget-192.png":"sha256-WHK0ZlfMcbYgIJBC2o6A0U8Yl1PjVtQq7NtgSSYtnRo=","/icons/budget-512.png":"sha256-xZJ+pQfoUQcTPLPFiOue78opPZplt6wicET8+C4jR7g=","/fonts/anton-latin.woff2":"sha256-0PoH/2PdYMvA4vWOKcgC3KKlrgJ2yZn1nGERq3u67Ds=","/fonts/anton-OFL.txt":"sha256-7uHST/j1U+tzIjfH3ZuUWngxPtSa1t4ChypHJ3dBtEo=","/univers/caraibes-jour.webp":"sha256-dX5SjFNn7dZPC5Tkkm+I31bJ1aL2iHto1yDnsQRizJ0=","/univers/caraibes-nuit.webp":"sha256-VXKkz0qZWbW0B6bK4/trNoLGHA/JgrIFOoAk4JLEd4M=","/":"sha256-8PnsDmOeCm6rpeSgICtm/+Gh5wVZkqh6lGwf0Bzsf0E="};
// CACHE_PREFIX, CACHE_NAME, PRECACHE et INTEGRITY sont injectés par le build Vite.
// Aucun stockage budgétaire, JSON utilisateur, API Supabase, export ou réponse opaque.
const allowed = new Set(PRECACHE.map(path => new URL(path, self.location.origin).href));
const codeRequest = url => new Request(url, { cache: 'reload', credentials: 'omit', integrity: INTEGRITY[new URL(url).pathname] });
self.addEventListener('install', event => {
  event.waitUntil((async () => {
    const cache = await caches.open(CACHE_NAME);
    try {
      await cache.addAll([...allowed].map(codeRequest));
    } catch (error) { await caches.delete(CACHE_NAME); throw error; }
  })());
});
self.addEventListener('activate', event => {
  event.waitUntil((async () => {
    for (const name of await caches.keys()) {
      if (name.startsWith(CACHE_PREFIX) && name !== CACHE_NAME) await caches.delete(name);
    }
    await self.clients.claim();
  })());
});
self.addEventListener('fetch', event => {
  const url = new URL(event.request.url);
  // Seul le code public de la liste fermée est servi ; tout le reste (Supabase compris) va au réseau.
  if (event.request.method !== 'GET' || url.search || !allowed.has(url.href)) return;
  event.respondWith((async () => {
    const cache = await caches.open(CACHE_NAME);
    // Les modules/styles crossorigin ajoutent Origin, contrairement au précache.
    // Un serveur qui répond Vary: Origin ferait manquer une ressource pourtant présente,
    // surtout hors ligne : on cherche avec la requête normalisée, vérifiée par SRI.
    const request = codeRequest(url.href);
    return await cache.match(request) ?? fetch(request);
  })());
});
// Pas de skipWaiting : une nouvelle version s'active au prochain lancement,
// une fois toutes les fenêtres de l'application fermées.
