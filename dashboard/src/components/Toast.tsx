import { X } from 'lucide-react'
import type { ToastType } from '../hooks/useToast'

interface ToastItem {
  id: number
  message: string
  type: ToastType
}

interface ToastContainerProps {
  toasts: ToastItem[]
  onDismiss: (id: number) => void
}

const typeStyles: Record<ToastType, string> = {
  success: 'border-emerald-200 bg-emerald-50 text-emerald-800',
  error: 'border-red-200 bg-red-50 text-red-800',
  info: 'border-sky-200 bg-sky-50 text-sky-800',
}

export function ToastContainer({ toasts, onDismiss }: ToastContainerProps) {
  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`flex min-w-[280px] items-center justify-between gap-3 rounded-lg border px-4 py-3 text-sm shadow-lg ${typeStyles[toast.type]}`}
        >
          <span>{toast.message}</span>
          <button
            type="button"
            onClick={() => onDismiss(toast.id)}
            className="shrink-0 opacity-60 hover:opacity-100"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      ))}
    </div>
  )
}
