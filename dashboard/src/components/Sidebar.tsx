import { NavLink } from 'react-router-dom'
import { useAuth } from '../auth/AuthContext'
import { getNavItemsForRole } from '../lib/nav'
import { Bus } from 'lucide-react'

export function Sidebar() {
  const { user } = useAuth()
  if (!user) return null

  const items = getNavItemsForRole(user.role)

  return (
    <aside className="flex w-64 shrink-0 flex-col border-r border-slate-200 bg-white">
      <div className="flex items-center gap-2 border-b border-slate-200 px-5 py-4">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-600 text-white">
          <Bus className="h-5 w-5" />
        </div>
        <div>
          <p className="text-sm font-semibold text-slate-900">Bus Dashboard</p>
          <p className="text-xs text-slate-500">Fleet management</p>
        </div>
      </div>
      <nav className="flex-1 space-y-1 p-3">
        {items.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            end={item.path === '/'}
            className={({ isActive }) =>
              `flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-indigo-50 text-indigo-700'
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
              }`
            }
          >
            <item.icon className="h-4 w-4 shrink-0" />
            {item.label}
          </NavLink>
        ))}
      </nav>
    </aside>
  )
}
