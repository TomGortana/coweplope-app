import { useEffect } from 'react'

// Bloque le scroll de la page derrière pendant qu'une fenêtre modale
// (bottom sheet) est ouverte, pour que la molette/le geste de scroll
// aille bien à la fenêtre elle-même plutôt qu'à la page.
export function useLockBodyScroll() {
  useEffect(() => {
    const original = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = original
    }
  }, [])
}
