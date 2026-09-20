import { useState } from 'react'
import { Plus } from 'lucide-react'
import Avatar from './Avatar'

const COLOR_PRESETS = ['#6366f1', '#ec4899', '#f59e0b', '#10b981', '#0ea5e9', '#ef4444']

export default function ProfileGate({ members, onSelect, onAddMember }) {
  const [showAdd, setShowAdd] = useState(false)

  return (
    <div className="fixed inset-0 z-50 bg-zinc-900 flex flex-col items-center justify-center px-6">
      <div className="w-full max-w-sm">
        <img src="/logo.png" alt="Coweplope" className="w-40 h-40 mx-auto mb-4" />
        <h1 className="text-xl font-bold text-zinc-100 text-center mb-1">Coweplope Organizer</h1>
        <p className="text-sm text-zinc-500 text-center mb-6">Qui es-tu ?</p>

        {members.length > 0 && (
          <div className="grid grid-cols-2 gap-3 mb-4">
            {members.map((m) => (
              <button
                key={m.id}
                onClick={() => onSelect(m.id)}
                className="flex flex-col items-center gap-2 bg-zinc-800 border border-zinc-700 rounded-2xl py-5 active:bg-zinc-700 transition"
              >
                <Avatar member={m} size="xl" />
                <span className="text-sm font-semibold text-zinc-200">{m.name}</span>
              </button>
            ))}
          </div>
        )}

        {showAdd ? (
          <AddMemberForm onAdd={onAddMember} onCancel={() => setShowAdd(false)} />
        ) : (
          <button
            onClick={() => setShowAdd(true)}
            className="w-full flex items-center justify-center gap-2 border border-dashed border-zinc-600 text-zinc-400 rounded-2xl py-4 active:bg-zinc-800 transition"
          >
            <Plus size={18} /> Je suis nouveau
          </button>
        )}
      </div>
    </div>
  )
}

function AddMemberForm({ onAdd, onCancel }) {
  const [name, setName] = useState('')
  const [color, setColor] = useState(COLOR_PRESETS[0])
  const [saving, setSaving] = useState(false)

  const canSubmit = name.trim()

  async function submit() {
    if (!canSubmit) return
    setSaving(true)
    try {
      await onAdd({ name: name.trim(), color })
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="bg-zinc-800 border border-zinc-700 rounded-2xl p-4 space-y-3">
      <input
        value={name}
        onChange={(e) => setName(e.target.value)}
        onKeyDown={(e) => e.key === 'Enter' && submit()}
        placeholder="Ton prénom"
        autoFocus
        className="w-full px-4 py-3 rounded-xl bg-zinc-700 text-sm text-zinc-100 outline-none focus:ring-2 focus:ring-amber-500"
      />
      <div className="flex items-center gap-2">
        {COLOR_PRESETS.map((c) => (
          <button
            key={c}
            onClick={() => setColor(c)}
            style={{ backgroundColor: c }}
            className={`w-7 h-7 rounded-full shrink-0 ${color === c ? 'ring-2 ring-offset-2 ring-offset-zinc-800 ring-zinc-300' : ''}`}
            aria-label={c}
          />
        ))}
      </div>
      <div className="flex gap-2">
        <button onClick={onCancel} className="flex-1 py-3 rounded-xl text-zinc-400 text-sm font-semibold active:bg-zinc-700">
          Annuler
        </button>
        <button
          onClick={submit}
          disabled={!canSubmit || saving}
          className="flex-1 bg-amber-500 disabled:bg-zinc-600 text-zinc-950 font-semibold py-3 rounded-xl active:scale-[0.98] transition"
        >
          {saving ? 'Ajout…' : 'Continuer'}
        </button>
      </div>
    </div>
  )
}
