/* global caches, location, self */

const CACHE_NAME = "pixel-era-compressor-v1";
// Cache the shell and install icons so the PWA can launch even when the network
// is unavailable after a first successful visit.
const CORE_ASSETS = [
  "/",
  "/index.html",
  "/favicon/android-chrome-192x192.png",
  "/favicon/android-chrome-512x512.png",
  "/favicon/apple-touch-icon.png",
  "/favicon/favicon-16x16.png",
  "/favicon/favicon-32x32.png",
  "/favicon/favicon.ico",
  "/favicon/site.webmanifest",
];

// Pre-cache the core shell during install. Vite-built hashed assets are cached
// lazily by the fetch handler below.
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(CORE_ASSETS);
    }),
  );
});

// Remove older named caches when the service worker version changes.
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((cacheName) => cacheName !== CACHE_NAME)
          .map((cacheName) => caches.delete(cacheName)),
      );
    }),
  );
});

// Network-first for same-origin GET requests: users get fresh builds when
// online, with cached pages/assets as the offline fallback.
self.addEventListener("fetch", (event) => {
  const requestUrl = new URL(event.request.url);

  if (event.request.method !== "GET" || requestUrl.origin !== location.origin) {
    return;
  }

  event.respondWith(
    fetch(event.request)
      .then((response) => {
        const responseForCache = response.clone();

        // Cache successful network responses opportunistically for future
        // offline launches. The response is cloned because streams are one-use.
        caches.open(CACHE_NAME).then((cache) => {
          return cache.put(event.request, responseForCache);
        });

        return response;
      })
      .catch(() => {
        return caches.match(event.request).then((cachedResponse) => {
          return cachedResponse ?? caches.match("/index.html");
        });
      }),
  );
});
