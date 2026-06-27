import { Outlet } from 'react-router-dom'

export function AuthLayout() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-brand-light via-white to-slate-50 p-4">
      <Outlet />
    </div>
  )
}
