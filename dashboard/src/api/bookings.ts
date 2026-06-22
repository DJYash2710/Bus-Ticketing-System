import { apiClient, unwrap } from './client'
import type {
  AdminBookingsResponse,
  Booking,
  BookingStatus,
  PaymentStatus,
} from '../types'

export async function getOperatorBookings() {
  const res = await apiClient.get('/bookings/operator/bookings')
  return unwrap<Booking[]>(res)
}

export async function getAdminBookings(params?: {
  status?: BookingStatus
  paymentStatus?: PaymentStatus
  userId?: number
  fromDate?: string
  toDate?: string
  page?: number
  limit?: number
}) {
  const res = await apiClient.get('/admin/bookings', { params })
  return unwrap<AdminBookingsResponse>(res)
}

export async function getBooking(id: number) {
  const res = await apiClient.get(`/bookings/${id}`)
  return unwrap<Booking>(res)
}

export async function cancelBooking(id: number) {
  const res = await apiClient.patch(`/bookings/${id}/cancel`)
  return unwrap<Booking>(res)
}
