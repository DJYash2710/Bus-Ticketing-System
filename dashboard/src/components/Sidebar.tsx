import { NavLink } from 'react-router-dom'
import { Bus, LogOut } from 'lucide-react'
import { useAuth } from '../auth/AuthContext'
import { getNavSectionsForRole } from '../lib/nav'

export function Sidebar() {
  const { user, logout } = useAuth()
  if (!user) return null

  const sections = getNavSectionsForRole(user.role)

  return (
    <aside className="flex w-64 shrink-0 flex-col border-r border-slate-200 bg-white">
      <div className="border-b border-slate-200 px-5 py-5">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand text-white shadow-sm">
            <Bus className="h-5 w-5" />
          </div>
          <div>
            <p className="text-sm font-bold tracking-tight text-slate-900">TealTransit</p>
            <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-400">
              Operations Hub
            </p>
          </div>
        </div>
      </div>

      <nav className="flex-1 overflow-y-auto px-3 py-4">
        {sections.map((section) => (
          <div key={section.label} className="mb-5 last:mb-0">
            <p className="mb-2 px-3 text-[10px] font-semibold uppercase tracking-widest text-slate-400">
              {section.label}
            </p>
            <div className="space-y-0.5">
              {section.items.map((item) => (
                <NavLink
                  key={item.path}
                  to={item.path}
                  end={item.path === '/'}
                  className={({ isActive }) =>
                    `relative flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                      isActive
                        ? 'bg-brand-light text-brand'
                        : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                    }`
                  }
                >
                  {({ isActive }) => (
                    <>
                      {isActive && (
                        <span className="absolute left-0 top-1/2 h-6 w-1 -translate-y-1/2 rounded-r-full bg-brand" />
                      )}
                      <item.icon className="h-4 w-4 shrink-0" />
                      {item.label}
                    </>
                  )}
                </NavLink>
              ))}
            </div>
          </div>
        ))}
      </nav>

      <div className="border-t border-slate-200 p-3">
        <button
          type="button"
          onClick={() => void logout()}
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-red-600 transition hover:bg-red-50"
        >
          <LogOut className="h-4 w-4" />
          Logout
        </button>
      </div>
    </aside>
  )
}
