import { useRef, useState } from 'react'
import { Plus, Camera } from 'lucide-react'
import Avatar from './Avatar'

const COLOR_PRESETS = ['#6366f1', '#ec4899', '#f59e0b', '#10b981', '#0ea5e9', '#ef4444']

export default function ProfileGate({ members, onSelect, onAddMember }) {
  const [showAdd, setShowAdd] = useState(false)

  return (
    <div className="fixed inset-0 z-50 bg-zinc-800 overflow-y-auto">
      <div className="min-h-full flex flex-col items-center justify-center px-6 py-6">
        <div className="w-full max-w-sm">
          <img src="/logo.png" alt="Coweplope" className="w-56 h-56 mx-auto mb-3" />
          <h1 className="text-lg font-bold text-zinc-100 text-center mb-1">Coweplope Organizer</h1>
          <p className="text-sm text-zinc-500 text-center mb-4">Quel coweplopeur es-tu ?</p>

          {members.length > 0 && (
            <div className="grid grid-cols-3 gap-2 mb-4">
              {members.map((m) => (
                <button
                  key={m.id}
                  onClick={() => onSelect(m.id)}
                  className="flex flex-col items-center gap-1.5 bg-zinc-700 border border-zinc-600 rounded-2xl py-3 px-1 active:bg-zinc-600 transition"
                >
                  <Avatar member={m} size="lg" />
                  <span className="text-xs font-semibold text-zinc-200 truncate w-full text-center">{m.name}</span>
                </button>
              ))}
            </div>
          )}

          {showAdd ? (
            <AddMemberForm onAdd={onAddMember} onCancel={() => setShowAdd(false)} />
          ) : (
            <button
              onClick={() => setShowAdd(true)}
              className="w-full flex items-center justify-center gap-2 border border-dashed border-zinc-500 text-zinc-400 rounded-2xl py-3.5 active:bg-zinc-700 transition"
            >
              <Plus size={18} /> Je suis nouveau
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

function AddMemberForm({ onAdd, onCancel }) {
  const [name, setName] = useState('')
  const [color, setColor] = useState(COLOR_PRESETS[0])
  const [photoFile, setPhotoFile] = useState(null)
  const [photoPreview, setPhotoPreview] = useState(null)
  const [saving, setSaving] = useState(false)
  const fileInputRef = useRef(null)

  const canSubmit = name.trim()

  function handlePhotoChange(e) {
    const file = e.target.files?.[0]
    if (!file) return
    setPhotoFile(file)
    setPhotoPreview(URL.createObjectURL(file))
  }

  async function submit() {
    if (!canSubmit) return
    setSaving(true)
    try {
      await onAdd({ name: name.trim(), color, photoFile })
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="bg-zinc-700 border border-zinc-600 rounded-2xl p-4 space-y-3">
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="w-16 h-16 rounded-full bg-zinc-600 border border-dashed border-zinc-500 flex items-center justify-center overflow-hidden shrink-0"
          aria-label="Choisir une photo"
        >
          {photoPreview ? (
            <img src={photoPreview} alt="" className="w-full h-full object-cover" />
          ) : (
            <Camera size={20} className="text-zinc-500" />
          )}
        </button>
        <input ref={fileInputRef} type="file" accept="image/*" onChange={handlePhotoChange} className="hidden" />
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && submit()}
          placeholder="Ton prénom"
          autoFocus
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
      </div>
      <div className="flex gap-2">
        <button onClick={onCancel} className="flex-1 py-3 rounded-xl text-zinc-400 text-sm font-semibold active:bg-zinc-600">
          Annuler
        </button>
        <button
          onClick={submit}
          disabled={!canSubmit || saving}
          className="flex-1 bg-copper-500 disabled:bg-zinc-500 text-zinc-950 font-semibold py-3 rounded-xl active:scale-[0.98] transition"
        >
          {saving ? 'Ajout…' : 'Continuer'}
        </button>
      </div>
    </div>
  )
}
