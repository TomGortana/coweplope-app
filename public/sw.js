// Service worker minimal : cache l'app shell (fichiers de l'app elle-même)
// pour un chargement plus rapide et un fonctionnement basique hors-ligne.
//
// IMPORTANT : ce service worker ne doit JAMAIS mettre en cache les appels
// à l'API Supabase (ou toute autre API externe) — sinon le navigateur
// resservirait indéfiniment une vieille réponse (y compris une erreur)
// au lieu d'aller chercher les données à jour. On se limite donc
// strictement aux requêtes vers le même domaine que l'app (self.location.origin).
//
// Stratégie de cache différenciée :
// - fichiers /assets/* (nom avec hash de contenu, ex: index-abc123.js) :
//   cache-first — un hash donné ne change jamais de contenu, donc c'est
//   sans risque et plus rapide.
// - tout le reste (index.html, /, manifest.json...) : network-first — on
//   essaie toujours le réseau en premier pour voir la dernière version
//   déployée, et on ne retombe sur le cache qu'hors-ligne. Sans ça, un
//   nouveau déploiement ne serait jamais visible pour un visiteur qui a
//   déjà mis l'app en cache.
const CACHE = 'coweplope-v3'

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

  const isHashedAsset = url.pathname.startsWith('/assets/')

  event.respondWith(
    isHashedAsset
      ? caches.match(request).then(
          (cached) =>
            cached ||
            fetch(request).then((response) => {
              const copy = response.clone()
              caches.open(CACHE).then((cache) => cache.put(request, copy))
              return response
            })
        )
      : fetch(request)
          .then((response) => {
            const copy = response.clone()
            caches.open(CACHE).then((cache) => cache.put(request, copy))
            return response
          })
          .catch(() => caches.match(request))
  )
})
