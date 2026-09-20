import { useState } from 'react'
import { Plus, Trash2, X, Pencil } from 'lucide-react'
import { useLockBodyScroll } from '../lib/useLockBodyScroll'
import Avatar from './Avatar'

// cur.toISOString() convertit en UTC : pour un fuseau en avance sur UTC
// (ex: France), minuit local peut retomber sur la veille en UTC, ce qui
// décale la date d'un jour. On reconstruit l'ISO depuis les composants
// locaux pour éviter ce décalage.
function toLocalISODate(d) {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

function buildDays(weekend) {
  if (!weekend?.start_date || !weekend?.end_date) return []
  const days = []
  const cur = new Date(weekend.start_date + 'T00:00:00')
  const end = new Date(weekend.end_date + 'T00:00:00')
  while (cur <= end) {
    const iso = toLocalISODate(cur)
    const weekday = cur.toLocaleDateString('fr-FR', { weekday: 'long' })
    const shortDate = cur.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' })
    days.push({ key: iso, label: weekday.charAt(0).toUpperCase() + weekday.slice(1), shortDate })
    cur.setDate(cur.getDate() + 1)
  }
  return days
}

export default function Agenda({ weekend, events, membersById, onAdd, onEdit, onDelete, isArchived }) {
  const [formDay, setFormDay] = useState(null)
  const [editingEvent, setEditingEvent] = useState(null)
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
                  className="flex items-center gap-1 text-xs font-semibold text-copper-400 active:opacity-70"
                >
                  <Plus size={14} /> Ajouter
                </button>
              )}
            </div>

            {dayEvents.length === 0 ? (
              <p className="text-sm text-zinc-600 pl-1">Rien de prévu</p>
            ) : (
              <div className="relative pl-4 border-l-2 border-zinc-600 space-y-3">
                {dayEvents.map((e) => {
                  const resp = membersById[e.responsible_id]
                  return (
                    <div key={e.id} className="relative">
                      <span className="absolute -left-[21px] top-1 w-2.5 h-2.5 rounded-full bg-copper-500" />
                      <div className="bg-zinc-700 border border-zinc-600 rounded-xl p-3 flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <p className="text-xs font-semibold text-copper-400">
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
                          <div className="flex items-center gap-1 shrink-0">
                            <button onClick={() => setEditingEvent(e)} className="text-zinc-600 active:text-copper-400 p-1">
                              <Pencil size={16} />
                            </button>
                            <button onClick={() => onDelete(e.id)} className="text-zinc-600 active:text-rose-500 p-1">
                              <Trash2 size={16} />
                            </button>
                          </div>
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
          days={days}
          initialDay={formDay}
          membersById={membersById}
          onClose={() => setFormDay(null)}
          onSubmit={onAdd}
        />
      )}

      {editingEvent && (
        <EventForm
          event={editingEvent}
          days={days}
          initialDay={editingEvent.day}
          membersById={membersById}
          onClose={() => setEditingEvent(null)}
          onSubmit={(data) => onEdit(editingEvent.id, data)}
        />
      )}
    </div>
  )
}

function EventForm({ event, days, initialDay, membersById, onClose, onSubmit }) {
  useLockBodyScroll()
  const isEditing = Boolean(event)
  const [title, setTitle] = useState(event?.title || '')
  const [selectedDays, setSelectedDays] = useState(() => new Set([event?.day || initialDay]))
  const [start, setStart] = useState(event?.start_time?.slice(0, 5) || '')
  const [end, setEnd] = useState(event?.end_time?.slice(0, 5) || '')
  const [responsible, setResponsible] = useState(event?.responsible_id || '')
  const [saving, setSaving] = useState(false)
  const members = Object.values(membersById)

  const canSubmit = title.trim() && selectedDays.size > 0

  function toggleDay(key) {
    setSelectedDays((prev) => {
      const next = new Set(prev)
      if (next.has(key)) next.delete(key)
      else next.add(key)
      return next
    })
  }

  async function submit() {
    if (!canSubmit) return
    setSaving(true)
    try {
      // trié chronologiquement (les clés sont des dates ISO, donc l'ordre
      // alphabétique = l'ordre chronologique)
      const sortedDays = [...selectedDays].sort()
      await onSubmit({
        title: title.trim(),
        days: sortedDays,
        start_time: start || null,
        end_time: end || null,
        responsible_id: responsible || null,
      })
      onClose()
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end">
      <div className="absolute inset-0 bg-black/60" onClick={onClose} />
      <div className="relative w-full bg-zinc-700 rounded-t-3xl p-5 pb-[calc(env(safe-area-inset-bottom)+1.5rem)]">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-zinc-100">{isEditing ? "Modifier l'activité" : 'Nouvelle activité'}</h2>
          <button onClick={onClose} className="p-1 text-zinc-500 active:text-zinc-200">
            <X size={22} />
          </button>
        </div>
        <div className="space-y-3">
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Ex: Randonnée"
            className="w-full px-4 py-3 rounded-xl bg-zinc-600 text-sm text-zinc-100 outline-none focus:ring-2 focus:ring-copper-500"
          />
          <div>
            <label className="text-xs text-zinc-500 font-medium">Jour(s)</label>
            <p className="text-[11px] text-zinc-600 mb-1">
              Sélectionne plusieurs jours pour répéter cette activité. Pour retirer un jour précis, supprime-le directement depuis l'agenda.
            </p>
            <div className="flex gap-2 mt-1 flex-wrap">
              {days.map((d) => (
                <button
                  key={d.key}
                  onClick={() => toggleDay(d.key)}
                  className={`px-3 py-2 rounded-xl text-sm font-medium border ${
                    selectedDays.has(d.key) ? 'bg-copper-500/10 border-copper-700 text-copper-300' : 'border-zinc-500 text-zinc-400'
                  }`}
                >
                  {d.label} · {d.shortDate}
                </button>
              ))}
            </div>
          </div>
          <div className="flex gap-3">
            <div className="flex-1">
              <label className="text-xs text-zinc-500 font-medium">Début</label>
              <input
                type="time"
                value={start}
                onChange={(e) => setStart(e.target.value)}
                className="w-full mt-1 px-3 py-3 rounded-xl bg-zinc-600 text-sm text-zinc-100 outline-none focus:ring-2 focus:ring-copper-500"
              />
            </div>
            <div className="flex-1">
              <label className="text-xs text-zinc-500 font-medium">Fin</label>
              <input
                type="time"
                value={end}
                onChange={(e) => setEnd(e.target.value)}
                className="w-full mt-1 px-3 py-3 rounded-xl bg-zinc-600 text-sm text-zinc-100 outline-none focus:ring-2 focus:ring-copper-500"
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
                    responsible === m.id ? 'bg-copper-500/10 border-copper-700 text-copper-300' : 'border-zinc-500 text-zinc-400'
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
            className="w-full bg-copper-500 disabled:bg-zinc-500 text-zinc-950 font-semibold py-3.5 rounded-xl active:scale-[0.98] transition"
          >
            {saving ? 'Enregistrement…' : isEditing ? 'Enregistrer' : 'Ajouter'}
          </button>
        </div>
      </div>
    </div>
  )
}
