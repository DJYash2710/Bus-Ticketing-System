import { useCallback, useMemo, useRef, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import FullCalendar from '@fullcalendar/react'
import dayGridPlugin from '@fullcalendar/daygrid'
import timeGridPlugin from '@fullcalendar/timegrid'
import interactionPlugin from '@fullcalendar/interaction'
import type {
  DatesSetArg,
  EventClickArg,
  EventDropArg,
  EventInput,
} from '@fullcalendar/core'
import type { DateClickArg } from '@fullcalendar/interaction'
import { DayPicker } from 'react-day-picker'
import { Link } from 'react-router-dom'
import { Calendar, ChevronLeft, ChevronRight, Plus } from 'lucide-react'
import { listBuses } from '../api/buses'
import { listRoutes } from '../api/routes'
import { listOperators } from '../api/operators'
import {
  createSchedule,
  deleteSchedule,
  listSchedules,
  updateSchedule,
} from '../api/schedules'
import { getApiErrorDetails, getErrorMessage } from '../api/client'
import { ConfirmDialog } from '../components/ConfirmDialog'
import { EmptyState } from '../components/EmptyState'
import { EventPreviewPopover } from '../components/EventPreviewPopover'
import { RecurrenceScopePicker } from '../components/RecurrenceScopePicker'
import { ScheduleModal } from '../components/ScheduleModal'
import { useAuth } from '../auth/AuthContext'
import { useToast } from '../hooks/useToast'
import type { Schedule, ScheduleScope } from '../types'
import 'react-day-picker/style.css'

type CalendarView = 'timeGridDay' | 'timeGridWeek' | 'dayGridMonth'

function toDateOnly(d: Date) {
  return d.toISOString().slice(0, 10)
}

function contrastTextColor(hex: string): string {
  const normalized = hex.replace('#', '')
  if (normalized.length !== 6) return '#ffffff'
  const r = parseInt(normalized.slice(0, 2), 16)
  const g = parseInt(normalized.slice(2, 4), 16)
  const b = parseInt(normalized.slice(4, 6), 16)
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255
  return luminance > 0.55 ? '#1e293b' : '#ffffff'
}

function scheduleToEvent(schedule: Schedule): EventInput {
  const booked = schedule.bookedSeatsCount ?? schedule.bookingsCount ?? 0
  const total = schedule.seatsCount ?? schedule._count?.seats ?? 0
  const busLabel = schedule.bus?.registrationNo ?? `#${schedule.busId}`
  const bg = schedule.color ?? '#4F46E5'

  return {
    id: String(schedule.id),
    title: `${busLabel} · ${booked}/${total}`,
    start: schedule.departureTime,
    end: schedule.arrivalTime ?? undefined,
    backgroundColor: bg,
    borderColor: bg,
    textColor: contrastTextColor(bg),
    classNames: ['schedule-event-chip'],
    extendedProps: { schedule },
  }
}

export function Schedules() {
  const { hasRole } = useAuth()
  const isAdmin = hasRole('ADMIN')
  const { showToast } = useToast()
  const queryClient = useQueryClient()
  const calendarRef = useRef<FullCalendar>(null)

  const [view, setView] = useState<CalendarView>('timeGridWeek')
  const [calendarTitle, setCalendarTitle] = useState('')
  const [range, setRange] = useState<{ from: string; to: string } | null>(null)
  const [hiddenBusIds, setHiddenBusIds] = useState<Set<number>>(new Set())

  const [modalOpen, setModalOpen] = useState(false)
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create')
  const [editingSchedule, setEditingSchedule] = useState<Schedule | null>(null)
  const [createStart, setCreateStart] = useState<Date | undefined>()

  const [preview, setPreview] = useState<{
    schedule: Schedule
    position: { top: number; left: number }
  } | null>(null)

  const lastDateClick = useRef<{ time: number; dateMs: number } | null>(null)
  const activeRevertRef = useRef<(() => void) | null>(null)

  const [scopePickerOpen, setScopePickerOpen] = useState(false)
  const [pendingScopeAction, setPendingScopeAction] = useState<
    | {
        type: 'move'
        schedule: Schedule
        departureTime: string
        revert: () => void
      }
    | null
  >(null)

  const [bookingWarningOpen, setBookingWarningOpen] = useState(false)
  const [pendingAfterWarning, setPendingAfterWarning] = useState<(() => void) | null>(null)

  const busesQuery = useQuery({ queryKey: ['buses'], queryFn: listBuses })
  const routesQuery = useQuery({ queryKey: ['routes'], queryFn: listRoutes })
  const operatorsQuery = useQuery({
    queryKey: ['operators'],
    queryFn: listOperators,
    enabled: isAdmin,
  })

  const schedulesQuery = useQuery({
    queryKey: ['schedules-calendar', range?.from, range?.to],
    queryFn: () =>
      listSchedules({
        from: range!.from,
        to: range!.to,
      }),
    enabled: !!range,
  })

  const buses = busesQuery.data ?? []
  const routes = routesQuery.data ?? []

  const visibleSchedules = useMemo(() => {
    return (schedulesQuery.data ?? []).filter((s) => !hiddenBusIds.has(s.busId))
  }, [schedulesQuery.data, hiddenBusIds])

  const events = useMemo(
    () => visibleSchedules.map(scheduleToEvent),
    [visibleSchedules],
  )

  const busesByOperator = useMemo(() => {
    if (!isAdmin) return [{ label: 'My fleet', buses }]
    const ops = operatorsQuery.data ?? []
    const grouped: { label: string; buses: typeof buses }[] = []
    const opMap = new Map(ops.map((o) => [o.id, o.name]))
    const byOp = new Map<number | 'none', typeof buses>()
    for (const bus of buses) {
      const key = bus.operatorId ?? 'none'
      if (!byOp.has(key)) byOp.set(key, [])
      byOp.get(key)!.push(bus)
    }
    for (const [opId, fleet] of byOp) {
      grouped.push({
        label:
          opId === 'none'
            ? 'Unassigned'
            : (opMap.get(opId as number) ?? `Operator #${opId}`),
        buses: fleet,
      })
    }
    return grouped
  }, [isAdmin, buses, operatorsQuery.data])

  const invalidate = () => {
    void queryClient.invalidateQueries({ queryKey: ['schedules-calendar'] })
    void queryClient.invalidateQueries({ queryKey: ['schedules'] })
  }

  const saveMutation = useMutation({
    mutationFn: async (payload: Parameters<typeof createSchedule>[0] & { scope?: ScheduleScope; id?: number }) => {
      if (modalMode === 'edit' && payload.id) {
        const { id, scope, recurrence, busId, routeId, ...rest } = payload
        void recurrence
        void busId
        void routeId
        return updateSchedule(id, { ...rest, scope: scope ?? 'this' })
      }
      const { scope, id, ...createPayload } = payload
      void scope
      void id
      return createSchedule(createPayload)
    },
    onSuccess: () => {
      invalidate()
      setModalOpen(false)
      setEditingSchedule(null)
      showToast('Schedule saved', 'success')
    },
    onError: (err) => showToast(getErrorMessage(err), 'error'),
  })

  const deleteMutation = useMutation({
    mutationFn: ({ id, scope }: { id: number; scope: ScheduleScope }) =>
      deleteSchedule(id, scope),
    onSuccess: () => {
      invalidate()
      setModalOpen(false)
      setEditingSchedule(null)
      showToast('Schedule deleted', 'success')
    },
    onError: (err) => showToast(getErrorMessage(err), 'error'),
  })

  const moveMutation = useMutation({
    mutationFn: async ({
      id,
      departureTime,
      scope,
    }: {
      id: number
      departureTime: string
      scope: ScheduleScope
    }) => updateSchedule(id, { departureTime, scope }),
    onSuccess: () => {
      invalidate()
      activeRevertRef.current = null
      showToast('Schedule updated', 'success')
    },
    onError: (err) => {
      showToast(getErrorMessage(err), 'error')
      const details = getApiErrorDetails(err) as { conflictingSchedule?: Schedule } | undefined
      if (details?.conflictingSchedule) {
        showToast('That bus already has a trip in that time slot', 'error')
      }
      activeRevertRef.current?.()
      activeRevertRef.current = null
    },
  })

  const handleDatesSet = useCallback((info: DatesSetArg) => {
    setRange({ from: toDateOnly(info.start), to: toDateOnly(info.end) })
    setCalendarTitle(info.view.title)
  }, [])

  const pageTitle = isAdmin ? 'All Schedules' : 'My Schedules'

  function calendarNav(action: 'prev' | 'next' | 'today') {
    const api = calendarRef.current?.getApi()
    if (!api) return
    if (action === 'prev') api.prev()
    else if (action === 'next') api.next()
    else api.today()
  }

  function openCreate(start: Date) {
    setModalMode('create')
    setEditingSchedule(null)
    setCreateStart(start)
    setPreview(null)
    setModalOpen(true)
  }

  function openEdit(schedule: Schedule) {
    setModalMode('edit')
    setEditingSchedule(schedule)
    setPreview(null)
    setModalOpen(true)
  }

  function handleDateClick(info: DateClickArg) {
    const now = Date.now()
    const dateMs = info.date.getTime()
    if (
      lastDateClick.current &&
      now - lastDateClick.current.time < 400 &&
      Math.abs(lastDateClick.current.dateMs - dateMs) < 60000
    ) {
      openCreate(info.date)
      lastDateClick.current = null
    } else {
      lastDateClick.current = { time: now, dateMs }
    }
  }

  function handleEventClick(info: EventClickArg) {
    info.jsEvent.preventDefault()
    const schedule = info.event.extendedProps.schedule as Schedule
    const rect = info.el.getBoundingClientRect()
    setPreview({
      schedule,
      position: {
        top: Math.min(rect.bottom + 8, window.innerHeight - 220),
        left: Math.min(rect.left, window.innerWidth - 300),
      },
    })
  }

  function commitMove(
    schedule: Schedule,
    start: Date,
    revert: () => void,
    scope: ScheduleScope = 'this',
  ) {
    moveMutation.mutate({
      id: schedule.id,
      departureTime: start.toISOString(),
      scope,
    })
    void revert
  }

  function startDragCommit(
    schedule: Schedule,
    start: Date,
    revert: () => void,
  ) {
    activeRevertRef.current = revert

    const proceed = () => {
      if (schedule.recurrenceGroupId) {
        setPendingScopeAction({
          type: 'move',
          schedule,
          departureTime: start.toISOString(),
          revert,
        })
        setScopePickerOpen(true)
        return
      }
      commitMove(schedule, start, revert, 'this')
    }

    if ((schedule.bookingsCount ?? 0) > 0) {
      setPendingScopeAction({
        type: 'move',
        schedule,
        departureTime: start.toISOString(),
        revert,
      })
      setPendingAfterWarning(() => proceed)
      setBookingWarningOpen(true)
      return
    }
    proceed()
  }

  function handleEventDrop(info: EventDropArg) {
    const schedule = info.event.extendedProps.schedule as Schedule
    const start = info.event.start!
    startDragCommit(schedule, start, () => info.revert())
  }

  function toggleBus(busId: number) {
    setHiddenBusIds((prev) => {
      const next = new Set(prev)
      if (next.has(busId)) next.delete(busId)
      else next.add(busId)
      return next
    })
  }

  const hasBuses = buses.length > 0
  const isEmpty =
    !schedulesQuery.isLoading && (schedulesQuery.data?.length ?? 0) === 0 && hasBuses

  return (
    <div className="flex h-[calc(100vh-7rem)] flex-col">
      {!hasBuses && !busesQuery.isLoading ? (
        <EmptyState
          icon={Calendar}
          title="Add a bus first"
          description="You need at least one bus before you can schedule trips on the calendar."
          action={
            <Link
              to="/buses"
              className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white"
            >
              Add your first bus
            </Link>
          }
        />
      ) : (
        <>
          <div className="mb-3 flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 pb-3">
            <div className="flex min-w-0 flex-wrap items-center gap-2">
              <h1 className="mr-1 text-xl font-semibold text-slate-900">{pageTitle}</h1>
              <button
                type="button"
                onClick={() => calendarNav('today')}
                className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
              >
                Today
              </button>
              <div className="flex overflow-hidden rounded-lg border border-slate-300">
                <button
                  type="button"
                  onClick={() => calendarNav('prev')}
                  aria-label="Previous"
                  className="border-r border-slate-300 bg-white px-2 py-1.5 text-slate-700 hover:bg-slate-50"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={() => calendarNav('next')}
                  aria-label="Next"
                  className="bg-white px-2 py-1.5 text-slate-700 hover:bg-slate-50"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
              <h2 className="truncate text-lg font-medium text-slate-700">{calendarTitle}</h2>
            </div>
            <div className="flex items-center gap-2">
              <select
                value={view}
                onChange={(e) => {
                  const v = e.target.value as CalendarView
                  setView(v)
                  calendarRef.current?.getApi().changeView(v)
                }}
                className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm"
              >
                <option value="timeGridDay">Day</option>
                <option value="timeGridWeek">Week</option>
                <option value="dayGridMonth">Month</option>
              </select>
              <button
                type="button"
                onClick={() => openCreate(new Date())}
                disabled={!hasBuses}
                className="flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-1.5 text-sm font-medium text-white disabled:opacity-50"
              >
                <Plus className="h-4 w-4" />
                New schedule
              </button>
            </div>
          </div>

          <p className="mb-2 text-sm text-slate-500">
            Double-click a time slot to create · drag to reschedule
          </p>

          <div className="flex min-h-0 flex-1 gap-3">
            <div className="relative flex min-w-0 flex-1 flex-col rounded-xl border border-slate-200 bg-white p-2 shadow-sm">
              {schedulesQuery.isLoading && (
                <div className="absolute inset-0 z-10 flex items-center justify-center rounded-xl bg-white/70">
                  <div className="space-y-2 text-center">
                    <div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-indigo-200 border-t-indigo-600" />
                    <p className="text-sm text-slate-500">Loading schedules...</p>
                  </div>
                </div>
              )}

              {isEmpty && !schedulesQuery.isLoading && (
                <div className="pointer-events-none absolute inset-x-0 top-12 z-10 flex justify-center p-4">
                  <div className="max-w-sm rounded-xl border border-dashed border-slate-300 bg-white/95 px-6 py-8 text-center shadow-sm">
                    <Calendar className="mx-auto mb-3 h-10 w-10 text-indigo-400" />
                    <p className="font-medium text-slate-900">No schedules in this range</p>
                    <p className="mt-1 text-sm text-slate-500">
                      Double-click any time slot or use New schedule to add your first trip.
                    </p>
                  </div>
                </div>
              )}

              <div className="min-h-0 flex-1">
                <FullCalendar
                  ref={calendarRef}
                  plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
                  initialView={view}
                  headerToolbar={false}
                  height="100%"
                  eventStartEditable
                  eventDurationEditable={false}
                  selectable
                  events={events}
                  datesSet={handleDatesSet}
                  dateClick={handleDateClick}
                  eventClick={handleEventClick}
                  eventDrop={handleEventDrop}
                  slotMinTime="05:00:00"
                  slotMaxTime="24:00:00"
                  allDaySlot={false}
                  nowIndicator
                />
              </div>
            </div>

            <aside className="flex w-44 shrink-0 flex-col gap-3 self-start rounded-xl border border-slate-200 bg-white p-2 shadow-sm">
              <div className="w-full overflow-hidden">
                <p className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Jump to date
                </p>
                <DayPicker
                  mode="single"
                  onSelect={(day) => {
                    if (day) calendarRef.current?.getApi().gotoDate(day)
                  }}
                  classNames={{
                    root: 'w-full max-w-full text-xs',
                    months: 'w-full',
                    month: 'w-full space-y-2',
                    month_caption: 'flex justify-center px-1',
                    caption_label: 'text-xs font-medium text-slate-700',
                    nav: 'flex items-center gap-1',
                    button_previous: 'h-6 w-6 rounded hover:bg-indigo-50',
                    button_next: 'h-6 w-6 rounded hover:bg-indigo-50',
                    month_grid: 'w-full table-fixed border-collapse',
                    weekdays: 'text-[0.65rem] text-slate-400',
                    weekday: 'p-0 text-center font-medium',
                    week: 'mt-0.5',
                    day: 'p-0 text-center',
                    day_button:
                      'mx-auto flex h-7 w-7 items-center justify-center rounded-md text-xs hover:bg-indigo-50',
                    selected: '!bg-indigo-600 !text-white hover:!bg-indigo-600',
                    today: 'font-bold text-indigo-600',
                    outside: 'text-slate-300',
                  }}
                />
              </div>
              <div>
                <p className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Show buses
                </p>
                <div className="space-y-2">
                  {busesByOperator.map((group) => (
                    <div key={group.label}>
                      {isAdmin && (
                        <p className="mb-0.5 text-[0.65rem] font-medium text-slate-400">{group.label}</p>
                      )}
                      <ul className="space-y-0.5">
                        {group.buses.map((bus) => (
                          <li key={bus.id}>
                            <label className="flex cursor-pointer items-center gap-1.5 text-xs text-slate-700">
                              <input
                                type="checkbox"
                                checked={!hiddenBusIds.has(bus.id)}
                                onChange={() => toggleBus(bus.id)}
                                className="rounded border-slate-300 text-indigo-600"
                              />
                              <span className="truncate">{bus.registrationNo}</span>
                            </label>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              </div>
            </aside>
          </div>
        </>
      )}

      {preview && (
        <EventPreviewPopover
          schedule={preview.schedule}
          position={preview.position}
          onEdit={() => openEdit(preview.schedule)}
          onClose={() => setPreview(null)}
        />
      )}

      <ScheduleModal
        open={modalOpen}
        mode={modalMode}
        schedule={editingSchedule}
        initialStart={createStart}
        buses={buses}
        routes={routes}
        saving={saveMutation.isPending || deleteMutation.isPending}
        onClose={() => {
          setModalOpen(false)
          setEditingSchedule(null)
        }}
        onSave={(payload) => {
          if (modalMode === 'edit' && editingSchedule) {
            saveMutation.mutate({ ...payload, id: editingSchedule.id })
          } else {
            saveMutation.mutate(payload)
          }
        }}
        onDelete={(scope) => {
          if (editingSchedule) {
            deleteMutation.mutate({ id: editingSchedule.id, scope })
          }
        }}
      />

      <RecurrenceScopePicker
        open={scopePickerOpen}
        title="Apply move to"
        onSelect={(scope) => {
          setScopePickerOpen(false)
          if (pendingScopeAction) {
            commitMove(
              pendingScopeAction.schedule,
              new Date(pendingScopeAction.departureTime),
              pendingScopeAction.revert,
              scope,
            )
            setPendingScopeAction(null)
          }
        }}
        onCancel={() => {
          pendingScopeAction?.revert()
          setScopePickerOpen(false)
          setPendingScopeAction(null)
        }}
      />

      <ConfirmDialog
        open={bookingWarningOpen}
        title="Passengers already booked"
        message={`This schedule has ${pendingScopeAction?.schedule.bookingsCount ?? 0} booking(s). Moving it may disrupt travelers. Continue anyway?`}
        confirmLabel="Move anyway"
        onConfirm={() => {
          setBookingWarningOpen(false)
          pendingAfterWarning?.()
          setPendingAfterWarning(null)
        }}
        onCancel={() => {
          setBookingWarningOpen(false)
          pendingScopeAction?.revert()
          setPendingScopeAction(null)
          setPendingAfterWarning(null)
        }}
      />
    </div>
  )
}
