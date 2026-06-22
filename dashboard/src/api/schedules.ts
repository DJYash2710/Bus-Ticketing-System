import { apiClient, unwrap } from './client'
import type {
  Schedule,
  ScheduleRecurrence,
  ScheduleScope,
  ScheduleStatus,
} from '../types'

export async function listSchedules(params?: {
  routeId?: number
  busId?: number
  status?: ScheduleStatus
  date?: string
  from?: string
  to?: string
}) {
  const res = await apiClient.get('/schedules', { params })
  return unwrap<Schedule[]>(res)
}

export async function getSchedule(id: number) {
  const res = await apiClient.get(`/schedules/${id}`)
  return unwrap<Schedule>(res)
}

export async function createSchedule(data: {
  routeId: number
  busId: number
  departureTime: string
  arrivalTime?: string | null
  basePrice: number
  status?: ScheduleStatus
  color?: string
  recurrence?: ScheduleRecurrence
}) {
  const res = await apiClient.post('/schedules', data)
  return unwrap<{
    schedule: Schedule
    schedules: Schedule[]
    recurrenceGroupId: string | null
    count: number
  }>(res)
}

export async function updateSchedule(
  id: number,
  data: {
    departureTime?: string
    arrivalTime?: string | null
    basePrice?: number
    status?: ScheduleStatus
    color?: string
    scope?: ScheduleScope
  },
) {
  const res = await apiClient.patch(`/schedules/${id}`, data)
  return unwrap<{ schedule: Schedule; affectedCount: number }>(res)
}

export async function deleteSchedule(id: number, scope: ScheduleScope = 'this') {
  const res = await apiClient.delete(`/schedules/${id}`, { params: { scope } })
  return unwrap<{ message: string; affectedCount: number }>(res)
}
