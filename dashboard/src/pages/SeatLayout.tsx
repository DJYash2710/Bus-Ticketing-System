import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Armchair, Save } from 'lucide-react'
import { listSchedules } from '../api/schedules'
import { listSeatsBySchedule, updateSeatStatus } from '../api/seats'
import { getErrorMessage } from '../api/client'
import { EmptyState } from '../components/EmptyState'
import { seatStatusLabel } from '../components/StatusBadge'
import { useToast } from '../hooks/useToast'
import type { Seat, SeatStatus } from '../types'

const CYCLE: SeatStatus[] = ['AVAILABLE', 'HELD', 'BOOKED']

const seatColors: Record<SeatStatus, string> = {
  AVAILABLE: 'bg-emerald-100 border-emerald-400 text-emerald-800 hover:bg-emerald-200',
  HELD: 'bg-amber-100 border-amber-400 text-amber-800 hover:bg-amber-200',
  BOOKED: 'bg-red-100 border-red-400 text-red-800 cursor-not-allowed opacity-80',
}

function nextStatus(current: SeatStatus): SeatStatus {
  const idx = CYCLE.indexOf(current)
  return CYCLE[(idx + 1) % CYCLE.length]
}

export function SeatLayout() {
  const { showToast } = useToast()
  const queryClient = useQueryClient()
  const [scheduleId, setScheduleId] = useState<number | ''>('')
  const [localSeats, setLocalSeats] = useState<Seat[]>([])
  const [dirty, setDirty] = useState(false)

  const schedulesQuery = useQuery({
    queryKey: ['schedules'],
    queryFn: () => listSchedules({ status: 'ACTIVE' }),
  })

  const seatsQuery = useQuery({
    queryKey: ['seats', scheduleId],
    queryFn: () => listSeatsBySchedule(scheduleId as number),
    enabled: !!scheduleId,
  })

  useEffect(() => {
    if (seatsQuery.data?.seats) {
      setLocalSeats(seatsQuery.data.seats)
      setDirty(false)
    }
  }, [seatsQuery.data])

  useEffect(() => {
    if (!scheduleId && schedulesQuery.data?.[0]) {
      setScheduleId(schedulesQuery.data[0].id)
    }
  }, [scheduleId, schedulesQuery.data])

  const saveMutation = useMutation({
    mutationFn: async () => {
      const original = seatsQuery.data?.seats ?? []
      const changed = localSeats.filter((s) => {
        const orig = original.find((o) => o.id === s.id)
        return orig && orig.status !== s.status
      })
      await Promise.all(
        changed.map((s) => updateSeatStatus(s.id, s.status)),
      )
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['seats', scheduleId] })
      setDirty(false)
      showToast('Seat layout saved', 'success')
    },
    onError: (err) => showToast(getErrorMessage(err), 'error'),
  })

  const grid = useMemo(() => {
    const maxRow = Math.max(...localSeats.map((s) => s.row ?? 0), 0)
    const maxCol = Math.max(...localSeats.map((s) => s.col ?? 0), 0)
    const cells: (Seat | null)[][] = []
    for (let r = 0; r <= maxRow; r++) {
      const row: (Seat | null)[] = []
      for (let c = 0; c <= maxCol; c++) {
        row.push(localSeats.find((s) => s.row === r && s.col === c) ?? null)
      }
      cells.push(row)
    }
    return cells
  }, [localSeats])

  function handleSeatClick(seat: Seat) {
    if (seat.status === 'BOOKED' && seatsQuery.data?.seats.find((s) => s.id === seat.id)?.status === 'BOOKED') {
      // Allow cycling from booked only if user changed it locally
    }
    const newStatus = nextStatus(seat.status)
    setLocalSeats((prev) =>
      prev.map((s) => (s.id === seat.id ? { ...s, status: newStatus } : s)),
    )
    setDirty(true)
  }

  const hasSchedules = (schedulesQuery.data?.length ?? 0) > 0

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-slate-900">Seat Layout</h1>
        <p className="text-sm text-slate-500">Tap a seat to change its status</p>
      </div>

      {!hasSchedules && !schedulesQuery.isLoading ? (
        <EmptyState
          icon={Armchair}
          title="No active schedules"
          description="Create a schedule first — seats are generated automatically when you add one."
          action={
            <Link
              to="/schedules"
              className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
            >
              Go to schedules
            </Link>
          }
        />
      ) : (
        <>
          <div className="flex flex-wrap items-center gap-4">
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">Schedule</label>
              <select
                value={scheduleId}
                onChange={(e) => setScheduleId(Number(e.target.value))}
                className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
              >
                {schedulesQuery.data?.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.route?.fromCity?.name} → {s.route?.toCity?.name} —{' '}
                    {new Date(s.departureTime).toLocaleString('en-IN')}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex flex-wrap gap-3 pt-5">
              {CYCLE.map((status) => (
                <div key={status} className="flex items-center gap-2 text-sm text-slate-600">
                  <span
                    className={`h-4 w-4 rounded border ${seatColors[status].split(' ').slice(0, 2).join(' ')}`}
                  />
                  {seatStatusLabel(status)}
                </div>
              ))}
            </div>
          </div>

          {seatsQuery.isLoading ? (
            <div className="rounded-xl border bg-white p-12 text-center text-sm text-slate-500">
              Loading seat map...
            </div>
          ) : seatsQuery.isError ? (
            <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
              {getErrorMessage(seatsQuery.error)}
            </div>
          ) : (
            <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
              <p className="mb-4 text-center text-xs text-slate-400">Front of bus</p>
              <div className="mx-auto flex max-w-md flex-col gap-2">
                {grid.map((row, ri) => (
                  <div key={ri} className="flex justify-center gap-2">
                    {row.map((seat, ci) =>
                      seat ? (
                        <button
                          key={seat.id}
                          type="button"
                          onClick={() => handleSeatClick(seat)}
                          title={seatStatusLabel(seat.status)}
                          className={`flex h-11 w-11 items-center justify-center rounded-lg border text-xs font-semibold transition ${seatColors[seat.status]}`}
                        >
                          {seat.seatNumber}
                        </button>
                      ) : (
                        <div key={ci} className="h-11 w-11" />
                      ),
                    )}
                  </div>
                ))}
              </div>
              <div className="mt-6 flex justify-end">
                <button
                  type="button"
                  disabled={!dirty || saveMutation.isPending}
                  onClick={() => saveMutation.mutate()}
                  className="flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-40"
                >
                  <Save className="h-4 w-4" />
                  {saveMutation.isPending ? 'Saving...' : 'Save changes'}
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}
