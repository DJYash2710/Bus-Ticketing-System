import { useMemo, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Calendar, ClipboardList, Clock, Filter } from 'lucide-react'
import {
  cancelBooking,
  getAdminBookings,
  getOperatorBookings,
} from '../api/bookings'
import { getErrorMessage } from '../api/client'
import { useAuth } from '../auth/AuthContext'
import { ConfirmDialog } from '../components/ConfirmDialog'
import { DataTable } from '../components/DataTable'
import { EmptyState } from '../components/EmptyState'
import { PageHeader } from '../components/PageHeader'
import {
  StatusBadge,
  bookingStatusVariant,
  paymentStatusVariant,
} from '../components/StatusBadge'
import { UserAvatar } from '../components/UserAvatar'
import { useToast } from '../hooks/useToast'
import type { Booking, BookingStatus } from '../types'

function formatMoney(v: string | number) {
  return `₹${Number(v).toLocaleString('en-IN')}`
}

function formatPnr(id: number) {
  return `TT${id}`
}

function formatScheduleTime(bookedAt: string, schedule?: Booking['schedule']) {
  if (schedule?.departureTime) {
    return new Date(schedule.departureTime).toLocaleString('en-IN', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }
  return new Date(bookedAt).toLocaleString('en-IN', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export function Bookings() {
  const { hasRole } = useAuth()
  const isAdmin = hasRole('ADMIN')
  const { showToast } = useToast()
  const queryClient = useQueryClient()

  const [dateFilter, setDateFilter] = useState('')
  const [scheduleFilter, setScheduleFilter] = useState('')
  const [statusFilter, setStatusFilter] = useState<BookingStatus | ''>('')
  const [cancelTarget, setCancelTarget] = useState<Booking | null>(null)
  const [page, setPage] = useState(1)

  const operatorQuery = useQuery({
    queryKey: ['operator-bookings'],
    queryFn: getOperatorBookings,
    enabled: !isAdmin,
  })

  const adminQuery = useQuery({
    queryKey: ['admin-bookings', page, statusFilter, dateFilter],
    queryFn: () =>
      getAdminBookings({
        page,
        limit: 20,
        status: statusFilter || undefined,
        fromDate: dateFilter || undefined,
        toDate: dateFilter || undefined,
      }),
    enabled: isAdmin,
  })

  const cancelMutation = useMutation({
    mutationFn: (id: number) => cancelBooking(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['admin-bookings'] })
      void queryClient.invalidateQueries({ queryKey: ['operator-bookings'] })
      setCancelTarget(null)
      showToast('Booking cancelled', 'success')
    },
    onError: (err) => showToast(getErrorMessage(err), 'error'),
  })

  const rawBookings = isAdmin
    ? (adminQuery.data?.bookings ?? [])
    : (operatorQuery.data ?? [])

  const bookings = useMemo(() => {
    let list = rawBookings
    if (scheduleFilter) {
      const q = scheduleFilter.toLowerCase()
      list = list.filter((b) => {
        const route = b.schedule?.route
        const label = route
          ? `${route.fromCity?.name} ${route.toCity?.name} ${route.code}`.toLowerCase()
          : ''
        return label.includes(q) || String(b.scheduleId).includes(q)
      })
    }
    if (!isAdmin && dateFilter) {
      list = list.filter((b) => b.bookedAt.startsWith(dateFilter))
    }
    return list
  }, [rawBookings, scheduleFilter, dateFilter, isAdmin])

  const loading = isAdmin ? adminQuery.isLoading : operatorQuery.isLoading
  const isError = isAdmin ? adminQuery.isError : operatorQuery.isError
  const totalCount = isAdmin
    ? (adminQuery.data?.pagination.total ?? bookings.length)
    : bookings.length

  if (isError) {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
        Failed to load bookings.
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="My Bookings"
        subtitle="Manage and track all passenger reservations across your routes."
      />

      <div className="card p-4">
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative min-w-[160px] flex-1">
            <Calendar className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              type="date"
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="input-field pl-10"
              aria-label="Filter by date"
            />
          </div>
          <div className="relative min-w-[200px] flex-[2]">
            <Clock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              type="search"
              value={scheduleFilter}
              onChange={(e) => setScheduleFilter(e.target.value)}
              placeholder="All schedules"
              className="input-field pl-10"
            />
          </div>
          {isAdmin && (
            <div className="relative min-w-[160px] flex-1">
              <Filter className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as BookingStatus | '')}
                className="input-field pl-10"
              >
                <option value="">All statuses</option>
                <option value="PENDING">Pending</option>
                <option value="CONFIRMED">Confirmed</option>
                <option value="EXPIRED">Expired</option>
                <option value="CANCELLED">Cancelled</option>
              </select>
            </div>
          )}
        </div>
      </div>

      {loading ? (
        <DataTable columns={[]} data={[]} keyExtractor={() => ''} loading />
      ) : bookings.length === 0 ? (
        <EmptyState
          icon={ClipboardList}
          title="No bookings yet"
          description="When passengers book seats on your schedules, they will appear here."
        />
      ) : (
        <>
          <DataTable
            data={bookings}
            keyExtractor={(b) => b.id}
            footer={
              <div className="flex flex-col gap-3 text-sm text-slate-500 sm:flex-row sm:items-center sm:justify-between">
                <span>
                  Showing {bookings.length} of {totalCount} bookings
                </span>
                {isAdmin && adminQuery.data && adminQuery.data.pagination.totalPages > 1 && (
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      disabled={page <= 1}
                      onClick={() => setPage((p) => p - 1)}
                      className="btn-secondary px-3 py-1 disabled:opacity-40"
                    >
                      Prev
                    </button>
                    <span className="rounded-lg bg-brand px-3 py-1 text-xs font-semibold text-white">
                      {page}
                    </span>
                    <button
                      type="button"
                      disabled={page >= adminQuery.data.pagination.totalPages}
                      onClick={() => setPage((p) => p + 1)}
                      className="btn-secondary px-3 py-1 disabled:opacity-40"
                    >
                      Next
                    </button>
                  </div>
                )}
              </div>
            }
            columns={[
              {
                key: 'pnr',
                header: 'PNR',
                render: (b) => (
                  <span className="font-semibold text-brand">{formatPnr(b.id)}</span>
                ),
              },
              {
                key: 'passenger',
                header: 'User',
                render: (b) => {
                  const name = b.user?.name ?? `User #${b.userId}`
                  return (
                    <div className="flex items-center gap-2">
                      <UserAvatar name={name} size="sm" />
                      <span>{name}</span>
                    </div>
                  )
                },
              },
              {
                key: 'route',
                header: 'Route',
                render: (b) =>
                  b.schedule?.route ? (
                    <span className="font-medium">
                      {b.schedule.route.fromCity?.name} → {b.schedule.route.toCity?.name}
                    </span>
                  ) : (
                    `Schedule #${b.scheduleId}`
                  ),
              },
              {
                key: 'time',
                header: 'Schedule Time',
                render: (b) => formatScheduleTime(b.bookedAt, b.schedule),
              },
              {
                key: 'seats',
                header: 'Seats',
                render: (b) =>
                  b.seats?.map((s) => s.seat.seatNumber).join(', ') || '—',
              },
              {
                key: 'amount',
                header: 'Amount',
                render: (b) => <span className="font-medium">{formatMoney(b.totalAmount)}</span>,
              },
              {
                key: 'payment',
                header: 'Payment',
                render: (b) => (
                  <StatusBadge
                    label={b.paymentStatus}
                    variant={paymentStatusVariant(b.paymentStatus)}
                  />
                ),
              },
              {
                key: 'status',
                header: 'Status',
                render: (b) => (
                  <StatusBadge
                    label={b.status}
                    variant={bookingStatusVariant(b.status)}
                    style="outline"
                  />
                ),
              },
              ...(isAdmin
                ? [
                    {
                      key: 'actions',
                      header: 'Actions',
                      render: (b: Booking) =>
                        b.status !== 'CANCELLED' ? (
                          <button
                            type="button"
                            onClick={() => setCancelTarget(b)}
                            className="text-sm font-medium text-red-600 hover:underline"
                          >
                            Cancel
                          </button>
                        ) : (
                          <span className="text-slate-300">—</span>
                        ),
                    },
                  ]
                : []),
            ]}
          />
        </>
      )}

      {isAdmin && (
        <ConfirmDialog
          open={!!cancelTarget}
          title="Cancel booking?"
          message={`Cancel booking ${cancelTarget ? formatPnr(cancelTarget.id) : ''}? Seats will be released.`}
          confirmLabel="Cancel booking"
          loading={cancelMutation.isPending}
          onConfirm={() => cancelTarget && cancelMutation.mutate(cancelTarget.id)}
          onCancel={() => setCancelTarget(null)}
        />
      )}
    </div>
  )
}
