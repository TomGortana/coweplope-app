import { useState } from 'react'
import { Heart, ThumbsUp, Plus, ExternalLink, CheckCircle2, MessageSquare, X, Trash2, Pencil } from 'lucide-react'
import { useLockBodyScroll } from '../lib/useLockBodyScroll'
import Avatar from './Avatar'

export default function Lodging({ proposals, votes, comments, membersById, currentMember, onAdd, onEdit, onVote, onComment, onValidate, onUnvalidate, onDelete, isArchived }) {
  const [formTarget, setFormTarget] = useState(null) // null | 'new' | proposal en cours d'édition
  const [openComments, setOpenComments] = useState(null)

  return (
    <div className="px-4 pt-4 pb-6 space-y-3">
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-bold text-zinc-100">Logements</h1>
        {!isArchived && (
          <button
            onClick={() => setFormTarget('new')}
            className="flex items-center gap-1 text-sm font-semibold text-amber-400 active:opacity-70"
          >
            <Plus size={18} /> Proposer
          </button>
        )}
      </div>

      {proposals.length === 0 && (
        <p className="text-sm text-zinc-500 py-8 text-center">Aucune proposition pour l'instant.</p>
      )}

      {proposals.map((p) => {
        const pVotes = votes.filter((v) => v.proposal_id === p.id)
        const hearts = pVotes.filter((v) => v.vote_type === 'heart')
        const thumbs = pVotes.filter((v) => v.vote_type === 'thumbs_up')
        const myHeart = pVotes.some((v) => v.member_id === currentMember.id && v.vote_type === 'heart')
        const myThumb = pVotes.some((v) => v.member_id === currentMember.id && v.vote_type === 'thumbs_up')
        const pComments = comments.filter((c) => c.proposal_id === p.id)
        const author = membersById[p.created_by]

        return (
          <div
            key={p.id}
            className={`bg-zinc-800 border rounded-2xl p-4 ${
              p.status === 'validated' ? 'border-emerald-700 ring-1 ring-emerald-800' : 'border-zinc-700'
            } ${p.status === 'rejected' ? 'opacity-50' : ''}`}
          >
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <div className="flex items-center gap-1.5">
                  {p.status === 'validated' && <CheckCircle2 size={16} className="text-emerald-500 shrink-0" />}
                  <h3 className="font-semibold text-zinc-100 truncate">{p.title}</h3>
                </div>
                {p.comment && <p className="text-sm text-zinc-500 mt-0.5">{p.comment}</p>}
              </div>
              <div className="shrink-0 flex items-center gap-2">
                {p.price != null && <span className="text-sm font-bold text-zinc-300">{p.price} €</span>}
                {!isArchived && (
                  <button onClick={() => setFormTarget(p)} className="text-zinc-600 active:text-amber-400 p-1">
                    <Pencil size={16} />
                  </button>
                )}
                {!isArchived && (
                  <button
                    onClick={() => {
                      if (window.confirm(`Supprimer la proposition "${p.title}" ?`)) onDelete(p.id)
                    }}
                    className="text-zinc-600 active:text-rose-500 p-1"
                  >
                    <Trash2 size={16} />
                  </button>
                )}
              </div>
            </div>

            <div className="flex items-center gap-3 mt-3 text-xs text-zinc-500">
              {author && <span>Proposé par {author.name}</span>}
              {p.url && (
                <a href={p.url} target="_blank" rel="noreferrer" className="flex items-center gap-1 text-amber-400 font-medium">
                  <ExternalLink size={12} /> Voir l'annonce
                </a>
              )}
            </div>

            <div className="flex items-center gap-2 mt-3">
              <VoteButton
                icon={Heart}
                active={myHeart}
                count={hearts.length}
                onClick={() => onVote(p.id, 'heart')}
                disabled={isArchived}
                activeClass="bg-rose-500/10 text-rose-400 border-rose-800"
              />
              <VoteButton
                icon={ThumbsUp}
                active={myThumb}
                count={thumbs.length}
                onClick={() => onVote(p.id, 'thumbs_up')}
                disabled={isArchived}
                activeClass="bg-sky-500/10 text-sky-400 border-sky-800"
              />
              <button
                onClick={() => setOpenComments(openComments === p.id ? null : p.id)}
                className="flex items-center gap-1 px-3 py-2 rounded-xl border border-zinc-600 text-zinc-400 text-xs font-semibold active:bg-zinc-700"
              >
                <MessageSquare size={14} /> {pComments.length || ''}
              </button>
              {!isArchived && p.status !== 'validated' && (
                <button
                  onClick={() => onValidate(p.id)}
                  className="ml-auto text-xs font-semibold text-emerald-400 active:opacity-70"
                >
                  Valider
                </button>
              )}
              {!isArchived && p.status === 'validated' && (
                <button
                  onClick={() => {
                    if (window.confirm('Annuler la validation de ce logement ?')) onUnvalidate()
                  }}
                  className="ml-auto text-xs font-semibold text-zinc-500 active:opacity-70"
                >
                  Dévalider
                </button>
              )}
            </div>

            {openComments === p.id && (
              <CommentThread
                comments={pComments}
                membersById={membersById}
                currentMember={currentMember}
                onComment={(text) => onComment(p.id, text)}
                disabled={isArchived}
              />
            )}
          </div>
        )
      })}

      {formTarget && (
        <ProposalForm
          proposal={formTarget === 'new' ? null : formTarget}
          onClose={() => setFormTarget(null)}
          onSubmit={(data) => (formTarget === 'new' ? onAdd(data) : onEdit(formTarget.id, data))}
        />
      )}
    </div>
  )
}

