import { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { MapPin, Plus, Trash2 } from 'lucide-react'
import { listCities } from '../api/cities'
import {
  createBusStop,
  deleteBusStop,
  formatBusStopLabel,
  listBusStops,
} from '../api/busStops'
import { getErrorMessage } from '../api/client'
import { ConfirmDialog } from '../components/ConfirmDialog'
import { DataTable } from '../components/DataTable'
import { EmptyState } from '../components/EmptyState'
import { useToast } from '../hooks/useToast'

export function BusStops() {
  const { showToast } = useToast()
  const queryClient = useQueryClient()
  const [modalOpen, setModalOpen] = useState(false)
  const [name, setName] = useState('')
  const [locality, setLocality] = useState('')
  const [cityId, setCityId] = useState<number | ''>('')
  const [deleteId, setDeleteId] = useState<number | null>(null)

  const stopsQuery = useQuery({ queryKey: ['bus-stops'], queryFn: () => listBusStops() })
  const citiesQuery = useQuery({ queryKey: ['cities'], queryFn: listCities })

  const saveMutation = useMutation({
    mutationFn: () =>
      createBusStop({
        name,
        locality,
        cityId: Number(cityId),
      }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['bus-stops'] })
      setModalOpen(false)
      setName('')
      setLocality('')
      setCityId('')
      showToast('Bus stop added', 'success')
    },
    onError: (err) => showToast(getErrorMessage(err), 'error'),
  })

  const deleteMutation = useMutation({
    mutationFn: (id: number) => deleteBusStop(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['bus-stops'] })
      setDeleteId(null)
      showToast('Bus stop removed', 'success')
    },
    onError: (err) => showToast(getErrorMessage(err), 'error'),
  })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">Bus Stops</h1>
          <p className="text-sm text-slate-500">Pickup and drop points within each city</p>
        </div>
        <button
          type="button"
          onClick={() => setModalOpen(true)}
          className="flex items-center gap-2 rounded-lg bg-brand px-4 py-2 text-sm font-medium text-white"
        >
          <Plus className="h-4 w-4" />
          Add Bus Stop
        </button>
      </div>

      {stopsQuery.isLoading ? (
        <DataTable columns={[]} data={[]} keyExtractor={() => ''} loading />
      ) : (stopsQuery.data?.length ?? 0) === 0 ? (
        <EmptyState
          icon={MapPin}
          title="No bus stops"
          description="Add 2–3 stops per city so passengers can pick boarding and dropping points."
        />
      ) : (
        <DataTable
          data={stopsQuery.data ?? []}
          keyExtractor={(s) => s.id}
          columns={[
            {
              key: 'label',
              header: 'Stop',
              render: (s) => formatBusStopLabel(s),
            },
            {
              key: 'city',
              header: 'City',
              render: (s) => s.city?.name ?? citiesQuery.data?.find((c) => c.id === s.cityId)?.name ?? s.cityId,
            },
            {
              key: 'actions',
              header: '',
              render: (s) => (
                <button
                  type="button"
                  onClick={() => setDeleteId(s.id)}
                  className="text-red-600 hover:text-red-800"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              ),
            },
          ]}
        />
      )}

      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl">
            <h2 className="text-lg font-semibold">Add Bus Stop</h2>
            <div className="mt-4 space-y-3">
              <input
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                placeholder="Bus stop name"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
              <input
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                placeholder="Locality / area (e.g. Malad)"
                value={locality}
                onChange={(e) => setLocality(e.target.value)}
              />
              <select
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                value={cityId}
                onChange={(e) => setCityId(e.target.value ? Number(e.target.value) : '')}
              >
                <option value="">Select city</option>
                {(citiesQuery.data ?? []).map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="mt-6 flex justify-end gap-2">
              <button
                type="button"
                className="rounded-lg px-4 py-2 text-sm text-slate-600"
                onClick={() => setModalOpen(false)}
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={!name || !locality || cityId === '' || saveMutation.isPending}
                onClick={() => saveMutation.mutate()}
                className="rounded-lg bg-brand px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}

      <ConfirmDialog
        open={deleteId != null}
        title="Delete bus stop?"
        message="Routes using this stop may need to be updated."
        onCancel={() => setDeleteId(null)}
        onConfirm={() => deleteId != null && deleteMutation.mutate(deleteId)}
      />
    </div>
  )
}
