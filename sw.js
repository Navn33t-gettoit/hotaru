const CACHE_NAME = "ember-v2";

const CORE_ASSETS = [
  "./",
  "./index.html",
  "./ember.css",
  "./app.js",
  "./manifest.json",
  "./sw.js",
  "./assets/ember-logo.svg",
  "./assets/icon-192.png",
  "./assets/icon-512.png"
];

const FONT_ASSET =
  "https://fonts.googleapis.com/css2?family=Hanken+Grotesk:wght@300;400;500;600&family=Newsreader:ital,opsz,wght@0,6..72,300;0,6..72,400;0,6..72,500;1,6..72,300;1,6..72,400&display=swap";

self.addEventListener("install", function (event) {
  event.waitUntil(
    caches.open(CACHE_NAME).then(function (cache) {
      return cache.addAll(CORE_ASSETS).then(function () {
        return cache.add(FONT_ASSET).catch(function () {});
      });
    }).then(function () {
      return self.skipWaiting();
    })
  );
});

self.addEventListener("activate", function (event) {
  event.waitUntil(
    caches.keys().then(function (keys) {
      return Promise.all(
        keys
          .filter(function (key) { return key !== CACHE_NAME; })
          .map(function (key) { return caches.delete(key); })
      );
    }).then(function () {
      return self.clients.claim();
    })
  );
});

/* Network-first for the app shell and code so updates land immediately;
   the cache is the offline fallback. Static assets stay cache-first. */
self.addEventListener("fetch", function (event) {
  if (event.request.method !== "GET") return;

  var url = new URL(event.request.url);
  var isCode =
    event.request.mode === "navigate" ||
    /\.(js|css|html|json)$/.test(url.pathname);

  if (isCode) {
    event.respondWith(
      fetch(event.request).then(function (response) {
        if (response && response.status === 200 && response.type !== "opaque") {
          var copy = response.clone();
          caches.open(CACHE_NAME).then(function (cache) {
            cache.put(event.request, copy);
          });
        }
        return response;
      }).catch(function () {
        return caches.match(event.request).then(function (cached) {
          return cached || (event.request.mode === "navigate"
            ? caches.match("./index.html")
            : undefined);
        });
      })
    );
    return;
  }

  event.respondWith(
    caches.match(event.request).then(function (cached) {
      if (cached) return cached;

      return fetch(event.request).then(function (response) {
        if (!response || response.status !== 200 || response.type === "opaque") {
          return response;
        }

        var copy = response.clone();
        caches.open(CACHE_NAME).then(function (cache) {
          cache.put(event.request, copy);
        });

        return response;
      });
    })
  );
});
