import { useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { Bus, Lock, Mail } from 'lucide-react'
import { useAuth } from '../auth/AuthContext'
import { getErrorMessage } from '../api/client'
import { validateEmail, validatePassword } from '../lib/validation'

export function Login() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const from = (location.state as { from?: { pathname: string } })?.from?.pathname ?? '/'

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')

    const emailCheck = validateEmail(email)
    if (!emailCheck.ok) {
      setError(emailCheck.message)
      return
    }
    const pwCheck = validatePassword(password)
    if (!pwCheck.ok) {
      setError(pwCheck.message)
      return
    }

    setLoading(true)
    try {
      await login(email, password)
      navigate(from, { replace: true })
    } catch (err) {
      setError(getErrorMessage(err))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-8 shadow-xl">
      <div className="mb-8 flex flex-col items-center text-center">
        <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-light text-brand">
          <Bus className="h-7 w-7" />
        </div>
        <h1 className="text-xl font-bold text-slate-900">TealTransit Operations</h1>
        <p className="mt-1 text-sm text-slate-500">Admin & operator sign in</p>
      </div>

      <form onSubmit={(e) => void handleSubmit(e)} className="space-y-4">
        {error && (
          <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
            {error}
          </div>
        )}
        <div>
          <label htmlFor="email" className="mb-1.5 block text-sm font-medium text-slate-700">
            Email Address
          </label>
          <div className="relative">
            <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="input-field-icon"
              placeholder="operator@tealtransit.com"
              autoComplete="email"
            />
          </div>
        </div>
        <div>
          <label htmlFor="password" className="mb-1.5 block text-sm font-medium text-slate-700">
            Password
          </label>
          <div className="relative">
            <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="input-field-icon"
              placeholder="••••••••"
              autoComplete="current-password"
            />
          </div>
        </div>
        <button type="submit" disabled={loading} className="btn-primary w-full py-2.5">
          {loading ? 'Signing in...' : 'Sign In'}
        </button>
      </form>
      <p className="mt-6 text-center text-xs text-slate-400">
        Authorized personnel only. Secure connection.
      </p>
    </div>
  )
}
