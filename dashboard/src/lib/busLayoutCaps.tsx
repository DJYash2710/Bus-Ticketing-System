import {
  BusFront,
  CircleUserRound,
  DoorOpen,
  Flame,
  ShowerHead,
  SquareArrowUp,
  type LucideIcon,
} from 'lucide-react'
import type { LayoutElementType } from '../types'

export function capIcon(type: LayoutElementType): LucideIcon {
  switch (type) {
    case 'DRIVER':
      return CircleUserRound
    case 'EXIT_FRONT':
    case 'EXIT_REAR':
      return DoorOpen
    case 'EXIT_FIRE':
      return Flame
    case 'WASHROOM':
      return ShowerHead
    case 'ROOF_EXIT':
      return SquareArrowUp
    default:
      return BusFront
  }
}

export function capClass(type: LayoutElementType): string {
  switch (type) {
    case 'DRIVER':
      return 'border-slate-300 bg-slate-100 text-slate-600'
    case 'EXIT_FRONT':
    case 'EXIT_REAR':
      return 'border-emerald-200 bg-emerald-50 text-emerald-700'
    case 'EXIT_FIRE':
      return 'border-orange-200 bg-orange-50 text-orange-700'
    case 'WASHROOM':
      return 'border-sky-200 bg-sky-50 text-sky-700'
    case 'ROOF_EXIT':
      return 'border-violet-200 bg-violet-50 text-violet-700'
    default:
      return 'border-slate-200 bg-white text-slate-600'
  }
}

export function capLabel(type: LayoutElementType, label?: string | null): string {
  if (label?.trim()) return label
  switch (type) {
    case 'DRIVER':
      return 'Driver'
    case 'EXIT_FRONT':
      return 'Front exit'
    case 'EXIT_REAR':
      return 'Rear exit'
    case 'EXIT_FIRE':
      return 'Fire exit'
    case 'WASHROOM':
      return 'Washroom'
    case 'ENGINE':
      return 'Engine'
    case 'ROOF_EXIT':
      return 'Roof exit'
    default:
      return type
  }
}
