const CACHE_PREFIX = 'mbtd-app-code-v1-';
const CACHE_NAME = CACHE_PREFIX + '4564ba6367b75c979453';
const PRECACHE = ["/","/assets/index-2gCB-fND.css","/assets/index-DYKjiSLr.js","/index.html","/manifest.webmanifest","/icons/budget.svg","/icons/budget-192.png","/icons/budget-512.png"];
const INTEGRITY = {"/assets/index-2gCB-fND.css":"sha256-MBoG6h/efWIMuouM2nL6cBeCQM1JR8HxfSnNOkv9ULc=","/assets/index-DYKjiSLr.js":"sha256-fSo8dCuH2/Fw3JJmXXzLTHYxoflN4tv3dw86NMgN5JQ=","/index.html":"sha256-zAazAVYLLxjpGQYUHR7/NW7P3YPmXGvd5LuqklQMhmw=","/manifest.webmanifest":"sha256-bdgpFJYX6xmvOnfY8G/k6aEmyodaO3/wQY9UtmcW0dk=","/icons/budget.svg":"sha256-CLvc0SL+U6gOlWODVUvy4JJRgjQsJXk5W4b8+HbAePM=","/icons/budget-192.png":"sha256-WHK0ZlfMcbYgIJBC2o6A0U8Yl1PjVtQq7NtgSSYtnRo=","/icons/budget-512.png":"sha256-xZJ+pQfoUQcTPLPFiOue78opPZplt6wicET8+C4jR7g=","/":"sha256-zAazAVYLLxjpGQYUHR7/NW7P3YPmXGvd5LuqklQMhmw="};
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
