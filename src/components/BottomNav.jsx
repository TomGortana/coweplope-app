import { LayoutDashboard, Home, CalendarDays, ShoppingCart, Wallet, Spade } from 'lucide-react'

const TABS = [
  { key: 'dashboard', label: 'Accueil', icon: LayoutDashboard },
  { key: 'lodging', label: 'Logements', icon: Home },
  { key: 'agenda', label: 'Agenda', icon: CalendarDays },
  { key: 'shopping', label: 'Courses', icon: ShoppingCart },
  { key: 'widgets', label: 'Dépenses', icon: Wallet },
  { key: 'poker', label: 'Poker', icon: Spade },
]

export default function BottomNav({ active, onChange }) {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-zinc-700 border-t border-zinc-600 pb-[env(safe-area-inset-bottom)]">
      <div className="grid grid-cols-6">
        {TABS.map(({ key, label, icon: Icon }) => {
          const isActive = active === key
          return (
            <button
              key={key}
              onClick={() => onChange(key)}
              className={`flex flex-col items-center justify-center gap-1 py-2.5 active:bg-zinc-600 transition ${
                isActive ? 'text-copper-400' : 'text-zinc-500'
              }`}
            >
              <Icon size={22} strokeWidth={isActive ? 2.5 : 2} />
              <span className={`text-[11px] ${isActive ? 'font-semibold' : 'font-medium'}`}>{label}</span>
            </button>
          )
        })}
      </div>
    </nav>
  )
}
