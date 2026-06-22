type BadgeVariant = 'success' | 'warning' | 'danger' | 'info' | 'neutral'

const styles: Record<BadgeVariant, string> = {
  success: 'bg-emerald-50 text-emerald-700',
  warning: 'bg-amber-50 text-amber-700',
  danger: 'bg-red-50 text-red-700',
  info: 'bg-sky-50 text-sky-700',
  neutral: 'bg-slate-100 text-slate-600',
}

interface StatusBadgeProps {
  label: string
  variant?: BadgeVariant
}

export function StatusBadge({ label, variant = 'neutral' }: StatusBadgeProps) {
  return (
    <span
      className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${styles[variant]}`}
    >
      {label}
    </span>
  )
}

export function bookingStatusVariant(status: string): BadgeVariant {
  switch (status) {
    case 'CONFIRMED':
      return 'success'
    case 'PENDING':
      return 'warning'
    case 'CANCELLED':
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
      return 'Out of Service'
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
