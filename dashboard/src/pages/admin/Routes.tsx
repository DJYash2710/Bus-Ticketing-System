// Bus routes between cities — NOT related to React Router navigation.

import { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Map, Pencil, Plus, Trash2 } from 'lucide-react'
import { listCities } from '../../api/cities'
import { createRoute, deleteRoute, listRoutes, updateRoute } from '../../api/routes'
import { getErrorMessage } from '../../api/client'
import { ConfirmDialog } from '../../components/ConfirmDialog'
import { DataTable } from '../../components/DataTable'
import { EmptyState } from '../../components/EmptyState'
import { useToast } from '../../hooks/useToast'
import { validateRouteForm } from '../../lib/validation'
import type { Route } from '../../types'

export function Routes() {
  const { showToast } = useToast()
  const queryClient = useQueryClient()
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState<Route | null>(null)
  const [code, setCode] = useState('')
  const [fromCityId, setFromCityId] = useState<number | ''>('')
  const [toCityId, setToCityId] = useState<number | ''>('')
  const [distanceKm, setDistanceKm] = useState<number | ''>('')
  const [durationMin, setDurationMin] = useState<number | ''>('')
  const [deleteTarget, setDeleteTarget] = useState<Route | null>(null)

  const routesQuery = useQuery({ queryKey: ['routes'], queryFn: listRoutes })
  const citiesQuery = useQuery({ queryKey: ['cities'], queryFn: listCities })

  const saveMutation = useMutation({
    mutationFn: async () => {
      const payload = {
        code,
        fromCityId: Number(fromCityId),
        toCityId: Number(toCityId),
        distanceKm: distanceKm !== '' ? Number(distanceKm) : undefined,
        durationMin: durationMin !== '' ? Number(durationMin) : undefined,
      }
      const validation = validateRouteForm(payload)
      if (!validation.ok) throw new Error(validation.message)

      if (editing) {
        return updateRoute(editing.id, {
          distanceKm: payload.distanceKm,
          durationMin: payload.durationMin,
        })
      }
      return createRoute(payload)
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['routes'] })
      setModalOpen(false)
      setEditing(null)
      showToast('Route saved', 'success')
    },
    onError: (err) => showToast(getErrorMessage(err), 'error'),
  })

  const deleteMutation = useMutation({
    mutationFn: (id: number) => deleteRoute(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['routes'] })
      setDeleteTarget(null)
      showToast('Route deleted', 'success')
    },
    onError: (err) => showToast(getErrorMessage(err), 'error'),
  })

  function openEdit(route: Route) {
    setEditing(route)
    setCode(route.code)
    setFromCityId(route.fromCityId)
    setToCityId(route.toCityId)
    setDistanceKm(route.distanceKm ?? '')
    setDurationMin(route.durationMin ?? '')
    setModalOpen(true)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">Routes</h1>
          <p className="text-sm text-slate-500">Bus routes between cities on the network</p>
        </div>
        <button
          type="button"
          onClick={() => {
            setEditing(null)
            setCode('')
            setFromCityId('')
            setToCityId('')
            setDistanceKm('')
            setDurationMin('')
            setModalOpen(true)
          }}
          className="flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white"
        >
          <Plus className="h-4 w-4" />
          Add route
        </button>
      </div>

      {routesQuery.isLoading ? (
        <DataTable columns={[]} data={[]} keyExtractor={() => ''} loading />
      ) : (routesQuery.data?.length ?? 0) === 0 ? (
        <EmptyState
          icon={Map}
          title="No routes"
          description="Create routes connecting cities so operators can schedule trips."
        />
      ) : (
        <DataTable
          data={routesQuery.data ?? []}
          keyExtractor={(r) => r.id}
          columns={[
            { key: 'code', header: 'Code', render: (r) => r.code },
            {
              key: 'from',
              header: 'From',
              render: (r) => r.fromCity?.name ?? `#${r.fromCityId}`,
            },
            {
              key: 'to',
              header: 'To',
              render: (r) => r.toCity?.name ?? `#${r.toCityId}`,
            },
            { key: 'dist', header: 'Distance', render: (r) => (r.distanceKm ? `${r.distanceKm} km` : '—') },
            {
              key: 'actions',
              header: '',
              render: (r) => (
                <div className="flex justify-end gap-2">
                  <button type="button" onClick={() => openEdit(r)}>
                    <Pencil className="h-4 w-4 text-slate-500" />
                  </button>
                  <button type="button" onClick={() => setDeleteTarget(r)}>
                    <Trash2 className="h-4 w-4 text-red-500" />
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
            <h2 className="text-lg font-semibold">{editing ? 'Edit route' : 'New route'}</h2>
            <form
              className="mt-4 space-y-3"
              onSubmit={(e) => {
                e.preventDefault()
                saveMutation.mutate()
              }}
            >
              {!editing && (
                <>
                  <input
                    placeholder="Route code"
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    className="w-full rounded-lg border px-3 py-2 text-sm"
                    required
                  />
                  <select
                    value={fromCityId}
                    onChange={(e) => setFromCityId(Number(e.target.value))}
                    className="w-full rounded-lg border px-3 py-2 text-sm"
                    required
                  >
                    <option value="">From city</option>
                    {citiesQuery.data?.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                  <select
                    value={toCityId}
                    onChange={(e) => setToCityId(Number(e.target.value))}
                    className="w-full rounded-lg border px-3 py-2 text-sm"
                    required
                  >
                    <option value="">To city</option>
                    {citiesQuery.data?.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </>
              )}
              <input
                type="number"
                placeholder="Distance (km)"
                value={distanceKm}
                onChange={(e) => setDistanceKm(e.target.value ? Number(e.target.value) : '')}
                className="w-full rounded-lg border px-3 py-2 text-sm"
              />
              <input
                type="number"
                placeholder="Duration (minutes)"
                value={durationMin}
                onChange={(e) => setDurationMin(e.target.value ? Number(e.target.value) : '')}
                className="w-full rounded-lg border px-3 py-2 text-sm"
              />
              <div className="flex justify-end gap-2">
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
        title="Delete route?"
        message={`Remove route ${deleteTarget?.code}?`}
        confirmLabel="Delete"
        loading={deleteMutation.isPending}
        onConfirm={() => deleteTarget && deleteMutation.mutate(deleteTarget.id)}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  )
}
