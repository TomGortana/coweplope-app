import { useState } from 'react'
import { Plus, Trash2, X } from 'lucide-react'

const DAYS = [
  { key: 'ven', label: 'Vendredi' },
  { key: 'sam', label: 'Samedi' },
  { key: 'dim', label: 'Dimanche' },
]

export default function Agenda({ events, membersById, onAdd, onDelete, isArchived }) {
  const [formDay, setFormDay] = useState(null)

  return (
    <div className="px-4 pt-4 pb-6 space-y-5">
      <h1 className="text-lg font-bold text-slate-900">Agenda</h1>

      {DAYS.map(({ key, label }) => {
        const dayEvents = events
          .filter((e) => e.day === key)
          .sort((a, b) => (a.start_time || '').localeCompare(b.start_time || ''))

        return (
          <div key={key}>
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-sm font-bold text-slate-700 uppercase tracking-wide">{label}</h2>
              {!isArchived && (
                <button
                  onClick={() => setFormDay(key)}
                  className="flex items-center gap-1 text-xs font-semibold text-indigo-600 active:opacity-70"
                >
                  <Plus size={14} /> Ajouter
                </button>
              )}
            </div>

            {dayEvents.length === 0 ? (
              <p className="text-sm text-slate-300 pl-1">Rien de prévu</p>
            ) : (
              <div className="relative pl-4 border-l-2 border-slate-100 space-y-3">
                {dayEvents.map((e) => {
                  const resp = membersById[e.responsible_id]
                  return (
                    <div key={e.id} className="relative">
                      <span className="absolute -left-[21px] top-1 w-2.5 h-2.5 rounded-full bg-indigo-500" />
                      <div className="bg-white border border-slate-200 rounded-xl p-3 flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <p className="text-xs font-semibold text-indigo-600">
                            {e.start_time?.slice(0, 5)}
                            {e.end_time ? ` – ${e.end_time.slice(0, 5)}` : ''}
                          </p>
                          <p className="text-sm font-medium text-slate-800 truncate">{e.title}</p>
                          {resp && (
                            <p className="text-xs text-slate-400 mt-0.5">
                              {resp.avatar_emoji} {resp.name}
                            </p>
                          )}
                        </div>
                        {!isArchived && (
                          <button onClick={() => onDelete(e.id)} className="text-slate-300 active:text-rose-500 p-1 shrink-0">
                            <Trash2 size={16} />
                          </button>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        )
      })}

      {formDay && (
        <EventForm
          day={formDay}
          membersById={membersById}
          onClose={() => setFormDay(null)}
          onSubmit={(data) => onAdd({ ...data, day: formDay })}
        />
      )}
    </div>
  )
}

function EventForm({ day, membersById, onClose, onSubmit }) {
  const [title, setTitle] = useState('')
  const [start, setStart] = useState('')
  const [end, setEnd] = useState('')
  const [responsible, setResponsible] = useState('')
  const [saving, setSaving] = useState(false)
  const members = Object.values(membersById)

  const canSubmit = title.trim()

  async function submit() {
    if (!canSubmit) return
    setSaving(true)
    try {
      await onSubmit({ title: title.trim(), start_time: start || null, end_time: end || null, responsible_id: responsible || null })
      onClose()
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative w-full bg-white rounded-t-3xl p-5 pb-[calc(env(safe-area-inset-bottom)+1.5rem)]">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-slate-900">Nouvelle activité</h2>
          <button onClick={onClose} className="p-1 text-slate-400 active:text-slate-700">
            <X size={22} />
          </button>
        </div>
        <div className="space-y-3">
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Ex: Randonnée"
            className="w-full px-4 py-3 rounded-xl bg-slate-100 text-sm outline-none focus:ring-2 focus:ring-indigo-500"
          />
          <div className="flex gap-3">
            <div className="flex-1">
              <label className="text-xs text-slate-400 font-medium">Début</label>
              <input
                type="time"
                value={start}
                onChange={(e) => setStart(e.target.value)}
                className="w-full mt-1 px-3 py-3 rounded-xl bg-slate-100 text-sm outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div className="flex-1">
              <label className="text-xs text-slate-400 font-medium">Fin</label>
              <input
                type="time"
                value={end}
                onChange={(e) => setEnd(e.target.value)}
                className="w-full mt-1 px-3 py-3 rounded-xl bg-slate-100 text-sm outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>
          <div>
            <label className="text-xs text-slate-400 font-medium">Responsable</label>
            <div className="flex gap-2 mt-1 flex-wrap">
              {members.map((m) => (
                <button
                  key={m.id}
                  onClick={() => setResponsible(responsible === m.id ? '' : m.id)}
                  className={`px-3 py-2 rounded-xl text-sm font-medium border ${
                    responsible === m.id ? 'bg-indigo-50 border-indigo-300 text-indigo-700' : 'border-slate-200 text-slate-500'
                  }`}
                >
                  {m.avatar_emoji} {m.name}
                </button>
              ))}
            </div>
          </div>
          <button
            onClick={submit}
            disabled={!canSubmit || saving}
            className="w-full bg-indigo-600 disabled:bg-slate-300 text-white font-semibold py-3.5 rounded-xl active:scale-[0.98] transition"
          >
            {saving ? 'Ajout…' : 'Ajouter à ' + { ven: 'vendredi', sam: 'samedi', dim: 'dimanche' }[day]}
          </button>
        </div>
      </div>
    </div>
  )
}
