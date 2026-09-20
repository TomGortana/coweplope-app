import { useRef, useState } from 'react'
import { ChevronDown, MessageCircle, Settings, Check, Pencil, Camera } from 'lucide-react'
import { getWhatsAppGroupLink } from '../lib/whatsapp'
import Avatar from './Avatar'

export default function Header({
  members,
  currentMember,
  onChangeMember,
  weekends,
  currentWeekend,
  onChangeWeekend,
  onOpenAdmin,
  onOpenManageWeekend,
  onUpdateMemberPhoto,
}) {
  const [memberOpen, setMemberOpen] = useState(false)
  const [weekendOpen, setWeekendOpen] = useState(false)
  const [uploadingPhoto, setUploadingPhoto] = useState(false)
  const photoInputRef = useRef(null)
  const waLink = getWhatsAppGroupLink()

  async function handlePhotoChange(e) {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file || !currentMember) return
    setUploadingPhoto(true)
    try {
      await onUpdateMemberPhoto(currentMember.id, file)
    } finally {
      setUploadingPhoto(false)
    }
  }

  return (
    <header className="sticky top-0 z-30 bg-zinc-800 border-b border-zinc-700">
      <div className="flex items-center justify-between px-4 pt-3 pb-2">
        <div>
          <p className="text-[11px] text-zinc-500 font-medium leading-none">Coweplope Organizer</p>
          <button
            onClick={() => setWeekendOpen((o) => !o)}
            className="mt-1 flex items-center gap-1 text-lg font-bold text-zinc-100 active:opacity-70"
          >
            <span className="truncate max-w-[180px]">{currentWeekend?.name || '—'}</span>
            <ChevronDown size={18} className="text-zinc-500 shrink-0" />
          </button>
        </div>

        <div className="flex items-center gap-2">
          <a
            href={waLink}
            target="_blank"
            rel="noreferrer"
            className="w-10 h-10 flex items-center justify-center rounded-full bg-emerald-500/10 text-emerald-400 active:scale-95 transition"
            aria-label="Groupe WhatsApp"
          >
            <MessageCircle size={20} />
          </a>
          <button
            onClick={onOpenAdmin}
            className="w-10 h-10 flex items-center justify-center rounded-full bg-zinc-700 text-zinc-300 active:scale-95 transition"
            aria-label="Administration"
          >
            <Settings size={20} />
          </button>
          <button onClick={() => setMemberOpen((o) => !o)} className="active:scale-95 transition" aria-label="Profil">
            <Avatar member={currentMember} size="lg" />
          </button>
        </div>
      </div>

      {weekendOpen && (
        <div className="px-4 pb-3">
          <div className="flex items-center justify-between px-1 pb-2">
            <p className="text-xs font-semibold text-zinc-500 uppercase tracking-wide">Éditions</p>
            {currentWeekend && (
              <button
                onClick={() => {
                  onOpenManageWeekend()
                  setWeekendOpen(false)
                }}
                className="flex items-center gap-1 text-xs font-semibold text-amber-400 active:opacity-70"
              >
                <Pencil size={12} /> Modifier / présence
              </button>
            )}
          </div>
          <div className="bg-zinc-700/60 rounded-2xl p-2 space-y-1">
            {weekends.map((w) => (
              <button
                key={w.id}
                onClick={() => {
                  onChangeWeekend(w.id)
                  setWeekendOpen(false)
                }}
                className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl active:bg-zinc-600 text-left"
              >
                <div>
                  <p className="text-sm font-semibold text-zinc-200">{w.name}</p>
                  <p className="text-xs text-zinc-500">
                    {formatRange(w.start_date, w.end_date)} · {w.status === 'archived' ? 'Archivé' : 'Actif'}
                  </p>
                </div>
                {w.id === currentWeekend?.id && <Check size={18} className="text-amber-400 shrink-0" />}
              </button>
            ))}
          </div>
        </div>
      )}

      {memberOpen && (
        <div className="px-4 pb-3">
          {currentMember && (
            <div className="bg-zinc-700/60 rounded-2xl p-3 mb-2 flex items-center gap-3">
              <button
                type="button"
                onClick={() => photoInputRef.current?.click()}
                disabled={uploadingPhoto}
                className="relative disabled:opacity-50"
                aria-label="Changer ma photo"
              >
                <Avatar member={currentMember} size="lg" />
                <span className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-amber-500 flex items-center justify-center">
                  <Camera size={10} className="text-zinc-950" />
                </span>
              </button>
              <input ref={photoInputRef} type="file" accept="image/*" onChange={handlePhotoChange} className="hidden" />
              <div className="min-w-0">
                <p className="text-sm font-semibold text-zinc-200 truncate">{currentMember.name}</p>
                <button
                  type="button"
                  onClick={() => photoInputRef.current?.click()}
                  disabled={uploadingPhoto}
                  className="text-xs font-medium text-amber-400 active:opacity-70 disabled:opacity-50"
                >
                  {uploadingPhoto ? 'Envoi…' : 'Changer ma photo'}
                </button>
              </div>
            </div>
          )}
          <div className="bg-zinc-700/60 rounded-2xl p-2 grid grid-cols-4 gap-1">
            {members.map((m) => (
              <button
                key={m.id}
                onClick={() => {
                  onChangeMember(m.id)
                  setMemberOpen(false)
                }}
                className={`flex flex-col items-center gap-1 py-2 rounded-xl active:bg-zinc-600 ${
                  m.id === currentMember?.id ? 'ring-2 ring-amber-500' : ''
                }`}
              >
                <Avatar member={m} size="lg" />
                <span className="text-[11px] font-medium text-zinc-300 truncate max-w-full">{m.name}</span>
              </button>
            ))}
          </div>
        </div>
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
