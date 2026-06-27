import { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Bus, Pencil, Plus, Trash2, Wrench } from 'lucide-react'
import { createBus, deleteBus, listBuses, updateBus } from '../api/buses'
import { listOperators } from '../api/operators'
import { getErrorMessage } from '../api/client'
import { useAuth } from '../auth/AuthContext'
import { ConfirmDialog } from '../components/ConfirmDialog'
import { DataTable } from '../components/DataTable'
import { EmptyState } from '../components/EmptyState'
import { PageHeader } from '../components/PageHeader'
import { StatCard } from '../components/StatCard'
import { StatusBadge, busTypeVariant } from '../components/StatusBadge'
import { useToast } from '../hooks/useToast'
import { validateBusForm } from '../lib/validation'
import type { Bus as BusType, BusType as BusTypeEnum } from '../types'

const BUS_TYPES: { value: BusTypeEnum; label: string; icon: string }[] = [
  { value: 'SEATER', label: 'Seater', icon: '🪑' },
  { value: 'SLEEPER', label: 'Sleeper', icon: '🛏️' },
  { value: 'SEMI_SLEEPER', label: 'Semi-Sleeper', icon: '💺' },
  { value: 'AC', label: 'AC', icon: '❄️' },
]

interface BusFormState {
  registrationNo: string
  name: string
  capacity: number
  type: BusTypeEnum
  operatorId: number | ''
}

const emptyForm: BusFormState = {
  registrationNo: '',
  name: '',
  capacity: 40,
  type: 'SEATER',
  operatorId: '',
}

