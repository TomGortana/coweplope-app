import { useState } from 'react'
import { ExternalLink, Settings2 } from 'lucide-react'

export default function Widgets({ tricountLink, onSetTricountLink }) {
  return (
    <div className="px-4 pt-4 pb-6 space-y-6">
      <h1 className="text-lg font-bold text-slate-900">Dépenses</h1>
      <TricountWidget link={tricountLink} onSetLink={onSetTricountLink} />
    </div>
  )
}

function TricountWidget({ link, onSetLink }) {
  const [editing, setEditing] = useState(false)
  const [url, setUrl] = useState(link?.url || '')

  return (
    <section>
      <div className="flex items-center justify-between mb-2">
        <h2 className="text-sm font-bold text-slate-700 uppercase tracking-wide">Tricount</h2>
        <button onClick={() => setEditing((e) => !e)} className="text-slate-400 active:text-slate-700 p-1">
          <Settings2 size={16} />
        </button>
      </div>

      {editing && (
        <div className="flex gap-2 mb-3">
          <input
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://tricount.com/..."
            className="flex-1 px-3 py-2.5 rounded-xl bg-slate-100 text-sm outline-none focus:ring-2 focus:ring-indigo-500"
          />
          <button
            onClick={() => {
              onSetLink(url.trim())
              setEditing(false)
            }}
            className="px-4 py-2.5 rounded-xl bg-slate-900 text-white text-sm font-semibold active:scale-95"
          >
            OK
          </button>
        </div>
      )}

      {link?.url ? (
        <a
          href={link.url}
          target="_blank"
          rel="noreferrer"
          className="flex items-center justify-center gap-2 w-full bg-emerald-500 text-white font-semibold py-3.5 rounded-2xl active:scale-[0.98] transition"
        >
          <ExternalLink size={18} /> Ouvrir Tricount / Saisir une dépense
        </a>
      ) : (
        <p className="text-sm text-slate-400 text-center py-3">Aucun lien Tricount configuré pour ce week-end.</p>
      )}
    </section>
  )
}
