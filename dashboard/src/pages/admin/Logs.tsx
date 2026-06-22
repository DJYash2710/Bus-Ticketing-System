import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { ScrollText } from 'lucide-react'
import { getLogs } from '../../api/logs'
import { EmptyState } from '../../components/EmptyState'
import { getAccessToken } from '../../lib/storage'
import type { LogEntry } from '../../types'

const API_BASE =
  import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:4000/api/v1'

function entryKey(entry: LogEntry): string {
  return JSON.stringify(entry)
}

export function Logs() {
  const [lines, setLines] = useState(100)
  const [entries, setEntries] = useState<LogEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState<string | null>(null)
  const [emptyMessage, setEmptyMessage] = useState<string | undefined>()
  const [isLive, setIsLive] = useState(false)
  const eventSourceRef = useRef<EventSource | null>(null)
  const reconnectTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const connectStream = useCallback(() => {
    const token = getAccessToken()
    if (!token) {
      setIsLive(false)
      return
    }

    eventSourceRef.current?.close()

    const url = `${API_BASE}/admin/logs/stream?token=${encodeURIComponent(token)}`
    const es = new EventSource(url)
    eventSourceRef.current = es

    es.onopen = () => setIsLive(true)

    es.onmessage = (event) => {
      try {
        const entry = JSON.parse(event.data) as LogEntry
        setEntries((prev) => {
          const key = entryKey(entry)
          if (prev.some((e) => entryKey(e) === key)) return prev
          return [entry, ...prev]
        })
      } catch {
        // ignore malformed SSE payloads
      }
    }

    es.onerror = () => {
      setIsLive(false)
      es.close()
      eventSourceRef.current = null
      reconnectTimerRef.current = setTimeout(connectStream, 3000)
    }
  }, [])

  useEffect(() => {
    let cancelled = false

    async function loadInitial() {
      setLoading(true)
      setLoadError(null)
      try {
        const data = await getLogs(lines)
        if (cancelled) return
        setEntries(data.logs)
        setEmptyMessage(data.message)
      } catch (err) {
        if (cancelled) return
        setLoadError(err instanceof Error ? err.message : 'Failed to load logs')
        setEntries([])
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    void loadInitial()
    return () => {
      cancelled = true
    }
  }, [lines])

  useEffect(() => {
    connectStream()
    return () => {
      if (reconnectTimerRef.current) clearTimeout(reconnectTimerRef.current)
      eventSourceRef.current?.close()
      eventSourceRef.current = null
      setIsLive(false)
    }
  }, [connectStream])

  const displayedEntries = useMemo(() => entries.slice(0, lines), [entries, lines])

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-semibold text-slate-900">System Logs</h1>
            {isLive && (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-700">
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
                </span>
                Live
              </span>
            )}
          </div>
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

      {loading ? (
        <div className="rounded-xl border bg-white p-8 text-center text-sm text-slate-500">
          Loading logs...
        </div>
      ) : loadError ? (
        <div className="rounded-xl border border-red-200 bg-red-50 p-8 text-center text-sm text-red-600">
          {loadError}
        </div>
      ) : displayedEntries.length === 0 ? (
        <EmptyState
          icon={ScrollText}
          title="No logs yet"
          description={emptyMessage ?? 'Log file is empty or not found.'}
        />
      ) : (
        <div className="overflow-hidden rounded-xl border border-slate-200 bg-slate-900 shadow-sm">
          <div className="max-h-[70vh] overflow-auto p-4 font-mono text-xs text-slate-100">
            {displayedEntries.map((entry, i) => (
              <div key={entryKey(entry) + i} className="border-b border-slate-800 py-2 last:border-0">
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
                    {entry.category === 'auth' && entry.event != null ? (
                      <span className="text-sky-300">[{String(entry.event)}] </span>
                    ) : null}
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
