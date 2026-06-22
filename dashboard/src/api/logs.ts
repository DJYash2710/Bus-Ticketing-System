import { apiClient, unwrap } from './client'
import type { AuditLogsResponse, LogsResponse, ReportsSummary } from '../types'

export async function getReportsSummary(params?: {
  fromDate?: string
  toDate?: string
}) {
  const res = await apiClient.get('/admin/reports/summary', { params })
  return unwrap<ReportsSummary>(res)
}

export async function getLogs(lines = 100) {
  const res = await apiClient.get('/admin/logs', { params: { lines } })
  return unwrap<LogsResponse>(res)
}

export async function getAuditLogs(params?: {
  page?: number
  limit?: number
  action?: string
  actorId?: number
  entityType?: string
  fromDate?: string
  toDate?: string
}) {
  const res = await apiClient.get('/admin/audit-logs', { params })
  return unwrap<AuditLogsResponse>(res)
}
