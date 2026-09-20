import { useState } from 'react'
import { ChevronDown, MessageCircle, Settings, Check, Pencil } from 'lucide-react'
import { getWhatsAppGroupLink } from '../lib/whatsapp'
import WeekendManageModal from './WeekendManageModal'

export default function Header({
  members,
  currentMember,
  onChangeMember,
  weekends,
  currentWeekend,
  onChangeWeekend,
  onOpenAdmin,
  absentMemberIds,
  onSaveWeekendSettings,
}) {
  const [memberOpen, setMemberOpen] = useState(false)
  const [weekendOpen, setWeekendOpen] = useState(false)
  const [manageOpen, setManageOpen] = useState(false)
  const waLink = getWhatsAppGroupLink()

  return (
    <header className="sticky top-0 z-30 bg-white border-b border-slate-200">
      <div className="flex items-center justify-between px-4 pt-3 pb-2">
        <div>
          <p className="text-[11px] text-slate-400 font-medium leading-none">Coweplope Organizer</p>
          <button
            onClick={() => setWeekendOpen((o) => !o)}
            className="mt-1 flex items-center gap-1 text-lg font-bold text-slate-900 active:opacity-70"
          >
            <span className="truncate max-w-[180px]">{currentWeekend?.name || '—'}</span>
            <ChevronDown size={18} className="text-slate-400 shrink-0" />
          </button>
        </div>

        <div className="flex items-center gap-2">
          <a
            href={waLink}
            target="_blank"
            rel="noreferrer"
            className="w-10 h-10 flex items-center justify-center rounded-full bg-emerald-50 text-emerald-600 active:scale-95 transition"
            aria-label="Groupe WhatsApp"
          >
            <MessageCircle size={20} />
          </a>
          <button
            onClick={onOpenAdmin}
            className="w-10 h-10 flex items-center justify-center rounded-full bg-slate-100 text-slate-600 active:scale-95 transition"
            aria-label="Administration"
          >
            <Settings size={20} />
          </button>
          <button
            onClick={() => setMemberOpen((o) => !o)}
            className="w-10 h-10 flex items-center justify-center rounded-full text-lg active:scale-95 transition"
            style={{ backgroundColor: (currentMember?.color || '#6366f1') + '22' }}
            aria-label="Profil"
          >
            {currentMember?.avatar_emoji || '🙂'}
          </button>
        </div>
      </div>

      {weekendOpen && (
        <div className="px-4 pb-3">
          <div className="flex items-center justify-between px-1 pb-2">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide">Éditions</p>
            {currentWeekend && (
              <button
                onClick={() => {
                  setManageOpen(true)
                  setWeekendOpen(false)
                }}
                className="flex items-center gap-1 text-xs font-semibold text-indigo-600 active:opacity-70"
              >
                <Pencil size={12} /> Modifier / présence
              </button>
            )}
          </div>
          <div className="bg-slate-50 rounded-2xl p-2 space-y-1">
            {weekends.map((w) => (
              <button
                key={w.id}
                onClick={() => {
                  onChangeWeekend(w.id)
                  setWeekendOpen(false)
                }}
                className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl active:bg-white text-left"
              >
                <div>
                  <p className="text-sm font-semibold text-slate-800">{w.name}</p>
                  <p className="text-xs text-slate-400">
                    {formatRange(w.start_date, w.end_date)} · {w.status === 'archived' ? 'Archivé' : 'Actif'}
                  </p>
                </div>
                {w.id === currentWeekend?.id && <Check size={18} className="text-indigo-600 shrink-0" />}
              </button>
            ))}
          </div>
        </div>
      )}

      {memberOpen && (
        <div className="px-4 pb-3">
          <div className="bg-slate-50 rounded-2xl p-2 grid grid-cols-4 gap-1">
            {members.map((m) => (
              <button
                key={m.id}
                onClick={() => {
                  onChangeMember(m.id)
                  setMemberOpen(false)
                }}
                className={`flex flex-col items-center gap-1 py-2 rounded-xl active:bg-white ${
                  m.id === currentMember?.id ? 'ring-2 ring-indigo-500' : ''
                }`}
              >
                <span className="text-2xl">{m.avatar_emoji}</span>
                <span className="text-[11px] font-medium text-slate-700 truncate max-w-full">{m.name}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {manageOpen && currentWeekend && (
        <WeekendManageModal
          weekend={currentWeekend}
          members={members}
          absentMemberIds={absentMemberIds}
          onClose={() => setManageOpen(false)}
          onSave={onSaveWeekendSettings}
        />
      )}
    </header>
  )
}

function formatRange(start, end) {
  const s = new Date(start)
  const e = new Date(end)
  const fmt = (d) => d.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })
  return `${fmt(s)} → ${fmt(e)}`
}
