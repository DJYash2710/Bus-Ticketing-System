import { Bell, CircleHelp, Search } from 'lucide-react'
import { useAuth } from '../auth/AuthContext'
import { UserAvatar } from './UserAvatar'

export function Topbar() {
  const { user } = useAuth()
  if (!user) return null

  const roleLabel = user.role === 'ADMIN' ? 'ADMIN' : 'OPERATOR'

  return (
    <header className="flex h-16 items-center gap-4 border-b border-slate-200 bg-white px-6">
      <p className="hidden shrink-0 text-sm font-semibold text-slate-900 lg:block">
        TealTransit {user.role === 'ADMIN' ? 'Admin' : 'Operator'}
      </p>

      <div className="relative mx-auto w-full max-w-md flex-1">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
        <input
          type="search"
          placeholder="Search routes, buses, bookings..."
          className="w-full rounded-full border border-slate-200 bg-slate-50 py-2 pl-10 pr-4 text-sm text-slate-700 placeholder:text-slate-400 focus:border-brand focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-light"
          aria-label="Search"
        />
      </div>

      <div className="flex shrink-0 items-center gap-2">
        <span className="hidden rounded-full bg-brand-light px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-brand sm:inline">
          {roleLabel}
        </span>
        <button
          type="button"
          className="relative rounded-lg p-2 text-slate-500 transition hover:bg-slate-50 hover:text-slate-700"
          aria-label="Notifications"
        >
          <Bell className="h-5 w-5" />
          <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-red-500" />
        </button>
        <button
          type="button"
          className="rounded-lg p-2 text-slate-500 transition hover:bg-slate-50 hover:text-slate-700"
          aria-label="Help"
        >
          <CircleHelp className="h-5 w-5" />
        </button>
        <UserAvatar name={user.name} />
      </div>
    </header>
  )
}
