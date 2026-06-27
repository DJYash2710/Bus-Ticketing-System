import type { LucideIcon } from 'lucide-react'

interface StatCardProps {
  label: string
  value: string | number
  icon: LucideIcon
  loading?: boolean
  hint?: string
  hintTone?: 'positive' | 'negative' | 'neutral'
  iconTone?: 'brand' | 'success' | 'warning' | 'danger' | 'neutral'
}

const iconTones = {
  brand: 'bg-brand-light text-brand',
  success: 'bg-emerald-50 text-emerald-600',
  warning: 'bg-amber-50 text-amber-600',
  danger: 'bg-red-50 text-red-600',
  neutral: 'bg-slate-100 text-slate-500',
}

const hintTones = {
  positive: 'text-emerald-600',
  negative: 'text-red-600',
  neutral: 'text-slate-500',
}

export function StatCard({
  label,
  value,
  icon: Icon,
  loading,
  hint,
  hintTone = 'neutral',
  iconTone = 'brand',
}: StatCardProps) {
  return (
    <div className="card p-5">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">
            {label}
          </p>
          {loading ? (
            <div className="mt-2 h-8 w-24 animate-pulse rounded bg-slate-100" />
          ) : (
            <p className="mt-1 text-2xl font-bold tracking-tight text-slate-900">{value}</p>
          )}
          {hint && !loading && (
            <p className={`mt-1 text-xs font-medium ${hintTones[hintTone]}`}>{hint}</p>
          )}
        </div>
        <div
          className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${iconTones[iconTone]}`}
        >
          <Icon className="h-5 w-5" />
        </div>
      </div>
    </div>
  )
}
