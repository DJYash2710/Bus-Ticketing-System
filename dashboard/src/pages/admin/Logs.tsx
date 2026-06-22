import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { ScrollText } from 'lucide-react'
import { getLogs } from '../../api/logs'
import { EmptyState } from '../../components/EmptyState'

export function Logs() {
  const [lines, setLines] = useState(100)

  const logsQuery = useQuery({
    queryKey: ['logs', lines],
    queryFn: () => getLogs(lines),
  })

  const logs = logsQuery.data?.logs ?? []

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">System Logs</h1>
          <p className="text-sm text-slate-500">Recent server log entries</p>
        </div>
        <select
          value={lines}
          onChange={(e) => setLines(Number(e.target.value))}
          className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
        >
          <option value={50}>50 lines</option>
          <option value={100}>100 lines</option>
          <option value={250}>250 lines</option>
          <option value={500}>500 lines</option>
        </select>
      </div>

      {logsQuery.isLoading ? (
        <div className="rounded-xl border bg-white p-8 text-center text-sm text-slate-500">
          Loading logs...
        </div>
      ) : logs.length === 0 ? (
        <EmptyState
          icon={ScrollText}
          title="No logs yet"
          description={logsQuery.data?.message ?? 'Log file is empty or not found.'}
        />
      ) : (
        <div className="overflow-hidden rounded-xl border border-slate-200 bg-slate-900 shadow-sm">
          <div className="max-h-[70vh] overflow-auto p-4 font-mono text-xs text-slate-100">
            {logs.map((entry, i) => (
              <div key={i} className="border-b border-slate-800 py-2 last:border-0">
                {entry.raw ? (
                  <span>{entry.raw}</span>
                ) : (
                  <span>
                    <span className="text-slate-400">
                      {entry.timestamp ? String(entry.timestamp) : ''}
                    </span>{' '}
                    <span
                      className={
                        entry.level === 'error'
                          ? 'text-red-400'
                          : entry.level === 'warn'
                            ? 'text-amber-400'
                            : 'text-emerald-400'
                      }
                    >
                      [{String(entry.level ?? 'info')}]
                    </span>{' '}
                    {String(entry.message ?? JSON.stringify(entry))}
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
