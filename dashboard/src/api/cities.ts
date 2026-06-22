import { apiClient, unwrap } from './client'
import type { City } from '../types'

export async function listCities() {
  const res = await apiClient.get('/cities')
  return unwrap<City[]>(res)
}

export async function createCity(data: {
  name: string
  state?: string | null
  country?: string | null
}) {
  const res = await apiClient.post('/cities', data)
  return unwrap<City>(res)
}

export async function updateCity(
  id: number,
  data: { name?: string; state?: string | null; country?: string | null },
) {
  const res = await apiClient.patch(`/cities/${id}`, data)
  return unwrap<City>(res)
}

export async function deleteCity(id: number) {
  const res = await apiClient.delete(`/cities/${id}`)
  return unwrap<{ message: string }>(res)
}
