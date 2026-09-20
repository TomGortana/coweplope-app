import { MessageCircle, X } from 'lucide-react'

// Toast en bas d'écran avec un bouton optionnel "Notifier le groupe"
// (lien wa.me pré-rempli), au-dessus de la bottom nav.
export default function Toast({ toast, onClose }) {
  if (!toast) return null
  return (
    <div className="fixed left-3 right-3 bottom-20 z-50 animate-[fadeIn_0.15s_ease-out]">
      <div className="bg-slate-900 text-white rounded-2xl shadow-xl px-4 py-3 flex items-center gap-3">
        <p className="text-sm flex-1 leading-snug">{toast.message}</p>
        {toast.notifyText && (
          <a
            href={toast.whatsappLink}
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-1 bg-emerald-500 text-white text-xs font-semibold px-3 py-2 rounded-xl whitespace-nowrap active:scale-95 transition"
          >
            <MessageCircle size={14} /> Notifier
          </a>
        )}
        <button onClick={onClose} className="text-slate-400 active:text-white p-1">
          <X size={16} />
        </button>
      </div>
    </div>
  )
}
