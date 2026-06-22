import { useEffect, useMemo, useState } from 'react'
import { AlertTriangle, Search, Trash2 } from 'lucide-react'
import { RecurrenceScopePicker } from './RecurrenceScopePicker'
import type {
  Bus,
  Route,
  Schedule,
  ScheduleRecurrence,
  ScheduleScope,
} from '../types'

export const SCHEDULE_COLOR_PRESETS = [
  '#4F46E5',
  '#2563EB',
  '#0891B2',
  '#059669',
  '#D97706',
  '#DC2626',
  '#7C3AED',
  '#DB2777',
  '#475569',
  '#0D9488',
] as const

export interface BusRouteOption {
  key: string
  busId: number
  routeId: number
  label: string
}

interface ScheduleModalProps {
  open: boolean
  mode: 'create' | 'edit'
  schedule?: Schedule | null
  initialStart?: Date
  initialEnd?: Date
  buses: Bus[]
  routes: Route[]
  saving?: boolean
  onClose: () => void
  onSave: (payload: {
    busId: number
    routeId: number
    departureTime: string
    arrivalTime: string | null
    basePrice: number
    color: string
    recurrence?: ScheduleRecurrence
    scope?: ScheduleScope
  }) => void
  onDelete?: (scope: ScheduleScope) => void
}

function pad(n: number) {
  return String(n).padStart(2, '0')
}

function formatDateInput(d: Date) {
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
}

function formatTimeInput(d: Date) {
  return d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })
}

function parseTimeOnDate(dateStr: string, timeStr: string): Date | null {
  if (!dateStr || !timeStr.trim()) return null
  const parsed = new Date(`${dateStr} ${timeStr.trim()}`)
  if (Number.isNaN(parsed.getTime())) return null
  return parsed
}

function addDays(d: Date, days: number) {
  const next = new Date(d)
  next.setDate(next.getDate() + days)
  return next
}

function buildBusRouteOptions(buses: Bus[], routes: Route[]): BusRouteOption[] {
  const options: BusRouteOption[] = []
  for (const bus of buses) {
    for (const route of routes) {
      const from = route.fromCity?.name ?? `City ${route.fromCityId}`
      const to = route.toCity?.name ?? `City ${route.toCityId}`
      options.push({
        key: `${bus.id}-${route.id}`,
        busId: bus.id,
        routeId: route.id,
        label: `${bus.registrationNo} — ${from} → ${to}`,
      })
    }
  }
  return options
}

