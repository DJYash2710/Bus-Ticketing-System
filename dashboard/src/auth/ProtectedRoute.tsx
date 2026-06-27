import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from './AuthContext'
import type { UserRole } from '../types'

interface ProtectedRouteProps {
  roles?: UserRole[]
}

export function ProtectedRoute({ roles }: ProtectedRouteProps) {
  const { isAuthenticated, isLoading, user } = useAuth()
  const location = useLocation()

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-brand-light border-t-brand" />
      </div>
    )
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  if (roles && user && !roles.includes(user.role)) {
    return <Navigate to="/" replace />
  }

  return <Outlet />
}
