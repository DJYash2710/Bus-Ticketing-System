import { apiClient, unwrap } from './client'
import type { LogsResponse, ReportsSummary } from '../types'

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
