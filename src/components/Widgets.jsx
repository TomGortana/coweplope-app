import { useState } from 'react'
import { ExternalLink, Settings2, Plus, Trophy, X, Trash2 } from 'lucide-react'

export default function Widgets({
  tricountLink,
  onSetTricountLink,
  balances,
  membersById,
  currentMember,
  poker,
  onAddGame,
  onSetResult,
  onDeleteGame,
  isArchived,
}) {
  return (
    <div className="px-4 pt-4 pb-6 space-y-6">
      <h1 className="text-lg font-bold text-slate-900">Dépenses & Poker</h1>
      <TricountWidget
        link={tricountLink}
        onSetLink={onSetTricountLink}
        balances={balances}
        membersById={membersById}
        currentMember={currentMember}
      />
      <PokerWidget
        poker={poker}
        membersById={membersById}
        onAddGame={onAddGame}
        onSetResult={onSetResult}
        onDeleteGame={onDeleteGame}
        isArchived={isArchived}
      />
    </div>
  )
}

function TricountWidget({ link, onSetLink, balances, membersById, currentMember }) {
  const [editing, setEditing] = useState(false)
  const [url, setUrl] = useState(link?.url || '')
  const myBalance = balances.find((b) => b.member_id === currentMember.id)

  return (
    <section>
      <div className="flex items-center justify-between mb-2">
        <h2 className="text-sm font-bold text-slate-700 uppercase tracking-wide">Dépenses (Tricount)</h2>
        <button onClick={() => setEditing((e) => !e)} className="text-slate-400 active:text-slate-700 p-1">
          <Settings2 size={16} />
        </button>
      </div>

      {editing && (
        <div className="flex gap-2 mb-3">
          <input
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://tricount.com/..."
            className="flex-1 px-3 py-2.5 rounded-xl bg-slate-100 text-sm outline-none focus:ring-2 focus:ring-indigo-500"
          />
          <button
            onClick={() => {
              onSetLink(url.trim())
              setEditing(false)
            }}
            className="px-4 py-2.5 rounded-xl bg-slate-900 text-white text-sm font-semibold active:scale-95"
          >
            OK
          </button>
        </div>
      )}

      {link?.url ? (
        <a
          href={link.url}
          target="_blank"
          rel="noreferrer"
          className="flex items-center justify-center gap-2 w-full bg-emerald-500 text-white font-semibold py-3.5 rounded-2xl active:scale-[0.98] transition"
        >
          <ExternalLink size={18} /> Ouvrir Tricount / Saisir une dépense
        </a>
      ) : (
        <p className="text-sm text-slate-400 text-center py-3">Aucun lien Tricount configuré pour ce week-end.</p>
      )}

      {myBalance && (
        <div
          className={`mt-3 rounded-2xl p-3.5 text-center ${
            myBalance.balance >= 0 ? 'bg-emerald-50' : 'bg-rose-50'
          }`}
        >
          <p className="text-xs text-slate-500 font-medium">Ton solde estimé</p>
          <p className={`text-xl font-bold ${myBalance.balance >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
            {myBalance.balance >= 0 ? '+' : ''}
            {myBalance.balance.toFixed(2)} €
          </p>
        </div>
      )}

      <div className="mt-3 space-y-1.5">
        {balances
          .filter((b) => b.member_id !== currentMember.id)
          .map((b) => {
            const m = membersById[b.member_id]
            if (!m) return null
            return (
              <div key={b.member_id} className="flex items-center justify-between text-sm bg-white border border-slate-200 rounded-xl px-3 py-2">
                <span className="text-slate-600">
                  {m.avatar_emoji} {m.name}
                </span>
                <span className={`font-semibold ${b.balance >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                  {b.balance >= 0 ? '+' : ''}
                  {b.balance.toFixed(2)} €
                </span>
              </div>
            )
          })}
      </div>
      <p className="text-[11px] text-slate-300 mt-2 text-center">
        Miroir indicatif — les montants exacts et à jour restent dans Tricount.
      </p>
    </section>
  )
}

function PokerWidget({ poker, membersById, onAddGame, onSetResult, onDeleteGame, isArchived }) {
  const [showForm, setShowForm] = useState(false)
  const leaderboard = computeLeaderboard(poker, membersById)

  return (
    <section>
      <div className="flex items-center justify-between mb-2">
        <h2 className="text-sm font-bold text-slate-700 uppercase tracking-wide">Parties de poker</h2>
        {!isArchived && (
          <button onClick={() => setShowForm(true)} className="flex items-center gap-1 text-xs font-semibold text-indigo-600 active:opacity-70">
            <Plus size={14} /> Nouvelle partie
          </button>
        )}
      </div>

      {leaderboard.length > 0 && (
        <div className="bg-white border border-slate-200 rounded-2xl p-3.5 mb-3">
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

      {showForm && (
        <GameForm
          onClose={() => setShowForm(false)}
          onSubmit={onAddGame}
        />
      )}
    </section>
  )
}

function GameCard({ game, results, membersById, onSetResult, onDeleteGame, isArchived }) {
  const [editing, setEditing] = useState(false)
  const members = Object.values(membersById)

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

      <div className="mt-2 space-y-1">
        {members.map((m) => {
          const r = results.find((r) => r.member_id === m.id)
          return (
            <div key={m.id} className="flex items-center justify-between text-sm py-0.5">
              <span className="text-slate-600">
                {m.avatar_emoji} {m.name}
              </span>
              {editing ? (
                <input
                  type="number"
                  defaultValue={r?.net_result ?? ''}
                  placeholder="0"
                  inputMode="decimal"
                  onBlur={(e) => onSetResult(game.id, m.id, e.target.value === '' ? 0 : Number(e.target.value))}
                  className="w-20 text-right px-2 py-1 rounded-lg bg-slate-100 text-sm outline-none focus:ring-2 focus:ring-indigo-500"
                />
              ) : (
                <span className={`font-semibold ${r ? (r.net_result >= 0 ? 'text-emerald-600' : 'text-rose-600') : 'text-slate-300'}`}>
                  {r ? `${r.net_result >= 0 ? '+' : ''}${r.net_result} €` : '—'}
                </span>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

function GameForm({ onClose, onSubmit }) {
  const [date, setDate] = useState('')
  const [variant, setVariant] = useState("Texas Hold'em")
  const [buyIn, setBuyIn] = useState('10')
  const [saving, setSaving] = useState(false)

  const canSubmit = date && variant.trim()

  async function submit() {
    if (!canSubmit) return
    setSaving(true)
    try {
      await onSubmit({ game_date: date, variant: variant.trim(), buy_in: Number(buyIn) || 0 })
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
          <h2 className="text-lg font-bold text-slate-900">Nouvelle partie</h2>
          <button onClick={onClose} className="p-1 text-slate-400 active:text-slate-700">
            <X size={22} />
          </button>
        </div>
        <div className="space-y-3">
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="w-full px-4 py-3 rounded-xl bg-slate-100 text-sm outline-none focus:ring-2 focus:ring-indigo-500"
          />
          <input
            value={variant}
            onChange={(e) => setVariant(e.target.value)}
            placeholder="Variante (ex: Texas Hold'em)"
            className="w-full px-4 py-3 rounded-xl bg-slate-100 text-sm outline-none focus:ring-2 focus:ring-indigo-500"
          />
          <input
            type="number"
            inputMode="decimal"
            value={buyIn}
            onChange={(e) => setBuyIn(e.target.value)}
            placeholder="Cave / buy-in (€)"
            className="w-full px-4 py-3 rounded-xl bg-slate-100 text-sm outline-none focus:ring-2 focus:ring-indigo-500"
          />
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
