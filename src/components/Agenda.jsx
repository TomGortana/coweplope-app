import { useState } from 'react'
import { Plus, Trash2, X } from 'lucide-react'
import { useLockBodyScroll } from '../lib/useLockBodyScroll'
import Avatar from './Avatar'

function buildDays(weekend) {
  if (!weekend?.start_date || !weekend?.end_date) return []
  const days = []
  const cur = new Date(weekend.start_date + 'T00:00:00')
  const end = new Date(weekend.end_date + 'T00:00:00')
  while (cur <= end) {
    const iso = cur.toISOString().slice(0, 10)
    const weekday = cur.toLocaleDateString('fr-FR', { weekday: 'long' })
    const shortDate = cur.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' })
    days.push({ key: iso, label: weekday.charAt(0).toUpperCase() + weekday.slice(1), shortDate })
    cur.setDate(cur.getDate() + 1)
  }
  return days
}

export default function Agenda({ weekend, events, membersById, onAdd, onDelete, isArchived }) {
  const [formDay, setFormDay] = useState(null)
  const days = buildDays(weekend)

  return (
    <div className="px-4 pt-4 pb-6 space-y-5">
      <h1 className="text-lg font-bold text-zinc-100">Agenda</h1>

      {days.map(({ key, label, shortDate }) => {
        const dayEvents = events
          .filter((e) => e.day === key)
          .sort((a, b) => (a.start_time || '').localeCompare(b.start_time || ''))

        return (
          <div key={key}>
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-sm font-bold text-zinc-300 uppercase tracking-wide">
                {label} <span className="text-zinc-500 font-medium normal-case">· {shortDate}</span>
              </h2>
              {!isArchived && (
                <button
                  onClick={() => setFormDay(key)}
                  className="flex items-center gap-1 text-xs font-semibold text-amber-400 active:opacity-70"
                >
                  <Plus size={14} /> Ajouter
                </button>
              )}
            </div>

            {dayEvents.length === 0 ? (
              <p className="text-sm text-zinc-600 pl-1">Rien de prévu</p>
            ) : (
              <div className="relative pl-4 border-l-2 border-zinc-700 space-y-3">
                {dayEvents.map((e) => {
                  const resp = membersById[e.responsible_id]
                  return (
                    <div key={e.id} className="relative">
                      <span className="absolute -left-[21px] top-1 w-2.5 h-2.5 rounded-full bg-amber-500" />
                      <div className="bg-zinc-800 border border-zinc-700 rounded-xl p-3 flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <p className="text-xs font-semibold text-amber-400">
                            {e.start_time?.slice(0, 5)}
                            {e.end_time ? ` – ${e.end_time.slice(0, 5)}` : ''}
                          </p>
                          <p className="text-sm font-medium text-zinc-200 truncate">{e.title}</p>
                          {resp && (
                            <p className="text-xs text-zinc-500 mt-0.5 flex items-center gap-1">
                              <Avatar member={resp} size="sm" /> {resp.name}
                            </p>
                          )}
                        </div>
                        {!isArchived && (
                          <button onClick={() => onDelete(e.id)} className="text-zinc-600 active:text-rose-500 p-1 shrink-0">
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
          dayLabel={days.find((d) => d.key === formDay)?.label}
          membersById={membersById}
          onClose={() => setFormDay(null)}
          onSubmit={(data) => onAdd({ ...data, day: formDay })}
        />
      )}
    </div>
  )
}

function EventForm({ dayLabel, membersById, onClose, onSubmit }) {
  useLockBodyScroll()
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
      <div className="absolute inset-0 bg-black/60" onClick={onClose} />
      <div className="relative w-full bg-zinc-800 rounded-t-3xl p-5 pb-[calc(env(safe-area-inset-bottom)+1.5rem)]">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-zinc-100">Nouvelle activité</h2>
          <button onClick={onClose} className="p-1 text-zinc-500 active:text-zinc-200">
            <X size={22} />
          </button>
        </div>
        <div className="space-y-3">
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Ex: Randonnée"
            className="w-full px-4 py-3 rounded-xl bg-zinc-700 text-sm text-zinc-100 outline-none focus:ring-2 focus:ring-amber-500"
          />
          <div className="flex gap-3">
            <div className="flex-1">
              <label className="text-xs text-zinc-500 font-medium">Début</label>
              <input
                type="time"
                value={start}
                onChange={(e) => setStart(e.target.value)}
                className="w-full mt-1 px-3 py-3 rounded-xl bg-zinc-700 text-sm text-zinc-100 outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>
            <div className="flex-1">
              <label className="text-xs text-zinc-500 font-medium">Fin</label>
              <input
                type="time"
                value={end}
                onChange={(e) => setEnd(e.target.value)}
                className="w-full mt-1 px-3 py-3 rounded-xl bg-zinc-700 text-sm text-zinc-100 outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>
          </div>
          <div>
            <label className="text-xs text-zinc-500 font-medium">Responsable</label>
            <div className="flex gap-2 mt-1 flex-wrap">
              {members.map((m) => (
                <button
                  key={m.id}
                  onClick={() => setResponsible(responsible === m.id ? '' : m.id)}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-medium border ${
                    responsible === m.id ? 'bg-amber-500/10 border-amber-700 text-amber-300' : 'border-zinc-600 text-zinc-400'
                  }`}
                >
                  <Avatar member={m} size="sm" /> {m.name}
                </button>
              ))}
            </div>
          </div>
          <button
            onClick={submit}
            disabled={!canSubmit || saving}
            className="w-full bg-amber-500 disabled:bg-zinc-600 text-zinc-950 font-semibold py-3.5 rounded-xl active:scale-[0.98] transition"
          >
            {saving ? 'Ajout…' : `Ajouter à ${dayLabel || ''}`}
          </button>
        </div>
      </div>
    </div>
  )
}
