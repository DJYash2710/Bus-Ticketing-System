import { apiClient, unwrap } from './client'

export interface BusStop {
  id: number
  name: string
  locality: string
  cityId: number
  city?: { id: number; name: string }
}

export function formatBusStopLabel(stop: Pick<BusStop, 'name' | 'locality'>) {
  return `${stop.name}, ${stop.locality}`
}

export async function listBusStops(params?: { cityId?: number; search?: string }) {
  const res = await apiClient.get('/bus-stops', { params })
  return unwrap<BusStop[]>(res)
}

export async function createBusStop(data: {
  name: string
  locality: string
  cityId: number
}) {
  const res = await apiClient.post('/bus-stops', data)
  return unwrap<BusStop>(res)
}

export async function updateBusStop(
  id: number,
  data: Partial<{ name: string; locality: string; cityId: number }>,
) {
  const res = await apiClient.patch(`/bus-stops/${id}`, data)
  return unwrap<BusStop>(res)
}

export async function deleteBusStop(id: number) {
  const res = await apiClient.delete(`/bus-stops/${id}`)
  return unwrap<{ message: string }>(res)
}
