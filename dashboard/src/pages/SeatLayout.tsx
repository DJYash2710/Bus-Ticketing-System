import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Armchair, Save } from 'lucide-react'
import { listSchedules } from '../api/schedules'
import { listSeatsBySchedule, updateSeatStatus } from '../api/seats'
import { getErrorMessage } from '../api/client'
import { useAuth } from '../auth/AuthContext'
import { BusLayoutDiagram } from '../components/BusLayoutDiagram'
import { EmptyState } from '../components/EmptyState'
import { PageHeader } from '../components/PageHeader'
import { StatCard } from '../components/StatCard'
import { seatStatusLabel } from '../components/StatusBadge'
import { useToast } from '../hooks/useToast'
import type { Seat, SeatStatus } from '../types'

const CYCLE: SeatStatus[] = ['AVAILABLE', 'HELD', 'BOOKED']

function nextStatus(current: SeatStatus, operatorMode: boolean): SeatStatus {
  if (operatorMode) {
    return current === 'AVAILABLE' ? 'HELD' : 'AVAILABLE'
  }
  const idx = CYCLE.indexOf(current)
  return CYCLE[(idx + 1) % CYCLE.length]
}

export function SeatLayout() {
  const { showToast } = useToast()
  const { user, hasRole } = useAuth()
  const isOperator = user?.role === 'OPERATOR'
  const queryClient = useQueryClient()
  const [scheduleId, setScheduleId] = useState<number | ''>('')
  const [localSeats, setLocalSeats] = useState<Seat[]>([])
  const [selectedSeatId, setSelectedSeatId] = useState<number | null>(null)
  const [dirty, setDirty] = useState(false)

  const canEditSeat = (seat: Seat) => {
    if (hasRole('ADMIN')) return true
    if (isOperator && seat.status === 'BOOKED') return false
    return true
  }

  const schedulesQuery = useQuery({
    queryKey: ['schedules'],
    queryFn: () => listSchedules({ status: 'ACTIVE' }),
  })

  const seatsQuery = useQuery({
    queryKey: ['seats', scheduleId],
    queryFn: () => listSeatsBySchedule(scheduleId as number),
    enabled: !!scheduleId,
  })

  const selectedSchedule = schedulesQuery.data?.find((s) => s.id === scheduleId)
  const selectedSeat = localSeats.find((s) => s.id === selectedSeatId) ?? null

  useEffect(() => {
    if (!seatsQuery.data?.seats || dirty) return
    setLocalSeats(seatsQuery.data.seats)
    setSelectedSeatId(null)
  }, [seatsQuery.data, dirty])

  useEffect(() => {
    if (!scheduleId && schedulesQuery.data?.[0]) {
      setScheduleId(schedulesQuery.data[0].id)
    }
  }, [scheduleId, schedulesQuery.data])

  useEffect(() => {
    if (!scheduleId) return
    setLocalSeats([])
    setSelectedSeatId(null)
    setDirty(false)
  }, [scheduleId])

  const saveMutation = useMutation({
    mutationFn: async () => {
      const original = seatsQuery.data?.seats ?? []
      const changed = localSeats.filter((s) => {
        const orig = original.find((o) => o.id === s.id)
        return orig && orig.status !== s.status && canEditSeat(orig)
      })
      await Promise.all(changed.map((s) => updateSeatStatus(s.id, s.status)))
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['seats', scheduleId] })
      setDirty(false)
      showToast('Bus layout saved', 'success')
    },
    onError: (err) => showToast(getErrorMessage(err), 'error'),
  })

  const summary = useMemo(() => {
    const fromApi = seatsQuery.data?.summary
    if (fromApi) return fromApi
    return {
      total: localSeats.length,
      available: localSeats.filter((s) => s.status === 'AVAILABLE').length,
      booked: localSeats.filter((s) => s.status === 'BOOKED').length,
      held: localSeats.filter((s) => s.status === 'HELD').length,
    }
  }, [seatsQuery.data?.summary, localSeats])

  function handleSeatClick(seat: Seat) {
    if (!canEditSeat(seat)) {
      showToast('Booked seats cannot be changed', 'error')
      return
    }

    setSelectedSeatId(seat.id)
    const newStatus = nextStatus(seat.status, isOperator)
    setLocalSeats((prev) =>
      prev.map((s) => (s.id === seat.id ? { ...s, status: newStatus } : s)),
    )
    setDirty(true)
  }

  const hasSchedules = (schedulesQuery.data?.length ?? 0) > 0

  return (
    <div className="space-y-6">
      <PageHeader
        title="Bus Layout"
        subtitle="Full vehicle diagram with aisle, exits, and seat availability for the selected schedule."
      />

      {!hasSchedules && !schedulesQuery.isLoading ? (
        <EmptyState
          icon={Armchair}
          title="No active schedules"
          description="Create a schedule first — seats are generated automatically when you add one."
          action={
            <Link to="/schedules" className="btn-primary">
              Go to schedules
            </Link>
          }
        />
      ) : (
        <>
          <div className="card flex flex-wrap items-end gap-4 p-4">
            <div className="min-w-[280px] flex-1">
              <label className="mb-1.5 block text-sm font-medium text-slate-700">Schedule</label>
              <select
                value={scheduleId}
                onChange={(e) => setScheduleId(Number(e.target.value))}
                className="input-field"
              >
                {schedulesQuery.data?.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.route?.fromCity?.name} → {s.route?.toCity?.name} —{' '}
                    {new Date(s.departureTime).toLocaleString('en-IN')}
                  </option>
                ))}
              </select>
            </div>
            {selectedSchedule?.bus && (
              <p className="text-sm text-slate-500">
                Vehicle:{' '}
                <span className="font-medium text-slate-700">{selectedSchedule.bus.name}</span>
                {' · '}
                {selectedSchedule.bus.bodyType.replace('_', ' ')}
                {selectedSchedule.bus.hasAc ? ' · AC' : ''}
              </p>
            )}
          </div>

          {seatsQuery.isLoading ? (
            <div className="card p-12 text-center text-sm text-slate-500">Loading bus layout...</div>
          ) : seatsQuery.isError ? (
            <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
              {getErrorMessage(seatsQuery.error)}
            </div>
          ) : (
            <div className="grid gap-6 xl:grid-cols-[1fr_280px]">
              <div className="card p-6">
                <div className="mb-6 flex items-center justify-between">
                  <div>
                    <h2 className="font-semibold text-slate-900">Vehicle diagram</h2>
                    <p className="text-xs text-slate-500">
                      {selectedSchedule?.bus?.name ?? 'Bus'} · {summary.total} seats
                    </p>
                  </div>
                </div>

                <div className="overflow-x-auto">
                <BusLayoutDiagram
                  seats={localSeats}
                  bus={selectedSchedule?.bus}
                  layout={seatsQuery.data?.layout}
                  selectedSeatId={selectedSeatId}
                  onSeatClick={handleSeatClick}
                  canEditSeat={canEditSeat}
                />
                </div>

                <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
                  {isOperator && (
                    <p className="text-xs text-slate-500">
                      Booked seats are locked and cannot be edited.
                    </p>
                  )}
                  <button
                    type="button"
                    disabled={!dirty || saveMutation.isPending}
                    onClick={() => saveMutation.mutate()}
                    className="btn-primary ml-auto disabled:opacity-40"
                  >
                    <Save className="h-4 w-4" />
                    {saveMutation.isPending ? 'Saving...' : 'Save changes'}
                  </button>
                </div>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <StatCard label="Total Seats" value={summary.total} icon={Armchair} />
                  <StatCard
                    label="Available"
                    value={summary.available}
                    icon={Armchair}
                    iconTone="success"
                  />
                  <StatCard label="Booked" value={summary.booked} icon={Armchair} iconTone="neutral" />
                  <StatCard
                    label="Held"
                    value={summary.held}
                    icon={Armchair}
                    iconTone="warning"
                  />
                </div>

                <div className="card p-4">
                  <h3 className="mb-3 text-xs font-semibold uppercase tracking-wide text-slate-400">
                    Legend
                  </h3>
                  <ul className="space-y-2 text-sm text-slate-600">
                    <li className="flex items-center gap-2">
                      <span className="h-4 w-4 rounded border border-slate-200 bg-white" />
                      Available
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="h-4 w-4 rounded bg-slate-600" />
                      Booked (locked for operators)
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="h-4 w-4 rounded bg-brand" />
                      Selected
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="h-4 w-4 rounded bg-amber-400" />
                      Held
                    </li>
                  </ul>
                </div>

                {selectedSeat && (
                  <div className="card p-4">
                    <h3 className="font-semibold text-slate-900">Seat {selectedSeat.seatNumber}</h3>
                    <dl className="mt-3 space-y-2 text-sm">
                      <div className="flex justify-between">
                        <dt className="text-slate-500">Status</dt>
                        <dd className="font-medium text-brand">{seatStatusLabel(selectedSeat.status)}</dd>
                      </div>
                      <div className="flex justify-between">
                        <dt className="text-slate-500">Row / Col</dt>
                        <dd className="font-medium text-slate-700">
                          {selectedSeat.row ?? '—'} / {selectedSeat.col ?? '—'}
                        </dd>
                      </div>
                    </dl>
                    <p className="mt-3 text-xs text-slate-400">
                      {canEditSeat(selectedSeat)
                        ? isOperator
                          ? 'Tap an available or held seat to toggle between those states.'
                          : 'Tap a seat to cycle its status (available → held → booked).'
                        : 'This seat is booked and cannot be modified.'}
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}
