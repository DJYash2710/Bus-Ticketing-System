import { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { MapPin, Pencil, Plus, Trash2 } from 'lucide-react'
import { createCity, deleteCity, listCities, updateCity } from '../../api/cities'
import { getErrorMessage } from '../../api/client'
import { ConfirmDialog } from '../../components/ConfirmDialog'
import { DataTable } from '../../components/DataTable'
import { EmptyState } from '../../components/EmptyState'
import { useToast } from '../../hooks/useToast'
import { validateCityForm } from '../../lib/validation'
import type { City } from '../../types'

export function Cities() {
  const { showToast } = useToast()
  const queryClient = useQueryClient()
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState<City | null>(null)
  const [name, setName] = useState('')
  const [state, setState] = useState('')
  const [country, setCountry] = useState('India')
  const [deleteTarget, setDeleteTarget] = useState<City | null>(null)

  const citiesQuery = useQuery({ queryKey: ['cities'], queryFn: listCities })

  const saveMutation = useMutation({
    mutationFn: async () => {
      const validation = validateCityForm({ name, state, country })
      if (!validation.ok) throw new Error(validation.message)
      if (editing) {
        return updateCity(editing.id, { name, state: state || null, country: country || null })
      }
      return createCity({ name, state: state || null, country: country || 'India' })
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['cities'] })
      setModalOpen(false)
      setEditing(null)
      showToast('City saved', 'success')
    },
    onError: (err) => showToast(getErrorMessage(err), 'error'),
  })

  const deleteMutation = useMutation({
    mutationFn: (id: number) => deleteCity(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['cities'] })
      setDeleteTarget(null)
      showToast('City deleted', 'success')
    },
    onError: (err) => showToast(getErrorMessage(err), 'error'),
  })

  function openEdit(city: City) {
    setEditing(city)
    setName(city.name)
    setState(city.state ?? '')
    setCountry(city.country ?? 'India')
    setModalOpen(true)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">Cities</h1>
          <p className="text-sm text-slate-500">Manage cities served by the platform</p>
        </div>
        <button
          type="button"
          onClick={() => {
            setEditing(null)
            setName('')
            setState('')
            setCountry('India')
            setModalOpen(true)
          }}
          className="flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white"
        >
          <Plus className="h-4 w-4" />
          Add city
        </button>
      </div>

      {citiesQuery.isLoading ? (
        <DataTable columns={[]} data={[]} keyExtractor={() => ''} loading />
      ) : (citiesQuery.data?.length ?? 0) === 0 ? (
        <EmptyState
          icon={MapPin}
          title="No cities"
          description="Add cities before creating bus routes between them."
        />
      ) : (
        <DataTable
          data={citiesQuery.data ?? []}
          keyExtractor={(c) => c.id}
          columns={[
            { key: 'name', header: 'Name', render: (c) => c.name },
            { key: 'state', header: 'State', render: (c) => c.state ?? '—' },
            { key: 'country', header: 'Country', render: (c) => c.country ?? '—' },
            {
              key: 'actions',
              header: '',
              render: (c) => (
                <div className="flex justify-end gap-2">
                  <button type="button" onClick={() => openEdit(c)} className="text-slate-500 hover:text-slate-700">
                    <Pencil className="h-4 w-4" />
                  </button>
                  <button type="button" onClick={() => setDeleteTarget(c)} className="text-red-500">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ),
            },
          ]}
        />
      )}

      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl">
            <h2 className="text-lg font-semibold">{editing ? 'Edit city' : 'Add city'}</h2>
            <form
              className="mt-4 space-y-3"
              onSubmit={(e) => {
                e.preventDefault()
                saveMutation.mutate()
              }}
            >
              <input
                placeholder="City name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full rounded-lg border px-3 py-2 text-sm"
                required
              />
              <input
                placeholder="State"
                value={state}
                onChange={(e) => setState(e.target.value)}
                className="w-full rounded-lg border px-3 py-2 text-sm"
              />
              <input
                placeholder="Country"
                value={country}
                onChange={(e) => setCountry(e.target.value)}
                className="w-full rounded-lg border px-3 py-2 text-sm"
              />
              <div className="flex justify-end gap-2 pt-2">
                <button type="button" onClick={() => setModalOpen(false)} className="rounded-lg border px-4 py-2 text-sm">
                  Cancel
                </button>
                <button type="submit" className="rounded-lg bg-indigo-600 px-4 py-2 text-sm text-white">
                  Save
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <ConfirmDialog
        open={!!deleteTarget}
        title="Delete city?"
        message={`Remove ${deleteTarget?.name}?`}
        confirmLabel="Delete"
        loading={deleteMutation.isPending}
        onConfirm={() => deleteTarget && deleteMutation.mutate(deleteTarget.id)}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  )
}
