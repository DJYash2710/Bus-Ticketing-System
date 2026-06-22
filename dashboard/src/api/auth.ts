import { apiClient, unwrap } from './client'
import type { LoginResponse } from '../types'

export async function login(email: string, password: string) {
  const res = await apiClient.post('/auth/login', { email, password })
  return unwrap<LoginResponse>(res)
}

export async function logout() {
  const res = await apiClient.post('/auth/logout')
  return unwrap<{ message: string }>(res)
}

export async function refresh(refreshToken: string) {
  const res = await apiClient.post('/auth/refresh', { refreshToken })
  return unwrap<LoginResponse>(res)
}