export function Buses() {
  const { hasRole } = useAuth()
  const { showToast } = useToast()
  const queryClient = useQueryClient()
  const isAdmin = hasRole('ADMIN')

  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState<BusType | null>(null)
  const [form, setForm] = useState<BusFormState>(emptyForm)
  const [formError, setFormError] = useState('')
  const [deleteTarget, setDeleteTarget] = useState<BusType | null>(null)

  const busesQuery = useQuery({ queryKey: ['buses'], queryFn: listBuses })
  const operatorsQuery = useQuery({
    queryKey: ['operators'],
    queryFn: listOperators,
    enabled: isAdmin,
  })

  const saveMutation = useMutation({
    mutationFn: async () => {
      const validation = validateBusForm(form)
      if (!validation.ok) throw new Error(validation.message)

      if (editing) {
        return updateBus(editing.id, {
          name: form.name,
          capacity: form.capacity,
          type: form.type,
          ...(isAdmin && form.operatorId !== ''
            ? { operatorId: form.operatorId as number }
            : {}),
        })
      }

      return createBus({
        registrationNo: form.registrationNo,
        name: form.name,
        capacity: form.capacity,
        type: form.type,
        ...(isAdmin && form.operatorId !== ''
          ? { operatorId: form.operatorId as number }
          : {}),
      })
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['buses'] })
      setModalOpen(false)
      setEditing(null)
      setForm(emptyForm)
      showToast(editing ? 'Bus updated' : 'Bus added', 'success')
    },
    onError: (err) => showToast(getErrorMessage(err), 'error'),
  })

  const deleteMutation = useMutation({
    mutationFn: (id: number) => deleteBus(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['buses'] })
      setDeleteTarget(null)
      showToast('Bus removed', 'success')
    },
    onError: (err) => showToast(getErrorMessage(err), 'error'),
  })

  function openCreate() {
    setEditing(null)
    setForm(emptyForm)
    setFormError('')
    setModalOpen(true)
  }

  function openEdit(bus: BusType) {
    setEditing(bus)
    setForm({
      registrationNo: bus.registrationNo,
      name: bus.name,
      capacity: bus.capacity,
      type: bus.type,
      operatorId: bus.operatorId ?? '',
    })
    setFormError('')
    setModalOpen(true)
  }

  if (busesQuery.isError) {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
        Failed to load buses. {getErrorMessage(busesQuery.error)}
      </div>
    )
  }

  const buses = busesQuery.data ?? []

  const avgCapacity =
    buses.length > 0
      ? Math.round(buses.reduce((sum, b) => sum + b.capacity, 0) / buses.length)
      : 0

  return (
    <div className="space-y-6">
      <PageHeader
        title={isAdmin ? 'Buses' : 'My Buses'}
        subtitle="Manage fleet inventory and view bus details."
        action={
          <button type="button" onClick={openCreate} className="btn-primary">
            <Plus className="h-4 w-4" />
            Add Bus
          </button>
        }
      />

      {!busesQuery.isLoading && buses.length > 0 && (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard label="Total Fleet" value={buses.length} icon={Bus} hint="Registered vehicles" />
          <StatCard
            label="Active Types"
            value={new Set(buses.map((b) => b.type)).size}
            icon={Bus}
            iconTone="success"
            hint="Seater, sleeper, etc."
          />
          <StatCard
            label="Total Capacity"
            value={buses.reduce((sum, b) => sum + b.capacity, 0)}
            icon={Wrench}
            iconTone="warning"
            hint="Combined seat count"
          />
          <StatCard
            label="Avg Capacity"
            value={avgCapacity}
            icon={Bus}
            iconTone="neutral"
            hint="Seats per bus"
          />
        </div>
      )}

      {busesQuery.isLoading ? (
        <DataTable columns={[]} data={[]} keyExtractor={() => ''} loading />
      ) : buses.length === 0 ? (
        <EmptyState
          icon={Bus}
          title="No buses yet"
          description="Add your first bus to start creating schedules and managing seats."
          action={
            <button type="button" onClick={openCreate} className="btn-primary">
              Add your first bus
            </button>
          }
        />
      ) : (
        <DataTable
          data={buses}
          keyExtractor={(b) => b.id}
          columns={[
            { key: 'reg', header: 'Registration No', render: (b) => (
              <span className="font-medium text-slate-900">{b.registrationNo}</span>
            ) },
            { key: 'name', header: 'Name / Alias', render: (b) => b.name },
            {
              key: 'type',
              header: 'Type',
              render: (b) => (
                <StatusBadge label={b.type.replace('_', ' ')} variant={busTypeVariant(b.type)} />
              ),
            },
            { key: 'cap', header: 'Capacity', render: (b) => `${b.capacity} seats` },
            {
              key: 'actions',
              header: '',
              render: (b) => (
                <div className="flex justify-end gap-2">
                  <button type="button" onClick={() => openEdit(b)} className="rounded p-1 text-slate-500 hover:bg-slate-100">
                    <Pencil className="h-4 w-4" />
                  </button>
                  <button type="button" onClick={() => setDeleteTarget(b)} className="rounded p-1 text-red-500 hover:bg-red-50">
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
          <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-xl bg-white p-6 shadow-xl">
            <h2 className="text-lg font-semibold">{editing ? 'Edit bus' : 'Add bus'}</h2>
            <form
              className="mt-4 space-y-4"
              onSubmit={(e) => {
                e.preventDefault()
                const v = validateBusForm(form)
                if (!v.ok) {
                  setFormError(v.message)
                  return
                }
                setFormError('')
                saveMutation.mutate()
              }}
            >
              {formError && (
                <p className="text-sm text-red-600">{formError}</p>
              )}
              {!editing && (
                <div>
                  <label className="mb-1 block text-sm font-medium">Registration number</label>
                  <input
                    value={form.registrationNo}
                    onChange={(e) => setForm({ ...form, registrationNo: e.target.value })}
                    className="input-field"
                    required
                  />
                </div>
              )}
              <div>
                <label className="mb-1 block text-sm font-medium">Bus name</label>
                <input
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="input-field"
                  required
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium">Capacity</label>
                <input
                  type="number"
                  min={1}
                  max={100}
                  value={form.capacity}
                  onChange={(e) => setForm({ ...form, capacity: Number(e.target.value) })}
                  className="input-field"
                />
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium">Bus type</label>
                <div className="grid grid-cols-2 gap-2">
                  {BUS_TYPES.map((t) => (
                    <label
                      key={t.value}
                      className={`flex cursor-pointer items-center gap-2 rounded-lg border px-3 py-2 text-sm ${
                        form.type === t.value
                          ? 'border-brand bg-brand-light text-brand'
                          : 'border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      <input
                        type="radio"
                        name="busType"
                        value={t.value}
                        checked={form.type === t.value}
                        onChange={() => setForm({ ...form, type: t.value })}
                        className="sr-only"
                      />
                      <span>{t.icon}</span>
                      {t.label}
                    </label>
                  ))}
                </div>
              </div>
              {isAdmin && (
                <div>
                  <label className="mb-1 block text-sm font-medium">Assign operator</label>
                  <select
                    value={form.operatorId}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        operatorId: e.target.value ? Number(e.target.value) : '',
                      })
                    }
                    className="input-field"
                  >
                    <option value="">No operator</option>
                    {operatorsQuery.data?.map((op) => (
                      <option key={op.id} value={op.id}>
                        {op.name}
                      </option>
                    ))}
                  </select>
                </div>
              )}
              <div className="flex justify-end gap-2 pt-2">
                <button type="button" onClick={() => setModalOpen(false)} className="btn-secondary">
                  Cancel
                </button>
                <button type="submit" disabled={saveMutation.isPending} className="btn-primary">
                  {saveMutation.isPending ? 'Saving...' : 'Save'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <ConfirmDialog
        open={!!deleteTarget}
        title="Delete bus?"
        message={`Remove ${deleteTarget?.name}? This cannot be undone.`}
        confirmLabel="Delete"
        loading={deleteMutation.isPending}
        onConfirm={() => deleteTarget && deleteMutation.mutate(deleteTarget.id)}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  )
}
