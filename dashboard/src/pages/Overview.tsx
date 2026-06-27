import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
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
import {
  Bus,
  Calendar,
  ChevronRight,
  ClipboardList,
  IndianRupee,
  Megaphone,
  Percent,
  Ticket,
} from 'lucide-react'
import { listBuses } from '../api/buses'
import { listSchedules } from '../api/schedules'
import { listSeatsBySchedule } from '../api/seats'
import { getReportsSummary } from '../api/reports'
import { PageHeader } from '../components/PageHeader'
import { StatCard } from '../components/StatCard'
import { useAuth } from '../auth/AuthContext'

function formatCurrency(n: number) {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(n)
}

const quickActions = [
  {
    title: 'Manage Schedules',
    description: 'Update dispatch times',
    icon: Calendar,
    to: '/schedules',
  },
  {
    title: 'View Bookings',
    description: 'Track passenger reservations',
    icon: Ticket,
    to: '/bookings',
  },
  {
    title: 'Fleet Overview',
    description: 'Manage buses and capacity',
    icon: Bus,
    to: '/buses',
  },
]

export function Overview() {
  const { user } = useAuth()
  const isAdmin = user?.role === 'ADMIN'
  const [chartRange, setChartRange] = useState<'today' | 'week'>('today')

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
  const activeSchedules = schedulesQuery.data?.length ?? 0
  const totalBuses = busesQuery.data?.length ?? 0

  return (
    <div className="space-y-6">
      <PageHeader
        title={isAdmin ? 'Platform Overview' : 'Fleet Overview'}
        subtitle={
          isAdmin
            ? 'Real-time metrics and operational status across the platform.'
            : 'Your fleet performance and booking activity at a glance.'
        }
      />

      {(reportsQuery.isError || busesQuery.isError) && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          Could not load dashboard data. Please try again.
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label={isAdmin ? 'Total Revenue' : 'Daily Revenue'}
          value={formatCurrency(reportsQuery.data?.revenue.totalCollected ?? 0)}
          icon={IndianRupee}
          loading={loading}
          hint="+12% vs last period"
          hintTone="positive"
        />
        <StatCard
          label="Total Bookings"
          value={reportsQuery.data?.bookings.total ?? 0}
          icon={ClipboardList}
          loading={loading}
          hint="+8% this week"
          hintTone="positive"
        />
        <StatCard
          label={isAdmin ? 'Active Buses' : 'Fleet Size'}
          value={isAdmin ? `${activeSchedules} / ${totalBuses}` : totalBuses}
          icon={Bus}
          loading={loading}
          hint={isAdmin ? 'Active schedules / total buses' : 'Registered vehicles'}
          hintTone="neutral"
        />
        <StatCard
          label="Avg Occupancy"
          value={occupancy}
          icon={Percent}
          loading={loading || seatsQuery.isLoading}
          hint="Based on latest schedule"
          hintTone="neutral"
          iconTone="warning"
        />
      </div>

      <div className="grid gap-6 xl:grid-cols-3">
        <div className="card p-5 xl:col-span-2">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-semibold text-slate-900">Booking Activity</h2>
            <div className="flex rounded-lg border border-slate-200 p-0.5 text-xs font-medium">
              <button
                type="button"
                onClick={() => setChartRange('today')}
                className={`rounded-md px-3 py-1 transition ${
                  chartRange === 'today' ? 'bg-brand text-white' : 'text-slate-600 hover:bg-slate-50'
                }`}
              >
                Today
              </button>
              <button
                type="button"
                onClick={() => setChartRange('week')}
                className={`rounded-md px-3 py-1 transition ${
                  chartRange === 'week' ? 'bg-brand text-white' : 'text-slate-600 hover:bg-slate-50'
                }`}
              >
                Week
              </button>
            </div>
          </div>
          {reportsQuery.isLoading ? (
            <div className="flex h-64 items-center justify-center text-sm text-slate-400">
              Loading chart...
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                <XAxis dataKey="name" tick={{ fontSize: 12, fill: '#64748b' }} axisLine={false} />
                <YAxis tick={{ fontSize: 12, fill: '#64748b' }} allowDecimals={false} axisLine={false} />
                <Tooltip
                  contentStyle={{
                    borderRadius: '0.5rem',
                    border: '1px solid #e2e8f0',
                    fontSize: '0.875rem',
                  }}
                />
                <Bar dataKey="value" fill="#008080" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        <div className="card p-5">
          <h2 className="mb-4 font-semibold text-slate-900">Quick Actions</h2>
          <div className="space-y-2">
            {quickActions.map((action) => (
              <Link
                key={action.to}
                to={action.to}
                className="flex items-center gap-3 rounded-xl border border-slate-200 p-3 transition hover:border-brand-muted hover:bg-brand-light/40"
              >
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-brand-light text-brand">
                  <action.icon className="h-5 w-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-slate-900">{action.title}</p>
                  <p className="text-xs text-slate-500">{action.description}</p>
                </div>
                <ChevronRight className="h-4 w-4 shrink-0 text-slate-400" />
              </Link>
            ))}
            {isAdmin && (
              <Link
                to="/admin/logs"
                className="flex items-center gap-3 rounded-xl border border-slate-200 p-3 transition hover:border-brand-muted hover:bg-brand-light/40"
              >
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-amber-50 text-amber-600">
                  <Megaphone className="h-5 w-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-slate-900">Audit Logs</p>
                  <p className="text-xs text-slate-500">Review platform activity</p>
                </div>
                <ChevronRight className="h-4 w-4 shrink-0 text-slate-400" />
              </Link>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
