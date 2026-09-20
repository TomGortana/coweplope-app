import { useState } from 'react'
import { X, Plus, Trash2 } from 'lucide-react'
import { getWhatsAppGroupLink, setWhatsAppGroupLink } from '../lib/whatsapp'
import { useLockBodyScroll } from '../lib/useLockBodyScroll'
import Avatar from './Avatar'

const COLOR_PRESETS = ['#6366f1', '#ec4899', '#f59e0b', '#10b981', '#0ea5e9', '#ef4444']

export default function AdminModal({ onClose, onCreateWeekend, members, onAddMember, onDeleteMember }) {
  useLockBodyScroll()
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
      <div className="absolute inset-0 bg-black/60" onClick={onClose} />
      <div className="relative w-full bg-zinc-700 rounded-t-3xl p-5 pb-[calc(env(safe-area-inset-bottom)+1.5rem)] max-h-[85vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-zinc-100">Administration</h2>
          <button onClick={onClose} className="p-1 text-zinc-500 active:text-zinc-200">
            <X size={22} />
          </button>
        </div>

        <section className="mb-6">
          <h3 className="text-sm font-semibold text-zinc-300 mb-2">Nouvelle édition de week-end</h3>
          <div className="space-y-3">
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ex: Coweplope - Mai 2027"
              className="w-full px-4 py-3 rounded-xl bg-zinc-600 text-sm text-zinc-100 outline-none focus:ring-2 focus:ring-copper-500"
            />
            <div className="flex gap-3">
              <div className="flex-1">
                <label className="text-xs text-zinc-500 font-medium">Début</label>
                <input
                  type="date"
                  value={start}
                  onChange={(e) => setStart(e.target.value)}
                  className="w-full mt-1 px-3 py-3 rounded-xl bg-zinc-600 text-sm text-zinc-100 outline-none focus:ring-2 focus:ring-copper-500"
                />
              </div>
              <div className="flex-1">
                <label className="text-xs text-zinc-500 font-medium">Fin</label>
                <input
                  type="date"
                  value={end}
                  onChange={(e) => setEnd(e.target.value)}
                  className="w-full mt-1 px-3 py-3 rounded-xl bg-zinc-600 text-sm text-zinc-100 outline-none focus:ring-2 focus:ring-copper-500"
                />
              </div>
            </div>
            <button
              onClick={submit}
              disabled={!canSubmit || saving}
              className="w-full flex items-center justify-center gap-2 bg-copper-500 disabled:bg-zinc-500 text-zinc-950 font-semibold py-3.5 rounded-xl active:scale-[0.98] transition"
            >
              <Plus size={18} /> {saving ? 'Création…' : 'Créer l’édition'}
            </button>
          </div>
        </section>

        <section className="mb-6">
          <h3 className="text-sm font-semibold text-zinc-300 mb-2">Membres du groupe</h3>
          <MembersManager members={members} onAdd={onAddMember} onDelete={onDeleteMember} />
        </section>

        <section>
          <h3 className="text-sm font-semibold text-zinc-300 mb-2">Lien du groupe WhatsApp</h3>
          <div className="flex gap-2">
            <input
              value={waLink}
              onChange={(e) => setWaLink(e.target.value)}
              placeholder="https://chat.whatsapp.com/..."
              className="flex-1 px-4 py-3 rounded-xl bg-zinc-600 text-sm text-zinc-100 outline-none focus:ring-2 focus:ring-copper-500"
            />
            <button
              onClick={saveWhatsapp}
              className="px-4 py-3 rounded-xl bg-zinc-100 text-zinc-900 text-sm font-semibold active:scale-95 transition"
            >
              OK
            </button>
          </div>
          <p className="text-xs text-zinc-500 mt-1">Stocké sur cet appareil uniquement.</p>
        </section>
      </div>
    </div>
  )
}

function MembersManager({ members, onAdd, onDelete }) {
  const [name, setName] = useState('')
  const [color, setColor] = useState(COLOR_PRESETS[0])
  const [saving, setSaving] = useState(false)

  const canSubmit = name.trim()

  async function submit() {
    if (!canSubmit) return
    setSaving(true)
    try {
      await onAdd({ name: name.trim(), color })
      setName('')
    } finally {
      setSaving(false)
    }
  }

  function remove(m) {
    if (members.length <= 1) return
    if (window.confirm(`Supprimer ${m.name} du groupe ? Ses anciennes contributions resteront mais sans attribution.`)) {
      onDelete(m.id)
    }
  }

  return (
    <div className="space-y-3">
      <div className="space-y-1.5">
        {members.map((m) => (
          <div key={m.id} className="flex items-center gap-2 bg-zinc-600 rounded-xl px-3 py-2">
            <Avatar member={m} />
            <span className="flex-1 text-sm font-medium text-zinc-300 truncate">{m.name}</span>
            <button
              onClick={() => remove(m)}
              disabled={members.length <= 1}
              className="text-zinc-500 active:text-rose-500 p-1 disabled:opacity-30"
            >
              <Trash2 size={16} />
            </button>
          </div>
        ))}
      </div>

      <div className="flex gap-2">
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && submit()}
          placeholder="Nom du nouveau membre"
          className="flex-1 px-4 py-3 rounded-xl bg-zinc-600 text-sm text-zinc-100 outline-none focus:ring-2 focus:ring-copper-500"
        />
      </div>
      <div className="flex items-center gap-2">
        {COLOR_PRESETS.map((c) => (
          <button
            key={c}
            onClick={() => setColor(c)}
            style={{ backgroundColor: c }}
            className={`w-7 h-7 rounded-full shrink-0 ${color === c ? 'ring-2 ring-offset-2 ring-offset-zinc-700 ring-zinc-300' : ''}`}
            aria-label={c}
          />
        ))}
        <button
          onClick={submit}
          disabled={!canSubmit || saving}
          className="ml-auto flex items-center gap-1 px-4 py-2 rounded-xl bg-copper-500 disabled:bg-zinc-500 text-zinc-950 text-sm font-semibold active:scale-95 transition"
        >
          <Plus size={16} /> {saving ? 'Ajout…' : 'Ajouter'}
        </button>
      </div>
    </div>
  )
}
