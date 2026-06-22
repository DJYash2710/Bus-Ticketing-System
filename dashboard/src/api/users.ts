import { apiClient, unwrap } from './client'
import type { UserProfile } from '../types'

export async function getProfile() {
  const res = await apiClient.get('/users/me')
  return unwrap<UserProfile>(res)
}

export async function updateProfile(data: { name?: string; phone?: string | null }) {
  const res = await apiClient.patch('/users/me', data)
  return unwrap<UserProfile>(res)
}

export async function changePassword(data: {
  currentPassword: string
  newPassword: string
}) {
  const res = await apiClient.patch('/users/me/password', data)
  return unwrap<{ message: string }>(res)
}
