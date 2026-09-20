import { LayoutDashboard, Home, CalendarDays, ShoppingCart, Wallet } from 'lucide-react'

const TABS = [
  { key: 'dashboard', label: 'Accueil', icon: LayoutDashboard },
  { key: 'lodging', label: 'Logements', icon: Home },
  { key: 'agenda', label: 'Agenda', icon: CalendarDays },
  { key: 'shopping', label: 'Courses', icon: ShoppingCart },
  { key: 'widgets', label: 'Widgets', icon: Wallet },
]

export default function BottomNav({ active, onChange }) {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-slate-200 pb-[env(safe-area-inset-bottom)]">
      <div className="grid grid-cols-5">
        {TABS.map(({ key, label, icon: Icon }) => {
          const isActive = active === key
          return (
            <button
              key={key}
              onClick={() => onChange(key)}
              className={`flex flex-col items-center justify-center gap-1 py-2.5 active:bg-slate-50 transition ${
                isActive ? 'text-indigo-600' : 'text-slate-400'
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
