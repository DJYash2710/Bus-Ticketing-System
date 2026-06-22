import { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Plus, Users } from 'lucide-react'
import { createOperator, listOperators } from '../../api/operators'
import { getErrorMessage } from '../../api/client'
import { DataTable } from '../../components/DataTable'
import { EmptyState } from '../../components/EmptyState'
import { useToast } from '../../hooks/useToast'
import { validateOperatorForm } from '../../lib/validation'

export function Operators() {
  const { showToast } = useToast()
  const queryClient = useQueryClient()
  const [modalOpen, setModalOpen] = useState(false)
  const [companyName, setCompanyName] = useState('')
  const [contactEmail, setContactEmail] = useState('')
  const [contactPhone, setContactPhone] = useState('')
  const [userName, setUserName] = useState('')
  const [userEmail, setUserEmail] = useState('')
  const [userPhone, setUserPhone] = useState('')
  const [userPassword, setUserPassword] = useState('')

  const operatorsQuery = useQuery({ queryKey: ['operators'], queryFn: listOperators })

  const createMutation = useMutation({
    mutationFn: async () => {
      const payload = {
        companyName,
        contactEmail: contactEmail || undefined,
        contactPhone: contactPhone || undefined,
        operatorUser: {
          name: userName,
          email: userEmail,
          phone: userPhone || undefined,
          password: userPassword,
        },
      }
      const validation = validateOperatorForm(payload)
      if (!validation.ok) throw new Error(validation.message)
      return createOperator(payload)
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['operators'] })
      setModalOpen(false)
      setCompanyName('')
      setContactEmail('')
      setContactPhone('')
      setUserName('')
      setUserEmail('')
      setUserPhone('')
      setUserPassword('')
      showToast('Operator company created', 'success')
    },
    onError: (err) => showToast(getErrorMessage(err), 'error'),
  })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">Operators</h1>
          <p className="text-sm text-slate-500">
            Bus operator companies and their login accounts
          </p>
        </div>
        <button
          type="button"
          onClick={() => setModalOpen(true)}
          className="flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white"
        >
          <Plus className="h-4 w-4" />
          New operator
        </button>
      </div>

      {operatorsQuery.isLoading ? (
        <DataTable columns={[]} data={[]} keyExtractor={() => ''} loading />
      ) : (operatorsQuery.data?.length ?? 0) === 0 ? (
        <EmptyState
          icon={Users}
          title="No operators"
          description="Onboard a bus operator company and create their first login."
        />
      ) : (
        <DataTable
          data={operatorsQuery.data ?? []}
          keyExtractor={(o) => o.id}
          columns={[
            { key: 'name', header: 'Company', render: (o) => o.name },
            { key: 'email', header: 'Contact email', render: (o) => o.contactEmail ?? '—' },
            { key: 'buses', header: 'Buses', render: (o) => o.busCount ?? 0 },
            {
              key: 'users',
              header: 'Login accounts',
              render: (o) =>
                o.users?.map((u) => `${u.name} (${u.email})`).join(', ') ?? '—',
            },
          ]}
        />
      )}

      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-xl bg-white p-6 shadow-xl">
            <h2 className="text-lg font-semibold">New operator company</h2>
            <form
              className="mt-4 space-y-4"
              onSubmit={(e) => {
                e.preventDefault()
                createMutation.mutate()
              }}
            >
              <fieldset className="space-y-3">
                <legend className="text-sm font-medium text-slate-700">Company</legend>
                <input
                  placeholder="Company name"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  className="w-full rounded-lg border px-3 py-2 text-sm"
                  required
                />
                <input
                  placeholder="Contact email (optional)"
                  value={contactEmail}
                  onChange={(e) => setContactEmail(e.target.value)}
                  className="w-full rounded-lg border px-3 py-2 text-sm"
                />
                <input
                  placeholder="Contact phone (optional)"
                  value={contactPhone}
                  onChange={(e) => setContactPhone(e.target.value)}
                  className="w-full rounded-lg border px-3 py-2 text-sm"
                />
              </fieldset>
              <fieldset className="space-y-3 border-t border-slate-100 pt-4">
                <legend className="text-sm font-medium text-slate-700">First login account</legend>
                <input
                  placeholder="Full name"
                  value={userName}
                  onChange={(e) => setUserName(e.target.value)}
                  className="w-full rounded-lg border px-3 py-2 text-sm"
                  required
                />
                <input
                  type="email"
                  placeholder="Email"
                  value={userEmail}
                  onChange={(e) => setUserEmail(e.target.value)}
                  className="w-full rounded-lg border px-3 py-2 text-sm"
                  required
                />
                <input
                  placeholder="Phone (optional)"
                  value={userPhone}
                  onChange={(e) => setUserPhone(e.target.value)}
                  className="w-full rounded-lg border px-3 py-2 text-sm"
                />
                <input
                  type="password"
                  placeholder="Password (min 8 chars)"
                  value={userPassword}
                  onChange={(e) => setUserPassword(e.target.value)}
                  className="w-full rounded-lg border px-3 py-2 text-sm"
                  required
                />
              </fieldset>
              <div className="flex justify-end gap-2">
                <button type="button" onClick={() => setModalOpen(false)} className="rounded-lg border px-4 py-2 text-sm">
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={createMutation.isPending}
                  className="rounded-lg bg-indigo-600 px-4 py-2 text-sm text-white disabled:opacity-50"
                >
                  Create
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
