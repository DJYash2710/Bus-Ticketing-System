import { apiClient, unwrap } from './client'
import type { Coupon, CouponType } from '../types'

export async function listCoupons() {
  const res = await apiClient.get('/coupons')
  return unwrap<Coupon[]>(res)
}

export async function createCoupon(data: {
  code: string
  type: CouponType
  value: number
  maxUsesPerUser?: number | null
  maxGlobalUses?: number | null
  isActive?: boolean
  validFrom?: string | null
  validTo?: string | null
}) {
  const res = await apiClient.post('/coupons', data)
  return unwrap<Coupon>(res)
}

export async function updateCoupon(
  id: number,
  data: {
    type?: CouponType
    value?: number
    maxUsesPerUser?: number | null
    maxGlobalUses?: number | null
    isActive?: boolean
    validFrom?: string | null
    validTo?: string | null
  },
) {
  const res = await apiClient.patch(`/coupons/${id}`, data)
  return unwrap<Coupon>(res)
}

export async function deleteCoupon(id: number) {
  const res = await apiClient.delete(`/coupons/${id}`)
  return unwrap<{ message: string }>(res)
}
