import { useState } from 'react'
import { Plus, Trophy, X, Trash2 } from 'lucide-react'
import { useLockBodyScroll } from '../lib/useLockBodyScroll'
import Avatar from './Avatar'

const RANK_LABELS = ['1er', '2e', '3e']

export default function Poker({ poker, membersById, members, absentMemberIds, onAddGame, onSetResult, onDeleteGame, isArchived }) {
  const [showForm, setShowForm] = useState(false)
  const leaderboard = computeLeaderboard(poker, membersById)

  return (
    <div className="px-4 pt-4 pb-6 space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-bold text-zinc-100">Poker</h1>
        {!isArchived && (
          <button onClick={() => setShowForm(true)} className="flex items-center gap-1 text-xs font-semibold text-amber-400 active:opacity-70">
            <Plus size={14} /> Nouvelle partie
          </button>
        )}
      </div>

      {leaderboard.length > 0 && (
        <div className="bg-zinc-800 border border-zinc-700 rounded-2xl p-3.5">
          <p className="text-xs font-semibold text-zinc-500 mb-2 flex items-center gap-1">
            <Trophy size={13} className="text-amber-400" /> Classement général
          </p>
          <div className="space-y-1.5">
            {leaderboard.map((e, i) => (
              <div key={e.member_id} className="flex items-center gap-2 text-sm">
                <span className="w-4 text-zinc-600 font-semibold">{i + 1}</span>
                <Avatar member={e.member} size="sm" />
                <span className="flex-1 text-zinc-300">{e.member.name}</span>
                <span className={`font-bold ${e.total >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                  {e.total >= 0 ? '+' : ''}
                  {e.total} €
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="space-y-3">
        {poker.games.map((g) => (
          <GameCard
            key={g.id}
            game={g}
            results={poker.results.filter((r) => r.game_id === g.id)}
            membersById={membersById}
            onSetResult={onSetResult}
            onDeleteGame={onDeleteGame}
            isArchived={isArchived}
          />
        ))}
      </div>

      {poker.games.length === 0 && <p className="text-sm text-zinc-500 py-8 text-center">Aucune partie pour l'instant.</p>}

      {showForm && (
        <GameForm
          members={members}
          absentMemberIds={absentMemberIds}
          onClose={() => setShowForm(false)}
          onSubmit={onAddGame}
        />
      )}
    </div>
  )
}

function GameCard({ game, results, membersById, onSetResult, onDeleteGame, isArchived }) {
  const [editing, setEditing] = useState(false)
  const participants = results.map((r) => membersById[r.member_id]).filter(Boolean)

  return (
    <div className="bg-zinc-800 border border-zinc-700 rounded-2xl p-3.5">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-semibold text-zinc-200">{game.variant}</p>
          <p className="text-xs text-zinc-500">
            {new Date(game.game_date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })} · Cave {game.buy_in} €
          </p>
          <p className="text-[11px] text-zinc-600">
            Barème : 1er +{game.payout_1st ?? 0}€ · 2e +{game.payout_2nd ?? 0}€ · 3e +{game.payout_3rd ?? 0}€
          </p>
        </div>
        {!isArchived && (
          <div className="flex items-center gap-2">
            <button onClick={() => setEditing((e) => !e)} className="text-xs font-semibold text-amber-400 active:opacity-70">
              {editing ? 'Fermer' : 'Scores'}
            </button>
            <button
              onClick={() => {
                if (window.confirm(`Supprimer la partie du ${new Date(game.game_date).toLocaleDateString('fr-FR')} ?`)) {
                  onDeleteGame(game.id)
                }
              }}
              className="text-zinc-600 active:text-rose-500 p-1"
            >
              <Trash2 size={16} />
            </button>
          </div>
        )}
      </div>

      {editing ? (
        <PodiumEditor game={game} results={results} participants={participants} onSetResult={onSetResult} onDone={() => setEditing(false)} />
      ) : (
        <div className="mt-2 space-y-1">
          {participants.map((m) => {
            const r = results.find((res) => res.member_id === m.id)
            const value = r?.net_result ?? 0
            return (
              <div key={m.id} className="flex items-center justify-between text-sm py-0.5">
                <span className="text-zinc-400 flex items-center gap-1.5">
                  <Avatar member={m} size="sm" /> {m.name}
                </span>
                <span className={`font-semibold ${value > 0 ? 'text-emerald-400' : value < 0 ? 'text-rose-400' : 'text-zinc-600'}`}>
                  {value > 0 ? '+' : ''}
                  {value} €
                </span>
              </div>
            )
          })}
          {participants.length === 0 && <p className="text-xs text-zinc-600 mt-2">Aucun participant sélectionné.</p>}
        </div>
      )}
    </div>
  )
}

// Saisie simplifiée : le barème (gain BRUT du 1er/2e/3e) a été fixé à
// la création de la partie. Ici on choisit juste qui a fini à quelle
// place ; le gain NET affiché ensuite tient compte de la mise (payout -
// buy-in), et les non-classés perdent leur mise (-buy-in).
function PodiumEditor({ game, results, participants, onSetResult, onDone }) {
  const buyIn = Number(game.buy_in) || 0
  const payouts = [Number(game.payout_1st) || 0, Number(game.payout_2nd) || 0, Number(game.payout_3rd) || 0]
  const rankCount = Math.min(RANK_LABELS.length, participants.length)
  const [ranking, setRanking] = useState(() =>
    Array.from({ length: rankCount }, (_, i) => {
      const expectedNet = payouts[i] - buyIn
      const r = results.find((res) => Number(res.net_result) === expectedNet && payouts[i] > 0)
      return r ? r.member_id : ''
    })
  )
  const [saving, setSaving] = useState(false)

  function updateRank(i, value) {
    setRanking((prev) => prev.map((v, idx) => (idx === i ? value : v)))
  }

  function optionsFor(i) {
    const chosenElsewhere = ranking.filter((_, idx) => idx !== i)
    return participants.filter((m) => !chosenElsewhere.includes(m.id) || m.id === ranking[i])
  }

  async function save() {
    setSaving(true)
    try {
      const winners = ranking.map((member_id, i) => ({ member_id, amount: payouts[i] - buyIn })).filter((w) => w.member_id)
      const winnerIds = new Set(winners.map((w) => w.member_id))
      await Promise.all([
        ...winners.map((w) => onSetResult(game.id, w.member_id, w.amount)),
        ...participants.filter((m) => !winnerIds.has(m.id)).map((m) => onSetResult(game.id, m.id, -buyIn)),
      ])
      onDone()
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="mt-3 pt-3 border-t border-zinc-700 space-y-2">
      {ranking.map((memberId, i) => (
        <div key={i} className="flex items-center gap-2">
          <span className="text-xs font-semibold text-zinc-500 w-20 shrink-0">
            {RANK_LABELS[i]} ({payouts[i] - buyIn >= 0 ? '+' : ''}
            {payouts[i] - buyIn}€)
          </span>
          <select
            value={memberId}
            onChange={(e) => updateRank(i, e.target.value)}
            className="flex-1 px-2 py-2 rounded-lg bg-zinc-700 text-sm text-zinc-100 outline-none focus:ring-2 focus:ring-amber-500"
          >
            <option value="">—</option>
            {optionsFor(i).map((m) => (
              <option key={m.id} value={m.id}>
                {m.name}
              </option>
            ))}
          </select>
        </div>
      ))}
      <p className="text-[11px] text-zinc-600">Les autres joueurs perdent leur mise ({-buyIn}€).</p>
      <button
        onClick={save}
        disabled={saving}
        className="w-full bg-zinc-100 disabled:bg-zinc-600 text-zinc-900 text-sm font-semibold py-2.5 rounded-xl active:scale-[0.98] transition"
      >
        {saving ? 'Enregistrement…' : 'Valider le classement'}
      </button>
    </div>
  )
}

function GameForm({ members, absentMemberIds, onClose, onSubmit }) {
  useLockBodyScroll()
  const [date, setDate] = useState('')
  const [variant, setVariant] = useState("Texas Hold'em")
  const [buyIn, setBuyIn] = useState('10')
  const [participantIds, setParticipantIds] = useState(
    () => new Set(members.filter((m) => !absentMemberIds.includes(m.id)).map((m) => m.id))
  )
  const [payouts, setPayouts] = useState(['', '', ''])
  const [saving, setSaving] = useState(false)

  const canSubmit = date && variant.trim() && participantIds.size > 0
  const payoutCount = Math.min(3, participantIds.size)

  function toggleParticipant(id) {
    setParticipantIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  function updatePayout(i, value) {
    setPayouts((prev) => prev.map((p, idx) => (idx === i ? value : p)))
  }

  async function submit() {
    if (!canSubmit) return
    setSaving(true)
    try {
      await onSubmit({
        game_date: date,
        variant: variant.trim(),
        buy_in: Number(buyIn) || 0,
        participant_ids: [...participantIds],
        payout_1st: Number(payouts[0]) || 0,
        payout_2nd: Number(payouts[1]) || 0,
        payout_3rd: Number(payouts[2]) || 0,
      })
      onClose()
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end">
      <div className="absolute inset-0 bg-black/60" onClick={onClose} />
      <div className="relative w-full bg-zinc-800 rounded-t-3xl p-5 pb-[calc(env(safe-area-inset-bottom)+1.5rem)] max-h-[85vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-zinc-100">Nouvelle partie</h2>
          <button onClick={onClose} className="p-1 text-zinc-500 active:text-zinc-200">
            <X size={22} />
          </button>
        </div>
        <div className="space-y-3">
          <div>
            <label className="text-xs text-zinc-500 font-medium">Date</label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full mt-1 px-4 py-3 rounded-xl bg-zinc-700 text-sm text-zinc-100 outline-none focus:ring-2 focus:ring-amber-500"
            />
          </div>
          <div>
            <label className="text-xs text-zinc-500 font-medium">Variante</label>
            <input
              value={variant}
              onChange={(e) => setVariant(e.target.value)}
              placeholder="Ex: Texas Hold'em"
              className="w-full mt-1 px-4 py-3 rounded-xl bg-zinc-700 text-sm text-zinc-100 outline-none focus:ring-2 focus:ring-amber-500"
            />
          </div>
          <div>
            <label className="text-xs text-zinc-500 font-medium">Cave / buy-in par joueur (€)</label>
            <input
              type="number"
              inputMode="decimal"
              value={buyIn}
              onChange={(e) => setBuyIn(e.target.value)}
              className="w-full mt-1 px-4 py-3 rounded-xl bg-zinc-700 text-sm text-zinc-100 outline-none focus:ring-2 focus:ring-amber-500"
            />
          </div>
          <div>
            <label className="text-xs text-zinc-500 font-medium">Qui joue ?</label>
            <div className="grid grid-cols-2 gap-2 mt-1.5">
              {members.map((m) => {
                const checked = participantIds.has(m.id)
                return (
                  <button
                    key={m.id}
                    onClick={() => toggleParticipant(m.id)}
                    className={`flex items-center gap-2 px-3 py-2.5 rounded-xl border text-sm font-medium text-left ${
                      checked ? 'border-amber-700 bg-amber-500/10 text-amber-300' : 'border-zinc-600 text-zinc-500'
                    }`}
                  >
                    <Avatar member={m} size="sm" />
                    <span className="truncate">{m.name}</span>
                  </button>
                )
              })}
            </div>
          </div>
          <div>
            <label className="text-xs text-zinc-500 font-medium">Gains du 1er / 2e / 3e (€)</label>
            <p className="text-[11px] text-zinc-600 mb-1">Défini une fois pour toutes, les scores se saisiront juste en choisissant le classement.</p>
            <div className="flex gap-2">
              {RANK_LABELS.slice(0, payoutCount).map((label, i) => (
                <div key={label} className="flex-1">
                  <input
                    type="number"
                    inputMode="decimal"
                    value={payouts[i]}
                    onChange={(e) => updatePayout(i, e.target.value)}
                    placeholder={label}
                    className="w-full px-3 py-2.5 rounded-xl bg-zinc-700 text-sm text-zinc-100 text-center outline-none focus:ring-2 focus:ring-amber-500"
                  />
                  <p className="text-[10px] text-zinc-600 text-center mt-0.5">{label}</p>
                </div>
              ))}
            </div>
          </div>
          <button
            onClick={submit}
            disabled={!canSubmit || saving}
            className="w-full bg-amber-500 disabled:bg-zinc-600 text-zinc-950 font-semibold py-3.5 rounded-xl active:scale-[0.98] transition"
          >
            {saving ? 'Création…' : 'Créer la partie'}
          </button>
        </div>
      </div>
    </div>
  )
}

function computeLeaderboard(poker, membersById) {
  const byMember = {}
  poker.results.forEach((r) => {
    byMember[r.member_id] = (byMember[r.member_id] || 0) + Number(r.net_result)
  })
  return Object.entries(byMember)
    .map(([member_id, total]) => ({ member_id, total, member: membersById[member_id] }))
    .filter((e) => e.member)
    .sort((a, b) => b.total - a.total)
}
