import { useMemo, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { ClipboardList } from 'lucide-react'
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
import { StatusBadge, bookingStatusVariant } from '../components/StatusBadge'
import { useToast } from '../hooks/useToast'
import type { Booking, BookingStatus } from '../types'

function formatMoney(v: string | number) {
  return `₹${Number(v).toLocaleString('en-IN')}`
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

  if (isError) {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
        Failed to load bookings.
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-slate-900">My Bookings</h1>
        <p className="text-sm text-slate-500">
          {isAdmin ? 'All platform bookings' : 'Bookings on your fleet (read-only)'}
        </p>
      </div>

      <div className="flex flex-wrap gap-3">
        <input
          type="date"
          value={dateFilter}
          onChange={(e) => setDateFilter(e.target.value)}
          className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
          placeholder="Filter by date"
        />
        <input
          type="search"
          value={scheduleFilter}
          onChange={(e) => setScheduleFilter(e.target.value)}
          placeholder="Search by route or schedule..."
          className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
        />
        {isAdmin && (
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as BookingStatus | '')}
            className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
          >
            <option value="">All statuses</option>
            <option value="PENDING">Pending</option>
            <option value="CONFIRMED">Confirmed</option>
            <option value="EXPIRED">Expired</option>
            <option value="CANCELLED">Cancelled</option>
          </select>
        )}
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
            columns={[
              { key: 'id', header: 'ID', render: (b) => `#${b.id}` },
              {
                key: 'passenger',
                header: 'Passenger',
                render: (b) => b.user?.name ?? `User #${b.userId}`,
              },
              {
                key: 'route',
                header: 'Route',
                render: (b) =>
                  b.schedule?.route
                    ? `${b.schedule.route.fromCity?.name} → ${b.schedule.route.toCity?.name}`
                    : `Schedule #${b.scheduleId}`,
              },
              {
                key: 'seats',
                header: 'Seats',
                render: (b) =>
                  b.seats?.map((s) => s.seat.seatNumber).join(', ') ?? '—',
              },
              {
                key: 'amount',
                header: 'Total',
                render: (b) => formatMoney(b.totalAmount),
              },
              {
                key: 'status',
                header: 'Status',
                render: (b) => (
                  <StatusBadge label={b.status} variant={bookingStatusVariant(b.status)} />
                ),
              },
              ...(isAdmin
                ? [
                    {
                      key: 'actions',
                      header: '',
                      render: (b: Booking) =>
                        b.status !== 'CANCELLED' ? (
                          <button
                            type="button"
                            onClick={() => setCancelTarget(b)}
                            className="text-sm text-red-600 hover:underline"
                          >
                            Cancel
                          </button>
                        ) : null,
                    },
                  ]
                : []),
            ]}
          />
          {isAdmin && adminQuery.data && adminQuery.data.pagination.totalPages > 1 && (
            <div className="flex justify-center gap-2">
              <button
                type="button"
                disabled={page <= 1}
                onClick={() => setPage((p) => p - 1)}
                className="rounded border px-3 py-1 text-sm disabled:opacity-40"
              >
                Previous
              </button>
              <span className="px-2 py-1 text-sm text-slate-500">
                Page {page} of {adminQuery.data.pagination.totalPages}
              </span>
              <button
                type="button"
                disabled={page >= adminQuery.data.pagination.totalPages}
                onClick={() => setPage((p) => p + 1)}
                className="rounded border px-3 py-1 text-sm disabled:opacity-40"
              >
                Next
              </button>
            </div>
          )}
        </>
      )}

      {isAdmin && (
        <ConfirmDialog
          open={!!cancelTarget}
          title="Cancel booking?"
          message={`Cancel booking #${cancelTarget?.id}? Seats will be released.`}
          confirmLabel="Cancel booking"
          loading={cancelMutation.isPending}
          onConfirm={() => cancelTarget && cancelMutation.mutate(cancelTarget.id)}
          onCancel={() => setCancelTarget(null)}
        />
      )}
    </div>
  )
}
