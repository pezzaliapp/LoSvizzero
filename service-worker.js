const CACHE_NAME = "losvizzero-cache-v2"; // Cambia il numero per forzare l'aggiornamento
const urlsToCache = [
    "./",
    "./index.html",
    "./style.css",
    "./app.js",
    "./manifest.json",
    "./LoSvizzero-192.png",
    "./LoSvizzero-512.png"
];

// Installazione del Service Worker e caching iniziale
self.addEventListener("install", (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            return cache.addAll(urlsToCache);
        })
    );
});

// Intercettazione delle richieste di rete e utilizzo della cache
self.addEventListener("fetch", (event) => {
    event.respondWith(
        caches.match(event.request).then((response) => {
            return response || fetch(event.request);
        })
    );
});

// Aggiornamento della cache e rimozione di versioni obsolete
self.addEventListener("activate", (event) => {
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((cache) => {
                    if (cache !== CACHE_NAME) {
                        console.log("Cache vecchia eliminata:", cache);
                        return caches.delete(cache);
                    }
                })
            );
        })
    );
    self.clients.claim(); // Forza l'aggiornamento sui client
});
