import { apiClient, unwrap } from './client'
import type {
  Bus,
  BusBodyType,
  BusLayout,
  BusLayoutType,
  LayoutElementType,
  BusDeck,
} from '../types'

export type LayoutElementInput = {
  type: LayoutElementType
  deck?: BusDeck
  row: number
  col: number
  label?: string | null
  seatNumber?: string | null
}

export type SaveBusLayoutPayload = {
  layoutType: BusLayoutType
  seatsLeft: number
  seatsRight: number
  hasUpperDeck?: boolean
  elements: LayoutElementInput[]
  hasAc?: boolean
  bodyType?: BusBodyType
}

export async function getBusLayout(busId: number) {
  const res = await apiClient.get(`/buses/${busId}/layout`)
  return unwrap<{ bus: Bus; layout: BusLayout }>(res)
}

export async function saveBusLayout(busId: number, data: SaveBusLayoutPayload) {
  const res = await apiClient.put(`/buses/${busId}/layout`, data)
  return unwrap<{ message: string; layout: BusLayout }>(res)
}

export async function applyBusLayoutTemplate(
  busId: number,
  data: {
    layoutType: BusLayoutType
    seatCapacity?: number
    seatsLeft?: number
    seatsRight?: number
    hasUpperDeck?: boolean
    lowerDeckCapacity?: number
    upperDeckCapacity?: number
    hasAc?: boolean
    bodyType?: BusBodyType
  },
) {
  const res = await apiClient.post(`/buses/${busId}/layout/apply-template`, data)
  return unwrap<{ message: string; layout: BusLayout }>(res)
}

export async function regenerateBusLayout(
  busId: number,
  data: {
    seatsLeft: number
    seatsRight: number
    seatCapacity: number
    hasUpperDeck?: boolean
    lowerDeckCapacity?: number
    upperDeckCapacity?: number
    capElements: LayoutElementInput[]
    bodyType?: BusBodyType
  },
) {
  const res = await apiClient.post(`/buses/${busId}/layout/regenerate`, data)
  return unwrap<{
    layoutType: BusLayoutType
    seatsLeft: number
    seatsRight: number
    hasUpperDeck: boolean
    lowerDeckCapacity: number | null
    upperDeckCapacity: number | null
    seatCapacity: number
    elements: LayoutElementInput[]
  }>(res)
}

export async function listBusLayoutVersions(busId: number) {
  const res = await apiClient.get(`/buses/${busId}/layout/versions`)
  return unwrap<
    Array<{
      id: number
      version: number
      layoutType: BusLayoutType
      seatsLeft: number
      seatsRight: number
      seatCapacity: number
      createdAt: string
      createdByUserId: number | null
    }>
  >(res)
}

export async function getBusLayoutVersion(busId: number, layoutId: number) {
  const res = await apiClient.get(`/buses/${busId}/layout/versions/${layoutId}`)
  return unwrap<BusLayout>(res)
}

export async function restoreBusLayoutVersion(busId: number, layoutId: number) {
  const res = await apiClient.post(`/buses/${busId}/layout/versions/${layoutId}/restore`)
  return unwrap<{ message: string; layout: BusLayout }>(res)
}
