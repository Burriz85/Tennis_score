// service-worker.js — minimal offline cache for Tennis Score PWA
const CACHE = 'tennis-score-v3';
const FILES = [
  './',
  './index.html',
  './tweaks-panel.jsx',
  './tennis-court.jsx',
  './tennis-engine.jsx',
  './tennis-screens.jsx',
  './tennis-extras.jsx',
  './tennis-voice.jsx',
  './tennis-app.jsx',
  './manifest.webmanifest',
  './icon-192.png',
  './icon-512.png',
  'https://unpkg.com/react@18.3.1/umd/react.development.js',
  'https://unpkg.com/react-dom@18.3.1/umd/react-dom.development.js',
  'https://unpkg.com/@babel/standalone@7.29.0/babel.min.js',
];

self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE).then((c) =>
      // best-effort: ignore individual failures
      Promise.all(FILES.map((f) => c.add(f).catch(() => {})))
    )
  );
  self.skipWaiting();
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', (e) => {
  if (e.request.method !== 'GET') return;
  e.respondWith(
    caches.match(e.request).then((cached) => {
      if (cached) return cached;
      return fetch(e.request).then((res) => {
        // cache same-origin / unpkg responses on the fly
        if (res && res.status === 200) {
          const clone = res.clone();
          caches.open(CACHE).then((c) => c.put(e.request, clone)).catch(() => {});
        }
        return res;
      }).catch(() => cached);
    })
  );
});
