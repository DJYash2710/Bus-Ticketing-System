import { apiClient, unwrap } from './client'
import type { BusOperator, CreateOperatorResponse } from '../types'

export async function listOperators() {
  const res = await apiClient.get('/operators')
  return unwrap<BusOperator[]>(res)
}

export async function getOperator(id: number) {
  const res = await apiClient.get(`/operators/${id}`)
  return unwrap<BusOperator>(res)
}

export async function createOperator(data: {
  companyName: string
  contactEmail?: string
  contactPhone?: string
  operatorUser: {
    name: string
    email: string
    phone?: string
    password: string
  }
}) {
  const res = await apiClient.post('/operators', data)
  return unwrap<CreateOperatorResponse>(res)
}

export async function updateOperator(
  id: number,
  data: {
    name?: string
    contactEmail?: string | null
    contactPhone?: string | null
  },
) {
  const res = await apiClient.patch(`/operators/${id}`, data)
  return unwrap<BusOperator>(res)
}
