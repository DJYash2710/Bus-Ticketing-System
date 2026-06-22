import { Fragment, useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { ScrollText } from 'lucide-react'
import { getAuditLogs, getLogs } from '../../api/logs'
import { EmptyState } from '../../components/EmptyState'
import { getAccessToken } from '../../lib/storage'
import type { AuditLogEntry, LogEntry } from '../../types'

const API_BASE =
  import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:4000/api/v1'

type LogTab = 'audit' | 'system'

const AUDIT_ACTIONS = [
  '',
  'LOGIN_SUCCESS',
  'LOGIN_FAILED',
  'REGISTER',
  'LOGOUT',
  'REFRESH_TOKEN',
  'BOOKING_CREATED',
  'BOOKING_CONFIRMED',
  'BOOKING_CANCELLED',
  'BOOKING_EXPIRED',
  'BOOKING_REFUNDED',
  'SEAT_HELD',
  'SEAT_BOOKED',
  'SEAT_RELEASED',
  'SEAT_STATUS_CHANGED',
  'PAYMENT_CREATED',
  'PAYMENT_SUCCESS',
  'PAYMENT_FAILED',
  'PAYMENT_REFUNDED',
  'COUPON_APPLIED',
  'COUPON_REDEEMED',
  'CREDITS_REDEEMED',
  'CREDITS_EARNED',
  'BUS_CREATED',
  'BUS_UPDATED',
  'BUS_DELETED',
  'ROUTE_CREATED',
  'ROUTE_UPDATED',
  'ROUTE_DELETED',
  'SCHEDULE_CREATED',
  'SCHEDULE_UPDATED',
  'SCHEDULE_CANCELLED',
]

const ENTITY_TYPES = [
  '',
  'USER',
  'BOOKING',
  'SEAT',
  'PAYMENT',
  'COUPON',
  'LOYALTY',
  'BUS',
  'ROUTE',
  'SCHEDULE',
]

function entryKey(entry: LogEntry): string {
  return JSON.stringify(entry)
}

function actionTone(action: string): string {
  if (action.includes('FAILED') || action.includes('CANCELLED') || action.includes('EXPIRED')) {
    return 'text-red-400'
  }
  if (action.includes('SUCCESS') || action.includes('CONFIRMED') || action.includes('CREATED')) {
    return 'text-emerald-400'
  }
  if (action.startsWith('PAYMENT')) return 'text-lime-400'
  if (action.startsWith('BOOKING')) return 'text-violet-400'
  if (action.startsWith('SEAT')) return 'text-amber-400'
  if (action.startsWith('LOGIN') || action === 'REGISTER' || action === 'LOGOUT') {
    return 'text-sky-400'
  }
  return 'text-slate-200'
}

function formatMetadata(metadata: Record<string, unknown> | null): string {
  if (!metadata || Object.keys(metadata).length === 0) return ''
  try {
    return JSON.stringify(metadata)
  } catch {
    return ''
  }
}

function formatTimestamp(value: string): string {
  const d = new Date(value)
  return Number.isNaN(d.getTime()) ? value : d.toLocaleString()
}

function SystemLogsPanel() {
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
    <div className="space-y-4">
      <div className="flex items-center justify-end gap-3">
        {isLive && (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-700">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
            </span>
            Live
          </span>
        )}
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
          Loading system logs...
        </div>
      ) : loadError ? (
        <div className="rounded-xl border border-red-200 bg-red-50 p-8 text-center text-sm text-red-600">
          {loadError}
        </div>
      ) : displayedEntries.length === 0 ? (
        <EmptyState
          icon={ScrollText}
          title="No system logs yet"
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

function AuditLogsPanel() {
  const [page, setPage] = useState(1)
  const [limit, setLimit] = useState(50)
  const [action, setAction] = useState('')
  const [entityType, setEntityType] = useState('')
  const [actorId, setActorId] = useState('')
  const [fromDate, setFromDate] = useState('')
  const [toDate, setToDate] = useState('')
  const [entries, setEntries] = useState<AuditLogEntry[]>([])
  const [total, setTotal] = useState(0)
  const [totalPages, setTotalPages] = useState(1)
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState<string | null>(null)
  const [expandedId, setExpandedId] = useState<number | null>(null)

  const loadAuditLogs = useCallback(async () => {
    setLoading(true)
    setLoadError(null)
    try {
      const params: {
        page: number
        limit: number
        action?: string
        entityType?: string
        actorId?: number
        fromDate?: string
        toDate?: string
      } = { page, limit }

      if (action) params.action = action
      if (entityType) params.entityType = entityType
      if (actorId.trim()) params.actorId = Number(actorId)
      if (fromDate) params.fromDate = fromDate
      if (toDate) params.toDate = toDate

      const data = await getAuditLogs(params)
      setEntries(data.logs)
      setTotal(data.pagination.total)
      setTotalPages(data.pagination.totalPages)
    } catch (err) {
      setLoadError(err instanceof Error ? err.message : 'Failed to load audit logs')
      setEntries([])
    } finally {
      setLoading(false)
    }
  }, [page, limit, action, entityType, actorId, fromDate, toDate])

  useEffect(() => {
    void loadAuditLogs()
  }, [loadAuditLogs])

  useEffect(() => {
    const timer = setInterval(() => {
      void loadAuditLogs()
    }, 15_000)
    return () => clearInterval(timer)
  }, [loadAuditLogs])

  return (
    <div className="space-y-4">
      <div className="grid gap-3 rounded-xl border border-slate-200 bg-white p-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        <label className="block text-xs font-medium text-slate-600">
          Action
          <select
            value={action}
            onChange={(e) => {
              setPage(1)
              setAction(e.target.value)
            }}
            className="mt-1 w-full rounded-lg border border-slate-300 px-2 py-1.5 text-sm"
          >
            <option value="">All actions</option>
            {AUDIT_ACTIONS.filter(Boolean).map((a) => (
              <option key={a} value={a}>
                {a}
              </option>
            ))}
          </select>
        </label>
        <label className="block text-xs font-medium text-slate-600">
          Entity type
          <select
            value={entityType}
            onChange={(e) => {
              setPage(1)
              setEntityType(e.target.value)
            }}
            className="mt-1 w-full rounded-lg border border-slate-300 px-2 py-1.5 text-sm"
          >
            <option value="">All types</option>
            {ENTITY_TYPES.filter(Boolean).map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        </label>
        <label className="block text-xs font-medium text-slate-600">
          Actor ID
          <input
            type="number"
            value={actorId}
            onChange={(e) => {
              setPage(1)
              setActorId(e.target.value)
            }}
            placeholder="User id"
            className="mt-1 w-full rounded-lg border border-slate-300 px-2 py-1.5 text-sm"
          />
        </label>
        <label className="block text-xs font-medium text-slate-600">
          From date
          <input
            type="date"
            value={fromDate}
            onChange={(e) => {
              setPage(1)
              setFromDate(e.target.value)
            }}
            className="mt-1 w-full rounded-lg border border-slate-300 px-2 py-1.5 text-sm"
          />
        </label>
        <label className="block text-xs font-medium text-slate-600">
          To date
          <input
            type="date"
            value={toDate}
            onChange={(e) => {
              setPage(1)
              setToDate(e.target.value)
            }}
            className="mt-1 w-full rounded-lg border border-slate-300 px-2 py-1.5 text-sm"
          />
        </label>
        <label className="block text-xs font-medium text-slate-600">
          Per page
          <select
            value={limit}
            onChange={(e) => {
              setPage(1)
              setLimit(Number(e.target.value))
            }}
            className="mt-1 w-full rounded-lg border border-slate-300 px-2 py-1.5 text-sm"
          >
            <option value={20}>20</option>
            <option value={50}>50</option>
            <option value={100}>100</option>
          </select>
        </label>
      </div>

      <div className="flex items-center justify-between text-sm text-slate-500">
        <span>{total} audit event{total === 1 ? '' : 's'}</span>
        <button
          type="button"
          onClick={() => void loadAuditLogs()}
          className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm hover:bg-slate-50"
        >
          Refresh
        </button>
      </div>

      {loading ? (
        <div className="rounded-xl border bg-white p-8 text-center text-sm text-slate-500">
          Loading audit trail...
        </div>
      ) : loadError ? (
        <div className="rounded-xl border border-red-200 bg-red-50 p-8 text-center text-sm text-red-600">
          {loadError}
        </div>
      ) : entries.length === 0 ? (
        <EmptyState
          icon={ScrollText}
          title="No audit events yet"
          description="Business events will appear here after logins, bookings, payments, and admin actions."
        />
      ) : (
        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
          <div className="max-h-[70vh] overflow-auto">
            <table className="min-w-full text-left text-sm">
              <thead className="sticky top-0 bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="px-4 py-3">Time</th>
                  <th className="px-4 py-3">Action</th>
                  <th className="px-4 py-3">Actor</th>
                  <th className="px-4 py-3">Entity</th>
                  <th className="px-4 py-3">IP</th>
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {entries.map((entry) => {
                  const meta = formatMetadata(entry.metadata)
                  const isExpanded = expandedId === entry.id
                  return (
                    <Fragment key={entry.id}>
                      <tr key={entry.id} className="hover:bg-slate-50">
                        <td className="whitespace-nowrap px-4 py-3 text-xs text-slate-500">
                          {formatTimestamp(entry.createdAt)}
                        </td>
                        <td className="px-4 py-3 font-mono text-xs font-medium text-slate-800">
                          {entry.action}
                        </td>
                        <td className="px-4 py-3 text-xs text-slate-600">
                          {entry.actorId != null ? (
                            <>
                              #{entry.actorId}
                              {entry.actorRole ? (
                                <span className="ml-1 text-slate-400">({entry.actorRole})</span>
                              ) : null}
                            </>
                          ) : (
                            <span className="text-slate-400">{entry.actorRole ?? '—'}</span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-xs text-slate-600">
                          {entry.entityType}
                          {entry.entityId != null ? ` #${entry.entityId}` : ''}
                        </td>
                        <td className="px-4 py-3 text-xs text-slate-500">
                          {entry.ipAddress ?? '—'}
                        </td>
                        <td className="px-4 py-3 text-right">
                          {meta ? (
                            <button
                              type="button"
                              onClick={() =>
                                setExpandedId(isExpanded ? null : entry.id)
                              }
                              className="text-xs text-indigo-600 hover:underline"
                            >
                              {isExpanded ? 'Hide' : 'Details'}
                            </button>
                          ) : null}
                        </td>
                      </tr>
                      {isExpanded && meta ? (
                        <tr className="bg-slate-900">
                          <td colSpan={6} className="px-4 py-3 font-mono text-xs text-slate-100">
                            <span className={actionTone(entry.action)}>[{entry.action}]</span>{' '}
                            {meta}
                            {entry.userAgent ? (
                              <div className="mt-1 text-slate-400">{entry.userAgent}</div>
                            ) : null}
                          </td>
                        </tr>
                      ) : null}
                    </Fragment>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {totalPages > 1 ? (
        <div className="flex items-center justify-between">
          <button
            type="button"
            disabled={page <= 1}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm disabled:opacity-40"
          >
            Previous
          </button>
          <span className="text-sm text-slate-500">
            Page {page} of {totalPages}
          </span>
          <button
            type="button"
            disabled={page >= totalPages}
            onClick={() => setPage((p) => p + 1)}
            className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm disabled:opacity-40"
          >
            Next
          </button>
        </div>
      ) : null}
    </div>
  )
}

export function Logs() {
  const [tab, setTab] = useState<LogTab>('audit')

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-slate-900">Logs</h1>
        <p className="text-sm text-slate-500">
          Audit trail for business events and live system logs
        </p>
      </div>

      <div className="inline-flex rounded-lg border border-slate-200 bg-slate-100 p-1">
        <button
          type="button"
          onClick={() => setTab('audit')}
          className={`rounded-md px-4 py-2 text-sm font-medium transition ${
            tab === 'audit'
              ? 'bg-white text-slate-900 shadow-sm'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          Audit trail
        </button>
        <button
          type="button"
          onClick={() => setTab('system')}
          className={`rounded-md px-4 py-2 text-sm font-medium transition ${
            tab === 'system'
              ? 'bg-white text-slate-900 shadow-sm'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          System logs
        </button>
      </div>

      {tab === 'audit' ? <AuditLogsPanel /> : <SystemLogsPanel />}
    </div>
  )
}
