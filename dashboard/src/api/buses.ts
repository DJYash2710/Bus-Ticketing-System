import { apiClient, unwrap } from './client'
import type { Bus, BusType } from '../types'

export async function listBuses() {
  const res = await apiClient.get('/buses')
  return unwrap<Bus[]>(res)
}

export async function getBus(id: number) {
  const res = await apiClient.get(`/buses/${id}`)
  return unwrap<Bus>(res)
}

export async function createBus(data: {
  registrationNo: string
  name: string
  capacity: number
  type: BusType
  amenities?: string[]
  operatorId?: number | null
}) {
  const res = await apiClient.post('/buses', data)
  return unwrap<Bus>(res)
}

export async function updateBus(
  id: number,
  data: {
    name?: string
    capacity?: number
    type?: BusType
    amenities?: string[]
    operatorId?: number | null
  },
) {
  const res = await apiClient.patch(`/buses/${id}`, data)
  return unwrap<Bus>(res)
}

export async function deleteBus(id: number) {
  const res = await apiClient.delete(`/buses/${id}`)
  return unwrap<{ message: string }>(res)
}
