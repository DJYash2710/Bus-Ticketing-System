import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import * as authApi from '../api/auth'
import * as usersApi from '../api/users'
import { decodeAccessToken } from '../lib/jwt'
import { clearTokens, getAccessToken, setTokens } from '../lib/storage'
import type { AuthUser, UserRole } from '../types'

interface AuthContextValue {
  user: AuthUser | null
  isLoading: boolean
  isAuthenticated: boolean
  login: (email: string, password: string) => Promise<void>
  logout: () => Promise<void>
  refreshProfile: () => Promise<void>
  hasRole: (...roles: UserRole[]) => boolean
}

const AuthContext = createContext<AuthContextValue | null>(null)

function buildUser(
  profile: { id: number; name: string; email: string; role: UserRole; phone?: string | null },
  busOperatorId?: number | null,
): AuthUser {
  return {
    id: profile.id,
    name: profile.name,
    email: profile.email,
    role: profile.role,
    phone: profile.phone,
    busOperatorId,
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  const hydrate = useCallback(async () => {
    const token = getAccessToken()
    if (!token) {
      setUser(null)
      setIsLoading(false)
      return
    }

    try {
      const payload = decodeAccessToken(token)
      const profile = await usersApi.getProfile()
      if (profile.role !== 'ADMIN' && profile.role !== 'OPERATOR') {
        clearTokens()
        setUser(null)
        return
      }
      setUser(
        buildUser(profile, payload.busOperatorId ?? null),
      )
    } catch {
      clearTokens()
      setUser(null)
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    void hydrate()
  }, [hydrate])

  const login = useCallback(async (email: string, password: string) => {
    const result = await authApi.login(email, password)
    if (result.user.role !== 'ADMIN' && result.user.role !== 'OPERATOR') {
      throw new Error('This dashboard is for admin and operator accounts only')
    }
    setTokens(result.tokens.accessToken, result.tokens.refreshToken)
    const payload = decodeAccessToken(result.tokens.accessToken)
    setUser(buildUser(result.user, payload.busOperatorId ?? null))
  }, [])

  const logout = useCallback(async () => {
    try {
      await authApi.logout()
    } catch {
      // ignore
    } finally {
      clearTokens()
      setUser(null)
    }
  }, [])

  const refreshProfile = useCallback(async () => {
    const token = getAccessToken()
    if (!token) return
    const payload = decodeAccessToken(token)
    const profile = await usersApi.getProfile()
    setUser(buildUser(profile, payload.busOperatorId ?? null))
  }, [])

  const hasRole = useCallback(
    (...roles: UserRole[]) => (user ? roles.includes(user.role) : false),
    [user],
  )

  const value = useMemo(
    () => ({
      user,
      isLoading,
      isAuthenticated: !!user,
      login,
      logout,
      refreshProfile,
      hasRole,
    }),
    [user, isLoading, login, logout, refreshProfile, hasRole],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
