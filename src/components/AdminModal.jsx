import { useState } from 'react'
import { X, Plus } from 'lucide-react'
import { getWhatsAppGroupLink, setWhatsAppGroupLink } from '../lib/whatsapp'

export default function AdminModal({ onClose, onCreateWeekend }) {
  const [name, setName] = useState('')
  const [start, setStart] = useState('')
  const [end, setEnd] = useState('')
  const [waLink, setWaLink] = useState(getWhatsAppGroupLink())
  const [saving, setSaving] = useState(false)

  const canSubmit = name.trim() && start && end

  async function submit() {
    if (!canSubmit) return
    setSaving(true)
    try {
      await onCreateWeekend({ name: name.trim(), start_date: start, end_date: end })
      onClose()
    } finally {
      setSaving(false)
    }
  }

  function saveWhatsapp() {
    setWhatsAppGroupLink(waLink.trim())
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative w-full bg-white rounded-t-3xl p-5 pb-[calc(env(safe-area-inset-bottom)+1.5rem)] max-h-[85vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-slate-900">Administration</h2>
          <button onClick={onClose} className="p-1 text-slate-400 active:text-slate-700">
            <X size={22} />
          </button>
        </div>

        <section className="mb-6">
          <h3 className="text-sm font-semibold text-slate-700 mb-2">Nouvelle édition de week-end</h3>
          <div className="space-y-3">
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ex: Coweplope - Mai 2027"
              className="w-full px-4 py-3 rounded-xl bg-slate-100 text-sm outline-none focus:ring-2 focus:ring-indigo-500"
            />
            <div className="flex gap-3">
              <div className="flex-1">
                <label className="text-xs text-slate-400 font-medium">Début</label>
                <input
                  type="date"
                  value={start}
                  onChange={(e) => setStart(e.target.value)}
                  className="w-full mt-1 px-3 py-3 rounded-xl bg-slate-100 text-sm outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <div className="flex-1">
                <label className="text-xs text-slate-400 font-medium">Fin</label>
                <input
                  type="date"
                  value={end}
                  onChange={(e) => setEnd(e.target.value)}
                  className="w-full mt-1 px-3 py-3 rounded-xl bg-slate-100 text-sm outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>
            <button
              onClick={submit}
              disabled={!canSubmit || saving}
              className="w-full flex items-center justify-center gap-2 bg-indigo-600 disabled:bg-slate-300 text-white font-semibold py-3.5 rounded-xl active:scale-[0.98] transition"
            >
              <Plus size={18} /> {saving ? 'Création…' : 'Créer l’édition'}
            </button>
          </div>
        </section>

        <section>
          <h3 className="text-sm font-semibold text-slate-700 mb-2">Lien du groupe WhatsApp</h3>
          <div className="flex gap-2">
            <input
              value={waLink}
              onChange={(e) => setWaLink(e.target.value)}
              placeholder="https://chat.whatsapp.com/..."
              className="flex-1 px-4 py-3 rounded-xl bg-slate-100 text-sm outline-none focus:ring-2 focus:ring-indigo-500"
            />
            <button
              onClick={saveWhatsapp}
              className="px-4 py-3 rounded-xl bg-slate-900 text-white text-sm font-semibold active:scale-95 transition"
            >
              OK
            </button>
          </div>
          <p className="text-xs text-slate-400 mt-1">Stocké sur cet appareil uniquement.</p>
        </section>
      </div>
    </div>
  )
}
