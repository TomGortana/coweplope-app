// Lien du groupe WhatsApp — configurable depuis l'app (bouton Admin),
// stocké en localStorage pour persister sur cet appareil.
const KEY = 'coweplope_whatsapp_link'
const DEFAULT_LINK = 'https://chat.whatsapp.com/REMPLACE_MOI'

export function getWhatsAppGroupLink() {
  return localStorage.getItem(KEY) || DEFAULT_LINK
}

export function setWhatsAppGroupLink(url) {
  localStorage.setItem(KEY, url)
}

// Construit un lien wa.me pré-rempli avec un texte (utilisé pour le
// bouton "Notifier le groupe" après une action importante).
export function buildNotifyLink(text) {
  return `https://wa.me/?text=${encodeURIComponent(text)}`
}
