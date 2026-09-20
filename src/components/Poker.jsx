import { useState } from 'react'
import { Plus, Trophy, X, Trash2 } from 'lucide-react'

const RANK_LABELS = ['1er', '2e', '3e']

export default function Poker({ poker, membersById, members, absentMemberIds, onAddGame, onSetResult, onDeleteGame, isArchived }) {
  const [showForm, setShowForm] = useState(false)
  const leaderboard = computeLeaderboard(poker, membersById)

  return (
    <div className="px-4 pt-4 pb-6 space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-bold text-slate-900">Poker</h1>
        {!isArchived && (
          <button onClick={() => setShowForm(true)} className="flex items-center gap-1 text-xs font-semibold text-indigo-600 active:opacity-70">
            <Plus size={14} /> Nouvelle partie
          </button>
        )}
      </div>

      {leaderboard.length > 0 && (
        <div className="bg-white border border-slate-200 rounded-2xl p-3.5">
          <p className="text-xs font-semibold text-slate-400 mb-2 flex items-center gap-1">
            <Trophy size={13} className="text-amber-500" /> Classement général
          </p>
          <div className="space-y-1.5">
            {leaderboard.map((e, i) => (
              <div key={e.member_id} className="flex items-center gap-2 text-sm">
                <span className="w-4 text-slate-300 font-semibold">{i + 1}</span>
                <span className="flex-1 text-slate-700">
                  {e.member.avatar_emoji} {e.member.name}
                </span>
                <span className={`font-bold ${e.total >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
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

      {poker.games.length === 0 && <p className="text-sm text-slate-400 py-8 text-center">Aucune partie pour l'instant.</p>}

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
    <div className="bg-white border border-slate-200 rounded-2xl p-3.5">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-semibold text-slate-800">{game.variant}</p>
          <p className="text-xs text-slate-400">
            {new Date(game.game_date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })} · Cave {game.buy_in} €
          </p>
        </div>
        {!isArchived && (
          <div className="flex items-center gap-2">
            <button onClick={() => setEditing((e) => !e)} className="text-xs font-semibold text-indigo-600 active:opacity-70">
              {editing ? 'Fermer' : 'Scores'}
            </button>
            <button
              onClick={() => {
                if (window.confirm(`Supprimer la partie du ${new Date(game.game_date).toLocaleDateString('fr-FR')} ?`)) {
                  onDeleteGame(game.id)
                }
              }}
              className="text-slate-300 active:text-rose-500 p-1"
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
                <span className="text-slate-600">
                  {m.avatar_emoji} {m.name}
                </span>
                <span className={`font-semibold ${value > 0 ? 'text-emerald-600' : value < 0 ? 'text-rose-600' : 'text-slate-300'}`}>
                  {value > 0 ? '+' : ''}
                  {value} €
                </span>
              </div>
            )
          })}
          {participants.length === 0 && <p className="text-xs text-slate-300 mt-2">Aucun participant sélectionné.</p>}
        </div>
      )}
    </div>
  )
}

// Saisie simplifiée : seuls le 1er, 2e et 3e ont un montant à renseigner
// à la main, les autres participants restent à 0 € automatiquement.
function PodiumEditor({ game, results, participants, onSetResult, onDone }) {
  const rankCount = Math.min(RANK_LABELS.length, participants.length)
  const sorted = [...results].sort((a, b) => Number(b.net_result) - Number(a.net_result))
  const [podium, setPodium] = useState(() =>
    Array.from({ length: rankCount }, (_, i) => ({
      member_id: sorted[i] && Number(sorted[i].net_result) > 0 ? sorted[i].member_id : '',
      amount: sorted[i] && Number(sorted[i].net_result) > 0 ? String(sorted[i].net_result) : '',
    }))
  )
  const [saving, setSaving] = useState(false)

  function updateRank(i, field, value) {
    setPodium((prev) => prev.map((p, idx) => (idx === i ? { ...p, [field]: value } : p)))
  }

  function optionsFor(i) {
    const chosenElsewhere = podium.filter((_, idx) => idx !== i).map((p) => p.member_id)
    return participants.filter((m) => !chosenElsewhere.includes(m.id) || m.id === podium[i].member_id)
  }

  async function save() {
    setSaving(true)
    try {
      const winners = podium.filter((p) => p.member_id)
      const winnerIds = new Set(winners.map((p) => p.member_id))
      await Promise.all([
        ...winners.map((p) => onSetResult(game.id, p.member_id, Number(p.amount) || 0)),
        ...participants.filter((m) => !winnerIds.has(m.id)).map((m) => onSetResult(game.id, m.id, 0)),
      ])
      onDone()
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="mt-3 pt-3 border-t border-slate-100 space-y-2">
      {podium.map((p, i) => (
        <div key={i} className="flex items-center gap-2">
          <span className="text-xs font-semibold text-slate-400 w-6 shrink-0">{RANK_LABELS[i]}</span>
          <select
            value={p.member_id}
            onChange={(e) => updateRank(i, 'member_id', e.target.value)}
            className="flex-1 px-2 py-2 rounded-lg bg-slate-100 text-sm outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="">—</option>
            {optionsFor(i).map((m) => (
              <option key={m.id} value={m.id}>
                {m.name}
              </option>
            ))}
          </select>
          <input
            type="number"
            inputMode="decimal"
            value={p.amount}
            onChange={(e) => updateRank(i, 'amount', e.target.value)}
            placeholder="€"
            disabled={!p.member_id}
            className="w-20 text-right px-2 py-2 rounded-lg bg-slate-100 text-sm outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-40"
          />
        </div>
      ))}
      <p className="text-[11px] text-slate-300">Les autres joueurs restent à 0 €.</p>
      <button
        onClick={save}
        disabled={saving}
        className="w-full bg-slate-900 disabled:bg-slate-300 text-white text-sm font-semibold py-2.5 rounded-xl active:scale-[0.98] transition"
      >
        {saving ? 'Enregistrement…' : 'Valider le classement'}
      </button>
    </div>
  )
}

function GameForm({ members, absentMemberIds, onClose, onSubmit }) {
  const [date, setDate] = useState('')
  const [variant, setVariant] = useState("Texas Hold'em")
  const [buyIn, setBuyIn] = useState('10')
  const [participantIds, setParticipantIds] = useState(
    () => new Set(members.filter((m) => !absentMemberIds.includes(m.id)).map((m) => m.id))
  )
  const [saving, setSaving] = useState(false)

  const canSubmit = date && variant.trim() && participantIds.size > 0

  function toggleParticipant(id) {
    setParticipantIds((prev) => {
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
      await onSubmit({
        game_date: date,
        variant: variant.trim(),
        buy_in: Number(buyIn) || 0,
        participant_ids: [...participantIds],
      })
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
          <h2 className="text-lg font-bold text-slate-900">Nouvelle partie</h2>
          <button onClick={onClose} className="p-1 text-slate-400 active:text-slate-700">
            <X size={22} />
          </button>
        </div>
        <div className="space-y-3">
          <div>
            <label className="text-xs text-slate-400 font-medium">Date</label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full mt-1 px-4 py-3 rounded-xl bg-slate-100 text-sm outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <div>
            <label className="text-xs text-slate-400 font-medium">Variante</label>
            <input
              value={variant}
              onChange={(e) => setVariant(e.target.value)}
              placeholder="Ex: Texas Hold'em"
              className="w-full mt-1 px-4 py-3 rounded-xl bg-slate-100 text-sm outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <div>
            <label className="text-xs text-slate-400 font-medium">Cave / buy-in par joueur (€)</label>
            <input
              type="number"
              inputMode="decimal"
              value={buyIn}
              onChange={(e) => setBuyIn(e.target.value)}
              className="w-full mt-1 px-4 py-3 rounded-xl bg-slate-100 text-sm outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <div>
            <label className="text-xs text-slate-400 font-medium">Qui joue ?</label>
            <div className="grid grid-cols-2 gap-2 mt-1.5">
              {members.map((m) => {
                const checked = participantIds.has(m.id)
                return (
                  <button
                    key={m.id}
                    onClick={() => toggleParticipant(m.id)}
                    className={`flex items-center gap-2 px-3 py-2.5 rounded-xl border text-sm font-medium text-left ${
                      checked ? 'border-indigo-300 bg-indigo-50 text-indigo-700' : 'border-slate-200 text-slate-400'
                    }`}
                  >
                    <span>{m.avatar_emoji}</span>
                    <span className="truncate">{m.name}</span>
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
