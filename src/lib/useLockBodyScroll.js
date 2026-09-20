import { useEffect } from 'react'

// Bloque le scroll de la page derrière pendant qu'une fenêtre modale
// (bottom sheet) est ouverte, pour que la molette/le geste de scroll
// aille bien à la fenêtre elle-même plutôt qu'à la page.
// Le scroll racine se fait sur <html> (document.documentElement), pas
// sur <body> — verrouiller seulement body ne suffit pas.
export function useLockBodyScroll() {
  useEffect(() => {
    const html = document.documentElement
    const body = document.body
    const originalHtmlOverflow = html.style.overflow
    const originalBodyOverflow = body.style.overflow
    html.style.overflow = 'hidden'
    body.style.overflow = 'hidden'
    return () => {
      html.style.overflow = originalHtmlOverflow
      body.style.overflow = originalBodyOverflow
    }
  }, [])
}
