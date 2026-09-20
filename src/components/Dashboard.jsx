import { Home, CalendarDays, ShoppingCart, Trophy, Wallet } from 'lucide-react'
import Avatar from './Avatar'

export default function Dashboard({ currentMember, weekend, lodging, agenda, shopping, poker, onNavigate }) {
  const pendingLodging = lodging.filter((p) => p.status === 'proposed').length
  const validated = lodging.find((p) => p.status === 'validated')
  const nextEvent = agenda[0]
  const shoppingDone = shopping.filter((s) => s.bought).length
  const shoppingTotal = shopping.length
  const myTasks = shopping.filter((s) => s.assigned_to === currentMember?.id && !s.bought)

  const leaderboard = computeLeaderboard(poker)
  const leader = leaderboard[0]

  return (
    <div className="px-4 pt-4 pb-6 space-y-4">
      <div>
        <h1 className="text-xl font-bold text-zinc-100">Salut {currentMember?.name} 👋</h1>
        <p className="text-sm text-zinc-500 mt-0.5">{weekend?.name}</p>
      </div>

      {myTasks.length > 0 && (
        <div className="bg-amber-500/10 border border-amber-800 rounded-2xl p-3.5">
          <p className="text-xs font-semibold text-amber-400 mb-1">À toi de jouer</p>
          <p className="text-sm text-amber-200">
            Tu t'es assigné : {myTasks.map((t) => t.label).join(', ')}
          </p>
        </div>
      )}

      <div className="grid grid-cols-2 gap-3">
        <Card
          icon={Home}
          color="indigo"
          title="Logements"
          onClick={() => onNavigate('lodging')}
        >
          {validated ? (
            <p className="text-sm font-semibold text-zinc-200 truncate">✅ {validated.title}</p>
          ) : (
            <p className="text-sm text-zinc-400">{pendingLodging} proposition{pendingLodging > 1 ? 's' : ''} en vote</p>
          )}
        </Card>

        <Card icon={CalendarDays} color="sky" title="Agenda" onClick={() => onNavigate('agenda')}>
          {nextEvent ? (
            <p className="text-sm text-zinc-400 truncate">
              {formatEventDay(nextEvent.day)} {nextEvent.start_time?.slice(0, 5)} · {nextEvent.title}
            </p>
          ) : (
            <p className="text-sm text-zinc-600">Rien de prévu</p>
          )}
        </Card>

        <Card icon={ShoppingCart} color="emerald" title="Courses" onClick={() => onNavigate('shopping')}>
          <p className="text-sm text-zinc-400">
            {shoppingDone}/{shoppingTotal} achetés
          </p>
        </Card>

        <Card icon={Wallet} color="rose" title="Dépenses" onClick={() => onNavigate('widgets')}>
          <p className="text-sm text-zinc-400">Ouvrir Tricount</p>
        </Card>
      </div>

      {leader && (
        <button
          onClick={() => onNavigate('poker')}
          className="w-full bg-zinc-800 border border-zinc-700 rounded-2xl p-4 flex items-center gap-3 active:bg-zinc-700 transition text-left"
        >
          <div className="w-10 h-10 rounded-full bg-amber-500/10 flex items-center justify-center shrink-0">
            <Trophy size={20} className="text-amber-400" />
          </div>
          <div className="flex-1 min-w-0 flex items-center gap-2">
            <Avatar member={leader.member} size="sm" />
            <div className="min-w-0">
              <p className="text-xs text-zinc-500 font-medium">Leader poker du week-end</p>
              <p className="text-sm font-semibold text-zinc-200 truncate">
                {leader.member.name} · {leader.total >= 0 ? '+' : ''}
                {leader.total} €
              </p>
            </div>
          </div>
        </button>
      )}
    </div>
  )
}

function formatEventDay(iso) {
  if (!iso) return ''
  const d = new Date(iso + 'T00:00:00')
  return d.toLocaleDateString('fr-FR', { weekday: 'short', day: '2-digit', month: '2-digit' })
}

function Card({ icon: Icon, color, title, children, onClick }) {
  const colors = {
    indigo: 'bg-amber-500/10 text-amber-400',
    sky: 'bg-sky-500/10 text-sky-400',
    emerald: 'bg-emerald-500/10 text-emerald-400',
    rose: 'bg-rose-500/10 text-rose-400',
  }
  return (
    <button
      onClick={onClick}
      className="bg-zinc-800 border border-zinc-700 rounded-2xl p-3.5 text-left active:bg-zinc-700 transition flex flex-col gap-2"
    >
      <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${colors[color]}`}>
        <Icon size={16} />
      </div>
      <div>
        <p className="text-xs font-semibold text-zinc-500">{title}</p>
        {children}
      </div>
    </button>
  )
}

function computeLeaderboard(poker) {
  const byMember = {}
  poker.results.forEach((r) => {
    byMember[r.member_id] = (byMember[r.member_id] || 0) + Number(r.net_result)
  })
  return Object.entries(byMember)
    .map(([member_id, total]) => ({ member_id, total, member: poker.membersById[member_id] }))
    .filter((e) => e.member)
    .sort((a, b) => b.total - a.total)
}
