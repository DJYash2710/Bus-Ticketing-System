import { apiClient, unwrap } from './client'
import type { Seat, SeatMapResponse, SeatStatus } from '../types'

export async function listSeatsBySchedule(scheduleId: number) {
  const res = await apiClient.get(`/seats/schedule/${scheduleId}`)
  return unwrap<SeatMapResponse>(res)
}

export async function getSeat(id: number) {
  const res = await apiClient.get(`/seats/${id}`)
  return unwrap<Seat>(res)
}

export async function updateSeatStatus(id: number, status: SeatStatus) {
  const res = await apiClient.patch(`/seats/${id}/status`, { status })
  return unwrap<Seat>(res)
}
