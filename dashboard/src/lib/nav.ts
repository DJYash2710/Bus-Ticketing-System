import type { LucideIcon } from 'lucide-react'
import {
  Armchair,
  Bus,
  Calendar,
  ClipboardList,
  Gift,
  LayoutDashboard,
  Map,
  MapPin,
  ScrollText,
  User,
  Users,
} from 'lucide-react'
import type { UserRole } from '../types'

export interface NavItem {
  label: string
  path: string
  icon: LucideIcon
  roles: UserRole[]
}

const allNavItems: NavItem[] = [
  { label: 'Overview', path: '/', icon: LayoutDashboard, roles: ['ADMIN', 'OPERATOR'] },
  { label: 'My Buses', path: '/buses', icon: Bus, roles: ['ADMIN', 'OPERATOR'] },
  { label: 'My Schedules', path: '/schedules', icon: Calendar, roles: ['ADMIN', 'OPERATOR'] },
  { label: 'Seat Layout', path: '/seats', icon: Armchair, roles: ['ADMIN', 'OPERATOR'] },
  { label: 'My Bookings', path: '/bookings', icon: ClipboardList, roles: ['ADMIN', 'OPERATOR'] },
  { label: 'Profile', path: '/profile', icon: User, roles: ['ADMIN', 'OPERATOR'] },
  { label: 'Cities', path: '/admin/cities', icon: MapPin, roles: ['ADMIN'] },
  { label: 'Routes', path: '/admin/routes', icon: Map, roles: ['ADMIN'] },
  { label: 'Coupons', path: '/admin/coupons', icon: Gift, roles: ['ADMIN'] },
  { label: 'Operators', path: '/admin/operators', icon: Users, roles: ['ADMIN'] },
  { label: 'Logs', path: '/admin/logs', icon: ScrollText, roles: ['ADMIN'] },
]

export function getNavItemsForRole(role: UserRole): NavItem[] {
  return allNavItems.filter((item) => item.roles.includes(role))
}
