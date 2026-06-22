import { useEffect, useState } from 'react'
import { useMutation } from '@tanstack/react-query'
import { changePassword, getProfile, updateProfile } from '../api/users'
import { getErrorMessage } from '../api/client'
import { useAuth } from '../auth/AuthContext'
import { useToast } from '../hooks/useToast'
import {
  validateChangePassword,
  validateName,
  validatePhone,
} from '../lib/validation'

export function Profile() {
  const { refreshProfile } = useAuth()
  const { showToast } = useToast()

  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(true)

  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')

  useEffect(() => {
    void getProfile()
      .then((p) => {
        setName(p.name)
        setPhone(p.phone ?? '')
        setEmail(p.email)
      })
      .catch(() => showToast('Failed to load profile', 'error'))
      .finally(() => setLoading(false))
  }, [showToast])

  const profileMutation = useMutation({
    mutationFn: () => {
      const nameCheck = validateName(name)
      if (!nameCheck.ok) throw new Error(nameCheck.message)
      const phoneCheck = validatePhone(phone)
      if (!phoneCheck.ok) throw new Error(phoneCheck.message)
      return updateProfile({ name, phone: phone || null })
    },
    onSuccess: async () => {
      await refreshProfile()
      showToast('Profile updated', 'success')
    },
    onError: (err) => showToast(getErrorMessage(err), 'error'),
  })

  const passwordMutation = useMutation({
    mutationFn: () => {
      const check = validateChangePassword({ currentPassword, newPassword })
      if (!check.ok) throw new Error(check.message)
      return changePassword({ currentPassword, newPassword })
    },
    onSuccess: () => {
      setCurrentPassword('')
      setNewPassword('')
      showToast('Password changed', 'success')
    },
    onError: (err) => showToast(getErrorMessage(err), 'error'),
  })

  if (loading) {
    return <div className="text-sm text-slate-500">Loading profile...</div>
  }

  return (
    <div className="mx-auto max-w-2xl space-y-8">
      <div>
        <h1 className="text-2xl font-semibold text-slate-900">Profile</h1>
        <p className="text-sm text-slate-500">Update your account details</p>
      </div>

      <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="font-medium text-slate-900">Personal info</h2>
        <form
          className="mt-4 space-y-4"
          onSubmit={(e) => {
            e.preventDefault()
            profileMutation.mutate()
          }}
        >
          <div>
            <label className="mb-1 block text-sm font-medium">Email</label>
            <input
              value={email}
              disabled
              className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-500"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium">Name</label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium">Phone</label>
            <input
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
              placeholder="Optional"
            />
          </div>
          <button
            type="submit"
            disabled={profileMutation.isPending}
            className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
          >
            Save changes
          </button>
        </form>
      </section>

      <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="font-medium text-slate-900">Change password</h2>
        <form
          className="mt-4 space-y-4"
          onSubmit={(e) => {
            e.preventDefault()
            passwordMutation.mutate()
          }}
        >
          <div>
            <label className="mb-1 block text-sm font-medium">Current password</label>
            <input
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium">New password</label>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
            />
          </div>
          <button
            type="submit"
            disabled={passwordMutation.isPending}
            className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
          >
            Update password
          </button>
        </form>
      </section>
    </div>
  )
}
