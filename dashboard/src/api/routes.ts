import { apiClient, unwrap } from './client'
import type { Route } from '../types'

export async function listRoutes() {
  const res = await apiClient.get('/routes')
  return unwrap<Route[]>(res)
}

export async function createRoute(data: {
  code: string
  fromCityId: number
  toCityId: number
  distanceKm?: number
  durationMin?: number
}) {
  const res = await apiClient.post('/routes', data)
  return unwrap<Route>(res)
}

export async function updateRoute(
  id: number,
  data: { distanceKm?: number; durationMin?: number },
) {
  const res = await apiClient.patch(`/routes/${id}`, data)
  return unwrap<Route>(res)
}

export async function deleteRoute(id: number) {
  const res = await apiClient.delete(`/routes/${id}`)
  return unwrap<{ message: string }>(res)
}
