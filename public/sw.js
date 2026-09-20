// Service worker minimal : cache l'app shell (fichiers de l'app elle-même)
// pour un chargement plus rapide et un fonctionnement basique hors-ligne.
//
// IMPORTANT : ce service worker ne doit JAMAIS mettre en cache les appels
// à l'API Supabase (ou toute autre API externe) — sinon le navigateur
// resservirait indéfiniment une vieille réponse (y compris une erreur)
// au lieu d'aller chercher les données à jour. On se limite donc
// strictement aux requêtes vers le même domaine que l'app (self.location.origin).
const CACHE = 'coweplope-v2'

self.addEventListener('install', (event) => {
  self.skipWaiting()
})

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
  )
  self.clients.claim()
})

self.addEventListener('fetch', (event) => {
  const { request } = event
  if (request.method !== 'GET') return

  const url = new URL(request.url)
  // Ne jamais intercepter les requêtes vers un autre domaine (Supabase, etc.)
  if (url.origin !== self.location.origin) return

  event.respondWith(
    caches.match(request).then(
      (cached) =>
        cached ||
        fetch(request)
          .then((response) => {
            const copy = response.clone()
            caches.open(CACHE).then((cache) => cache.put(request, copy))
            return response
          })
          .catch(() => cached)
    )
  )
})
