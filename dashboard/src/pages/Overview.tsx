import { useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { Bus, ClipboardList, IndianRupee, Percent } from 'lucide-react'
import { listBuses } from '../api/buses'
import { listSchedules } from '../api/schedules'
import { listSeatsBySchedule } from '../api/seats'
import { getReportsSummary } from '../api/reports'
import { StatCard } from '../components/StatCard'
import { useAuth } from '../auth/AuthContext'

function formatCurrency(n: number) {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(n)
}

export function Overview() {
  const { user } = useAuth()

  const reportsQuery = useQuery({
    queryKey: ['reports-summary'],
    queryFn: () => getReportsSummary(),
  })

  const busesQuery = useQuery({
    queryKey: ['buses'],
    queryFn: listBuses,
  })

  const schedulesQuery = useQuery({
    queryKey: ['schedules'],
    queryFn: () => listSchedules({ status: 'ACTIVE' }),
  })

  const latestScheduleId = schedulesQuery.data?.[0]?.id

  const seatsQuery = useQuery({
    queryKey: ['seat-summary', latestScheduleId],
    queryFn: () => listSeatsBySchedule(latestScheduleId!),
    enabled: !!latestScheduleId,
  })

  const occupancy = useMemo(() => {
    const summary = seatsQuery.data?.summary
    if (!summary || summary.total === 0) return '0%'
    const pct = Math.round(((summary.booked + summary.held) / summary.total) * 100)
    return `${pct}%`
  }, [seatsQuery.data])

  const chartData = useMemo(() => {
    const r = reportsQuery.data
    if (!r) return []
    return [
      { name: 'Confirmed', value: r.bookings.confirmed },
      { name: 'Cancelled', value: r.bookings.cancelled },
      { name: 'Paid', value: r.payments.paid },
      { name: 'Pending', value: r.payments.pending },
    ]
  }, [reportsQuery.data])

  const loading = reportsQuery.isLoading || busesQuery.isLoading

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-slate-900">
          {user?.role === 'ADMIN' ? 'Platform Overview' : 'Overview'}
        </h1>
        <p className="text-sm text-slate-500">
          {user?.role === 'ADMIN'
            ? 'Platform-wide performance at a glance'
            : 'Your fleet performance at a glance'}
        </p>
      </div>

      {(reportsQuery.isError || busesQuery.isError) && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          Could not load dashboard data. Please try again.
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Revenue"
          value={formatCurrency(reportsQuery.data?.revenue.totalCollected ?? 0)}
          icon={IndianRupee}
          loading={loading}
        />
        <StatCard
          label="Bookings"
          value={reportsQuery.data?.bookings.total ?? 0}
          icon={ClipboardList}
          loading={loading}
        />
        <StatCard
          label="Buses"
          value={busesQuery.data?.length ?? 0}
          icon={Bus}
          loading={loading}
        />
        <StatCard
          label="Occupancy"
          value={occupancy}
          icon={Percent}
          loading={loading || seatsQuery.isLoading}
        />
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        <h2 className="mb-4 text-sm font-medium text-slate-700">Booking activity</h2>
        {reportsQuery.isLoading ? (
          <div className="flex h-64 items-center justify-center text-sm text-slate-400">
            Loading chart...
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="name" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} allowDecimals={false} />
              <Tooltip />
              <Bar dataKey="value" fill="#4f46e5" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  )
}
