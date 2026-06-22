import type { ScheduleScope } from '../types'

interface RecurrenceScopePickerProps {
  open: boolean
  title?: string
  onSelect: (scope: ScheduleScope) => void
  onCancel: () => void
}

export function RecurrenceScopePicker({
  open,
  title = 'Apply changes to',
  onSelect,
  onCancel,
}: RecurrenceScopePickerProps) {
  if (!open) return null

  const options: { scope: ScheduleScope; label: string; hint: string }[] = [
    { scope: 'this', label: 'This event', hint: 'Only this occurrence' },
    {
      scope: 'following',
      label: 'This and following events',
      hint: 'This and all future occurrences in the series',
    },
    { scope: 'all', label: 'All events', hint: 'Every occurrence in the series' },
  ]

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-sm rounded-xl bg-white p-5 shadow-xl">
        <h3 className="font-semibold text-slate-900">{title}</h3>
        <p className="mt-1 text-sm text-slate-500">This schedule is part of a repeating series.</p>
        <div className="mt-4 space-y-2">
          {options.map((opt) => (
            <button
              key={opt.scope}
              type="button"
              onClick={() => onSelect(opt.scope)}
              className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-left hover:border-indigo-300 hover:bg-indigo-50"
            >
              <span className="block text-sm font-medium text-slate-900">{opt.label}</span>
              <span className="text-xs text-slate-500">{opt.hint}</span>
            </button>
          ))}
        </div>
        <button
          type="button"
          onClick={onCancel}
          className="mt-4 w-full rounded-lg border border-slate-200 py-2 text-sm text-slate-600 hover:bg-slate-50"
        >
          Cancel
        </button>
      </div>
    </div>
  )
}
