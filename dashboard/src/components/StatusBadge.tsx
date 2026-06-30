type BadgeVariant = 'success' | 'warning' | 'danger' | 'info' | 'neutral' | 'brand'
type BadgeStyle = 'filled' | 'outline'

const filledStyles: Record<BadgeVariant, string> = {
  success: 'bg-emerald-50 text-emerald-700',
  warning: 'bg-amber-50 text-amber-700',
  danger: 'bg-red-50 text-red-700',
  info: 'bg-sky-50 text-sky-700',
  neutral: 'bg-slate-100 text-slate-600',
  brand: 'bg-brand-light text-brand',
}

const outlineStyles: Record<BadgeVariant, string> = {
  success: 'border border-emerald-200 bg-white text-emerald-700',
  warning: 'border border-amber-200 bg-white text-amber-700',
  danger: 'border border-red-200 bg-white text-red-700',
  info: 'border border-sky-200 bg-white text-sky-700',
  neutral: 'border border-slate-200 bg-white text-slate-600',
  brand: 'border border-brand-muted bg-white text-brand',
}

interface StatusBadgeProps {
  label: string
  variant?: BadgeVariant
  style?: BadgeStyle
}

export function StatusBadge({
  label,
  variant = 'neutral',
  style = 'filled',
}: StatusBadgeProps) {
  const palette = style === 'outline' ? outlineStyles : filledStyles
  return (
    <span
      className={`inline-flex rounded-full px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wide ${palette[variant]}`}
    >
      {label}
    </span>
  )
}

export function bookingStatusVariant(status: string): BadgeVariant {
  switch (status) {
    case 'CONFIRMED':
      return 'brand'
    case 'PENDING':
      return 'warning'
    case 'EXPIRED':
      return 'neutral'
    case 'CANCELLED':
      return 'danger'
    default:
      return 'neutral'
  }
}

export function paymentStatusVariant(status: string): BadgeVariant {
  switch (status) {
    case 'PAID':
    case 'SUCCESS':
      return 'success'
    case 'PENDING':
      return 'warning'
    case 'REFUNDED':
    case 'FAILED':
      return 'danger'
    default:
      return 'neutral'
  }
}

export function seatStatusLabel(status: string): string {
  switch (status) {
    case 'AVAILABLE':
      return 'Available'
    case 'BOOKED':
      return 'Booked'
    case 'HELD':
      return 'Held'
    default:
      return status
  }
}

export function seatStatusVariant(status: string): BadgeVariant {
  switch (status) {
    case 'AVAILABLE':
      return 'success'
    case 'BOOKED':
      return 'danger'
    case 'HELD':
      return 'warning'
    default:
      return 'neutral'
  }
}

export function busTypeVariant(bodyType: string): BadgeVariant {
  switch (bodyType) {
    case 'SLEEPER':
      return 'warning'
    case 'SEMI_SLEEPER':
      return 'info'
    default:
      return 'brand'
  }
}
