import type { LucideIcon } from 'lucide-react'

interface StatCardProps {
  label: string
  value: string | number
  icon: LucideIcon
  loading?: boolean
}

export function StatCard({ label, value, icon: Icon, loading }: StatCardProps) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-slate-500">{label}</p>
          {loading ? (
            <div className="mt-2 h-8 w-24 animate-pulse rounded bg-slate-100" />
          ) : (
            <p className="mt-1 text-2xl font-semibold text-slate-900">{value}</p>
          )}
        </div>
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600">
          <Icon className="h-5 w-5" />
        </div>
      </div>
    </div>
  )
}
