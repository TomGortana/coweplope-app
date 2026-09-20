import { useState } from 'react'
import { X } from 'lucide-react'
import { useLockBodyScroll } from '../lib/useLockBodyScroll'
import Avatar from './Avatar'

export default function WeekendManageModal({ weekend, members, absentMemberIds, onClose, onSave, onDelete }) {
  useLockBodyScroll()
  const [name, setName] = useState(weekend.name)
  const [start, setStart] = useState(weekend.start_date)
  const [end, setEnd] = useState(weekend.end_date)
  const [absent, setAbsent] = useState(new Set(absentMemberIds))
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)

  const canSubmit = name.trim() && start && end

  function toggle(id) {
    setAbsent((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  async function submit() {
    if (!canSubmit) return
    setSaving(true)
    try {
      await onSave(weekend.id, { name: name.trim(), start_date: start, end_date: end, absentMemberIds: [...absent] })
      onClose()
    } finally {
      setSaving(false)
    }
  }

  async function remove() {
    if (
      !window.confirm(
        `Supprimer définitivement "${weekend.name}" ? Les logements, l'agenda, les courses, les parties de poker et le lien Tricount de cette édition seront perdus. Cette action est irréversible.`
      )
    ) {
      return
    }
    setDeleting(true)
    try {
      await onDelete(weekend.id)
      onClose()
    } finally {
      setDeleting(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end">
      <div className="absolute inset-0 bg-black/60" onClick={onClose} />
      <div className="relative w-full bg-zinc-700 rounded-t-3xl p-5 pb-[calc(env(safe-area-inset-bottom)+1.5rem)] max-h-[85vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-zinc-100">Modifier l'édition</h2>
          <button onClick={onClose} className="p-1 text-zinc-500 active:text-zinc-200">
            <X size={22} />
          </button>
        </div>
        <div className="space-y-3">
          <div>
            <label className="text-xs text-zinc-500 font-medium">Nom</label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full mt-1 px-4 py-3 rounded-xl bg-zinc-600 text-sm text-zinc-100 outline-none focus:ring-2 focus:ring-copper-500"
            />
          </div>
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

          <div>
            <label className="text-xs text-zinc-500 font-medium">Qui est présent sur cette édition ?</label>
            <div className="grid grid-cols-2 gap-2 mt-1.5">
              {members.map((m) => {
                const isAbsent = absent.has(m.id)
                return (
                  <button
                    key={m.id}
                    onClick={() => toggle(m.id)}
                    className={`flex items-center gap-2 px-3 py-2.5 rounded-xl border text-sm font-medium text-left ${
                      isAbsent ? 'border-zinc-500 text-zinc-500 bg-zinc-600' : 'border-emerald-700 bg-emerald-500/10 text-emerald-300'
                    }`}
                  >
                    <Avatar member={m} size="sm" />
                    <span className="truncate flex-1">{m.name}</span>
                    <span className="text-[10px] font-semibold shrink-0">{isAbsent ? 'Absent' : 'Présent'}</span>
                  </button>
                )
              })}
            </div>
          </div>

          <div className="flex gap-3">
            <button
              onClick={remove}
              disabled={deleting}
              className="flex-1 bg-rose-600 disabled:bg-zinc-500 text-white font-semibold py-3.5 rounded-xl active:scale-[0.98] transition"
            >
              {deleting ? 'Suppression…' : 'Supprimer'}
            </button>
            <button
              onClick={submit}
              disabled={!canSubmit || saving}
              className="flex-1 bg-copper-500 disabled:bg-zinc-500 text-zinc-950 font-semibold py-3.5 rounded-xl active:scale-[0.98] transition"
            >
              {saving ? 'Enregistrement…' : 'Enregistrer'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
