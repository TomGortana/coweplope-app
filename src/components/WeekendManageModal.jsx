import { useState } from 'react'
import { X } from 'lucide-react'

export default function WeekendManageModal({ weekend, members, absentMemberIds, onClose, onSave }) {
  const [name, setName] = useState(weekend.name)
  const [start, setStart] = useState(weekend.start_date)
  const [end, setEnd] = useState(weekend.end_date)
  const [absent, setAbsent] = useState(new Set(absentMemberIds))
  const [saving, setSaving] = useState(false)

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

  return (
    <div className="fixed inset-0 z-50 flex items-end">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative w-full bg-white rounded-t-3xl p-5 pb-[calc(env(safe-area-inset-bottom)+1.5rem)] max-h-[85vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-slate-900">Modifier l'édition</h2>
          <button onClick={onClose} className="p-1 text-slate-400 active:text-slate-700">
            <X size={22} />
          </button>
        </div>
        <div className="space-y-3">
          <div>
            <label className="text-xs text-slate-400 font-medium">Nom</label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full mt-1 px-4 py-3 rounded-xl bg-slate-100 text-sm outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
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

          <div>
            <label className="text-xs text-slate-400 font-medium">Qui est présent sur cette édition ?</label>
            <div className="grid grid-cols-2 gap-2 mt-1.5">
              {members.map((m) => {
                const isAbsent = absent.has(m.id)
                return (
                  <button
                    key={m.id}
                    onClick={() => toggle(m.id)}
                    className={`flex items-center gap-2 px-3 py-2.5 rounded-xl border text-sm font-medium text-left ${
                      isAbsent ? 'border-slate-200 text-slate-400 bg-slate-50' : 'border-emerald-300 bg-emerald-50 text-emerald-700'
                    }`}
                  >
                    <span>{m.avatar_emoji}</span>
                    <span className="truncate flex-1">{m.name}</span>
                    <span className="text-[10px] font-semibold shrink-0">{isAbsent ? 'Absent' : 'Présent'}</span>
                  </button>
                )
              })}
            </div>
          </div>

          <button
            onClick={submit}
            disabled={!canSubmit || saving}
            className="w-full bg-indigo-600 disabled:bg-slate-300 text-white font-semibold py-3.5 rounded-xl active:scale-[0.98] transition"
          >
            {saving ? 'Enregistrement…' : 'Enregistrer'}
          </button>
        </div>
      </div>
    </div>
  )
}
