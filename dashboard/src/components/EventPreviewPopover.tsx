import { Pencil, X } from 'lucide-react'
import type { Schedule } from '../types'

interface EventPreviewPopoverProps {
  schedule: Schedule
  position: { top: number; left: number }
  onEdit: () => void
  onClose: () => void
}

export function EventPreviewPopover({
  schedule,
  position,
  onEdit,
  onClose,
}: EventPreviewPopoverProps) {
  const route = schedule.route
  const bus = schedule.bus
  const booked = schedule.bookedSeatsCount ?? schedule.bookingsCount ?? 0
  const total = schedule.seatsCount ?? schedule._count?.seats ?? 0

  return (
    <div
      className="fixed z-50 w-72 rounded-xl border border-slate-200 bg-white p-4 shadow-xl"
      style={{ top: position.top, left: position.left }}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2">
          <span
            className="h-3 w-3 shrink-0 rounded-full"
            style={{ backgroundColor: schedule.color ?? '#4F46E5' }}
          />
          <div>
            <p className="font-medium text-slate-900">
              {route
                ? `${route.fromCity?.name} → ${route.toCity?.name}`
                : `Route #${schedule.routeId}`}
            </p>
            <p className="text-xs text-slate-500">{bus?.registrationNo ?? `Bus #${schedule.busId}`}</p>
          </div>
        </div>
        <button type="button" onClick={onClose} className="text-slate-400 hover:text-slate-600">
          <X className="h-4 w-4" />
        </button>
      </div>
      <p className="mt-3 text-sm text-slate-600">
        {new Date(schedule.departureTime).toLocaleString('en-IN', {
          dateStyle: 'medium',
          timeStyle: 'short',
        })}
        {schedule.arrivalTime && (
          <>
            {' '}
            –{' '}
            {new Date(schedule.arrivalTime).toLocaleTimeString('en-IN', {
              timeStyle: 'short',
            })}
          </>
        )}
      </p>
      <p className="mt-1 text-sm text-slate-500">
        {booked}/{total} seats booked · ₹{Number(schedule.basePrice).toLocaleString('en-IN')}
      </p>
      <button
        type="button"
        onClick={onEdit}
        className="mt-3 flex w-full items-center justify-center gap-1.5 rounded-lg border border-slate-200 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
      >
        <Pencil className="h-4 w-4" />
        Edit
      </button>
    </div>
  )
}
