import { LogOut } from 'lucide-react'
import { useAuth } from '../auth/AuthContext'

export function Topbar() {
  const { user, logout } = useAuth()
  if (!user) return null

  const roleLabel = user.role === 'ADMIN' ? 'Admin' : 'Operator'
  const roleClass =
    user.role === 'ADMIN'
      ? 'bg-violet-100 text-violet-700'
      : 'bg-sky-100 text-sky-700'

  return (
    <header className="flex h-14 items-center justify-between border-b border-slate-200 bg-white px-6">
      <div>
        <p className="text-sm text-slate-500">Welcome back</p>
        <p className="font-medium text-slate-900">{user.name}</p>
      </div>
      <div className="flex items-center gap-3">
        <span
          className={`rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wide ${roleClass}`}
        >
          {roleLabel}
        </span>
        <button
          type="button"
          onClick={() => void logout()}
          className="flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-1.5 text-sm text-slate-600 transition hover:bg-slate-50"
        >
          <LogOut className="h-4 w-4" />
          Sign out
        </button>
      </div>
    </header>
  )
}
