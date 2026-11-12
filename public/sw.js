const CACHE_VERSION = "v4";
const CACHE_NAME = `acp-cache-${CACHE_VERSION}`;
const CACHE_PREFIX = "acp-cache-";
const MANIFEST_URL = "/precache-manifest.json";

// Fallback list used only if fetching the generated manifest fails (e.g. it
// wasn't produced, such as when testing `next dev` output directly). The real
// manifest, written by scripts/generate-precache-manifest.mjs as part of
// `npm run build`, additionally includes every hashed /_next/static/* chunk
// and the route .txt (RSC payload) files, so a fresh install can serve
// "/", "/flashcards" and "/practice-test" fully — HTML, JS and CSS — without
// ever having been visited online first.
const FALLBACK_PRECACHE_URLS = [
  "/",
  "/flashcards",
  "/practice-test",
  "/manifest.webmanifest",
  "/icons/icon-192.png",
  "/icons/icon-512.png",
  "/icons/icon-maskable-192.png",
  "/icons/icon-maskable-512.png",
  "/icons/apple-touch-icon.png",
  "/icons/favicon-16.png",
  "/icons/favicon-32.png",
  "/images/australian-flag.png",
  "/images/aboriginal-flag.jpg",
  "/images/torres-strait-islander-flag.jpg",
  "/images/coat-of-arms.png",
  "/images/golden-wattle.jpg",
  "/images/opal-gemstone.jpg",
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then(async (cache) => {
        try {
          const response = await fetch(MANIFEST_URL);
          if (!response.ok) throw new Error("manifest not found");
          const manifest = await response.json();
          await cache.addAll(manifest);
        } catch {
          // Manifest missing/unreachable (e.g. no production build was run) —
          // fall back to the smaller hardcoded list so install still succeeds.
          await cache.addAll(FALLBACK_PRECACHE_URLS).catch(() => {});
        }
      })
      .then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys
            .filter((key) => key.startsWith(CACHE_PREFIX) && key !== CACHE_NAME)
            .map((key) => caches.delete(key))
        )
      )
      .then(() => self.clients.claim())
  );
});

// Stale-while-revalidate for same-origin GET requests, so the app keeps
// working offline once pages/assets have been visited at least once (and,
// thanks to the precache above, even for routes visited for the first time).
self.addEventListener("fetch", (event) => {
  const { request } = event;
  if (request.method !== "GET") return;

  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;

  event.respondWith(
    caches.open(CACHE_NAME).then(async (cache) => {
      const cached = await cache.match(request);
      const networkFetch = fetch(request)
        .then((response) => {
          if (response && response.status === 200) {
            event.waitUntil(cache.put(request, response.clone()));
          }
          return response;
        })
        .catch(() => cached);

      return cached || networkFetch;
    })
  );
});