export function ScheduleModal({
  open,
  mode,
  schedule,
  initialStart,
  initialEnd,
  buses,
  routes,
  saving,
  onClose,
  onSave,
  onDelete,
}: ScheduleModalProps) {
  const busRouteOptions = useMemo(
    () => buildBusRouteOptions(buses, routes),
    [buses, routes],
  )

  const [busRouteKey, setBusRouteKey] = useState('')
  const [busRouteSearch, setBusRouteSearch] = useState('')
  const [startDate, setStartDate] = useState('')
  const [startTime, setStartTime] = useState('')
  const [endDate, setEndDate] = useState('')
  const [endTime, setEndTime] = useState('')
  const [basePrice, setBasePrice] = useState(500)
  const [color, setColor] = useState<string>(SCHEDULE_COLOR_PRESETS[0])
  const [recurrenceMode, setRecurrenceMode] = useState<'none' | 'DAILY' | 'WEEKLY' | 'MONTHLY'>('none')
  const [recurrenceEndDate, setRecurrenceEndDate] = useState('')
  const [scope, setScope] = useState<ScheduleScope>('this')
  const [showScopePicker, setShowScopePicker] = useState(false)
  const [pendingAction, setPendingAction] = useState<'save' | 'delete' | null>(null)
  const [formError, setFormError] = useState('')

  useEffect(() => {
    if (!open) return

    const start = schedule
      ? new Date(schedule.departureTime)
      : initialStart ?? new Date()
    const end = schedule?.arrivalTime
      ? new Date(schedule.arrivalTime)
      : initialEnd ?? new Date(start.getTime() + 60 * 60 * 1000)

    setStartDate(formatDateInput(start))
    setStartTime(formatTimeInput(start))
    setEndDate(formatDateInput(end))
    setEndTime(formatTimeInput(end))
    setBasePrice(Number(schedule?.basePrice ?? 500))
    setColor(schedule?.color ?? SCHEDULE_COLOR_PRESETS[0])
    setRecurrenceMode('none')
    setRecurrenceEndDate(formatDateInput(addDays(start, 90)))
    setScope('this')
    setFormError('')
    setBusRouteSearch('')

    if (schedule) {
      setBusRouteKey(`${schedule.busId}-${schedule.routeId}`)
    } else {
      setBusRouteKey(busRouteOptions[0]?.key ?? '')
    }
  }, [open, schedule, initialStart, initialEnd, busRouteOptions])

  const filteredOptions = busRouteOptions.filter((o) =>
    o.label.toLowerCase().includes(busRouteSearch.toLowerCase()),
  )

  const selectedOption = busRouteOptions.find((o) => o.key === busRouteKey)
  const selectedRoute = routes.find((r) => r.id === selectedOption?.routeId)

  function applyRouteDuration() {
    if (!selectedRoute) return
    const minutes =
      selectedRoute.estimatedDurationMinutes ?? selectedRoute.durationMin ?? null
    if (!minutes) return
    const dep = parseTimeOnDate(startDate, startTime)
    if (!dep) return
    const arr = new Date(dep.getTime() + minutes * 60 * 1000)
    setEndDate(formatDateInput(arr))
    setEndTime(formatTimeInput(arr))
  }

  useEffect(() => {
    if (mode === 'create' && selectedRoute) {
      applyRouteDuration()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [busRouteKey, startDate, startTime])

  const weekdayLabel = startDate
    ? new Date(startDate + 'T12:00:00').toLocaleDateString('en-US', { weekday: 'long' })
    : 'Monday'
  const monthDay = startDate ? new Date(startDate + 'T12:00:00').getDate() : 1

  const bookingsCount = schedule?.bookingsCount ?? 0
  const isRecurring = !!schedule?.recurrenceGroupId

  function buildPayload(chosenScope?: ScheduleScope) {
    const option = busRouteOptions.find((o) => o.key === busRouteKey)
    if (!option) throw new Error('Select a bus and route')

    const departure = parseTimeOnDate(startDate, startTime)
    const arrival = parseTimeOnDate(endDate, endTime)
    if (!departure) throw new Error('Enter a valid start date and time')
    if (!arrival) throw new Error('Enter a valid end date and time')
    if (arrival <= departure) throw new Error('End time must be after start time')

    let recurrence: ScheduleRecurrence | undefined
    if (mode === 'create' && recurrenceMode !== 'none') {
      recurrence = {
        frequency: recurrenceMode,
        endDate: new Date(recurrenceEndDate + 'T23:59:59').toISOString(),
        ...(recurrenceMode === 'WEEKLY'
          ? { daysOfWeek: [departure.getDay()] }
          : {}),
      }
    }

    return {
      busId: option.busId,
      routeId: option.routeId,
      departureTime: departure.toISOString(),
      arrivalTime: arrival.toISOString(),
      basePrice,
      color,
      recurrence,
      scope: chosenScope ?? scope,
    }
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setFormError('')

    try {
      if (mode === 'edit' && isRecurring) {
        setPendingAction('save')
        setShowScopePicker(true)
        return
      }
      onSave(buildPayload())
    } catch (err) {
      setFormError(err instanceof Error ? err.message : 'Invalid form')
    }
  }

  function handleScopeSelected(chosen: ScheduleScope) {
    setScope(chosen)
    setShowScopePicker(false)
    if (pendingAction === 'save') {
      try {
        onSave(buildPayload(chosen))
      } catch (err) {
        setFormError(err instanceof Error ? err.message : 'Invalid form')
      }
    } else if (pendingAction === 'delete') {
      onDelete?.(chosen)
    }
    setPendingAction(null)
  }

  if (!open) return null

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
        <div className="max-h-[92vh] w-full max-w-lg overflow-y-auto rounded-xl bg-white shadow-xl">
          <div className="border-b border-slate-200 px-6 py-4">
            <h2 className="text-lg font-semibold text-slate-900">
              {mode === 'create' ? 'New schedule' : 'Edit schedule'}
            </h2>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4 p-6">
            {bookingsCount > 0 && (
              <div className="flex items-start gap-3 rounded-lg border-2 border-amber-300 bg-amber-50 px-4 py-3">
                <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-amber-600" />
                <div>
                  <p className="font-semibold text-amber-900">
                    {bookingsCount} passenger{bookingsCount === 1 ? '' : 's'} have booked this schedule
                  </p>
                  <p className="mt-1 text-sm text-amber-800">
                    Changing times may affect travelers. Proceed only if you intend to move this trip.
                  </p>
                </div>
              </div>
            )}

            {formError && (
              <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{formError}</p>
            )}

            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">Bus & route</label>
              <div className="relative">
                <Search className="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                <input
                  value={busRouteSearch || selectedOption?.label || ''}
                  onChange={(e) => {
                    setBusRouteSearch(e.target.value)
                    if (!e.target.value && selectedOption) setBusRouteKey('')
                  }}
                  onFocus={() => setBusRouteSearch(selectedOption?.label ?? '')}
                  placeholder="Search bus or route..."
                  className="w-full rounded-lg border border-slate-300 py-2 pl-9 pr-3 text-sm"
                  disabled={mode === 'edit'}
                />
              </div>
              {busRouteSearch && mode === 'create' && (
                <ul className="mt-1 max-h-40 overflow-auto rounded-lg border border-slate-200 bg-white shadow-sm">
                  {filteredOptions.map((opt) => (
                    <li key={opt.key}>
                      <button
                        type="button"
                        className="w-full px-3 py-2 text-left text-sm hover:bg-indigo-50"
                        onClick={() => {
                          setBusRouteKey(opt.key)
                          setBusRouteSearch('')
                        }}
                      >
                        {opt.label}
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="mb-1 block text-sm font-medium">Start date</label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium">Start time</label>
                <input
                  type="text"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  placeholder="2:08 PM"
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium">End date</label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium">End time</label>
                <input
                  type="text"
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                  placeholder="6:30 PM"
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                />
              </div>
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium">Base price (₹)</label>
              <input
                type="number"
                min={0}
                value={basePrice}
                onChange={(e) => setBasePrice(Number(e.target.value))}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
              />
            </div>

            {mode === 'create' && (
              <div>
                <label className="mb-1 block text-sm font-medium">Repeat</label>
                <select
                  value={recurrenceMode}
                  onChange={(e) =>
                    setRecurrenceMode(e.target.value as typeof recurrenceMode)
                  }
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                >
                  <option value="none">Doesn&apos;t repeat</option>
                  <option value="DAILY">Daily</option>
                  <option value="WEEKLY">Weekly on {weekdayLabel}</option>
                  <option value="MONTHLY">Monthly on day {monthDay}</option>
                </select>
                {recurrenceMode !== 'none' && (
                  <div className="mt-2">
                    <label className="mb-1 block text-xs text-slate-500">Repeat until</label>
                    <input
                      type="date"
                      value={recurrenceEndDate}
                      onChange={(e) => setRecurrenceEndDate(e.target.value)}
                      className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                    />
                  </div>
                )}
              </div>
            )}

            <div>
              <label className="mb-2 block text-sm font-medium">Color</label>
              <div className="flex flex-wrap gap-2">
                {SCHEDULE_COLOR_PRESETS.map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setColor(c)}
                    className={`h-8 w-8 rounded-full border-2 ${
                      color === c ? 'border-slate-900 ring-2 ring-indigo-200' : 'border-white shadow'
                    }`}
                    style={{ backgroundColor: c }}
                    aria-label={`Color ${c}`}
                  />
                ))}
              </div>
            </div>

            <div className="flex items-center justify-between gap-2 border-t border-slate-100 pt-4">
              {mode === 'edit' && onDelete ? (
                <button
                  type="button"
                  onClick={() => {
                    if (isRecurring) {
                      setPendingAction('delete')
                      setShowScopePicker(true)
                    } else {
                      onDelete('this')
                    }
                  }}
                  className="flex items-center gap-1 rounded-lg px-3 py-2 text-sm text-red-600 hover:bg-red-50"
                >
                  <Trash2 className="h-4 w-4" />
                  Delete
                </button>
              ) : (
                <span />
              )}
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="rounded-lg border border-slate-200 px-4 py-2 text-sm"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
                >
                  {saving ? 'Saving...' : 'Save'}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>

      <RecurrenceScopePicker
        open={showScopePicker}
        title={pendingAction === 'delete' ? 'Delete which events?' : 'Apply changes to'}
        onSelect={handleScopeSelected}
        onCancel={() => {
          setShowScopePicker(false)
          setPendingAction(null)
        }}
      />
    </>
  )
}
