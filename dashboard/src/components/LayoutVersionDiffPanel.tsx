import { GitCompare } from 'lucide-react'
import { diffHasChanges, summarizeLayoutDiff, type LayoutVersionDiff } from '../lib/layoutVersionDiff'

export interface LayoutVersionDiffPanelProps {
  fromVersion: number
  toVersion: number
  diff: LayoutVersionDiff
  onClose?: () => void
}

export function LayoutVersionDiffPanel({
  fromVersion,
  toVersion,
  diff,
  onClose,
}: LayoutVersionDiffPanelProps) {
  const lines = summarizeLayoutDiff(diff)
  const changed = diffHasChanges(diff)

  return (
    <div className="rounded-lg border border-slate-200 bg-slate-50 p-3 space-y-2">
      <div className="flex items-center justify-between gap-2">
        <p className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-slate-600">
          <GitCompare className="h-3.5 w-3.5" />
          v{fromVersion} → v{toVersion}
        </p>
        {onClose && (
          <button type="button" className="text-[11px] text-slate-500 hover:text-slate-700" onClick={onClose}>
            Close
          </button>
        )}
      </div>
      <ul className="space-y-1 text-xs text-slate-700">
        {lines.map((line) => (
          <li key={line} className={changed ? '' : 'text-slate-500'}>
            {line}
          </li>
        ))}
      </ul>
    </div>
  )
}