function VoteButton({ icon: Icon, active, count, onClick, disabled, activeClass }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`flex items-center gap-1.5 px-3 py-2 rounded-xl border text-xs font-semibold transition active:scale-95 ${
        active ? activeClass : 'border-zinc-600 text-zinc-400'
      } ${disabled ? 'opacity-50' : ''}`}
    >
      <Icon size={14} fill={active ? 'currentColor' : 'none'} />
      {count > 0 && count}
    </button>
  )
}

function CommentThread({ comments, membersById, currentMember, onComment, disabled }) {
  const [text, setText] = useState('')
  return (
    <div className="mt-3 pt-3 border-t border-zinc-700 space-y-2">
      {comments.map((c) => {
        const author = membersById[c.member_id]
        return (
          <div key={c.id} className="flex gap-2 text-sm">
            <Avatar member={author} size="sm" />
            <p className="text-zinc-400">
              <span className="font-semibold text-zinc-200">{author?.name} </span>
              {c.content}
            </p>
          </div>
        )
      })}
      {!disabled && (
        <div className="flex gap-2 pt-1">
          <input
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder={`Commenter en tant que ${currentMember.name}...`}
            className="flex-1 px-3 py-2 rounded-xl bg-zinc-700 text-sm text-zinc-100 outline-none focus:ring-2 focus:ring-amber-500"
          />
          <button
            onClick={() => {
              if (!text.trim()) return
              onComment(text.trim())
              setText('')
            }}
            className="px-3 py-2 rounded-xl bg-zinc-100 text-zinc-900 text-xs font-semibold active:scale-95"
          >
            Envoyer
          </button>
        </div>
      )}
    </div>
  )
}

function ProposalForm({ proposal, onClose, onSubmit }) {
  useLockBodyScroll()
  const isEditing = Boolean(proposal)
  const [title, setTitle] = useState(proposal?.title || '')
  const [url, setUrl] = useState(proposal?.url || '')
  const [price, setPrice] = useState(proposal?.price != null ? String(proposal.price) : '')
  const [comment, setComment] = useState(proposal?.comment || '')
  const [saving, setSaving] = useState(false)

  const canSubmit = title.trim()

  async function submit() {
    if (!canSubmit) return
    setSaving(true)
    try {
      await onSubmit({ title: title.trim(), url: url.trim() || null, price: price ? Number(price) : null, comment: comment.trim() || null })
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
          <h2 className="text-lg font-bold text-zinc-100">{isEditing ? 'Modifier le logement' : 'Proposer un logement'}</h2>
          <button onClick={onClose} className="p-1 text-zinc-500 active:text-zinc-200">
            <X size={22} />
          </button>
        </div>
        <div className="space-y-3">
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Nom du logement"
            className="w-full px-4 py-3 rounded-xl bg-zinc-700 text-sm text-zinc-100 outline-none focus:ring-2 focus:ring-amber-500"
          />
          <input
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="Lien Airbnb / Booking"
            className="w-full px-4 py-3 rounded-xl bg-zinc-700 text-sm text-zinc-100 outline-none focus:ring-2 focus:ring-amber-500"
          />
          <input
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            type="number"
            inputMode="decimal"
            placeholder="Prix total (€)"
            className="w-full px-4 py-3 rounded-xl bg-zinc-700 text-sm text-zinc-100 outline-none focus:ring-2 focus:ring-amber-500"
          />
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Commentaire (optionnel)"
            rows={2}
            className="w-full px-4 py-3 rounded-xl bg-zinc-700 text-sm text-zinc-100 outline-none focus:ring-2 focus:ring-amber-500 resize-none"
          />
          <button
            onClick={submit}
            disabled={!canSubmit || saving}
            className="w-full bg-amber-500 disabled:bg-zinc-600 text-zinc-950 font-semibold py-3.5 rounded-xl active:scale-[0.98] transition"
          >
            {saving ? 'Enregistrement…' : isEditing ? 'Enregistrer' : 'Ajouter la proposition'}
          </button>
        </div>
      </div>
    </div>
  )
}
