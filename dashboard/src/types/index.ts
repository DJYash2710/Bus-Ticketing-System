export type UserRole = 'USER' | 'ADMIN' | 'OPERATOR'

export type BusBodyType = 'SEATER' | 'SLEEPER' | 'SEMI_SLEEPER'

export type BusLayoutType = 'SEATER_2_2' | 'SEATER_2_1' | 'SLEEPER_1_1'

export type LayoutElementType =
  | 'SEAT'
  | 'DRIVER'
  | 'EXIT_FRONT'
  | 'EXIT_REAR'
  | 'EXIT_FIRE'
  | 'WASHROOM'
  | 'ENGINE'
  | 'ROOF_EXIT'

export type BusDeck = 'LOWER' | 'UPPER'

export type ScheduleStatus = 'ACTIVE' | 'CANCELLED' | 'COMPLETED'

export type SeatStatus = 'AVAILABLE' | 'HELD' | 'BOOKED'

export type BookingStatus = 'PENDING' | 'CONFIRMED' | 'EXPIRED' | 'CANCELLED'

export type PaymentStatus =
  | 'PENDING'
  | 'SUCCESS'
  | 'FAILED'
  | 'REFUNDED'
  | 'REFUND_PENDING'
  | 'CANCELLED'

export type CouponType = 'PERCENT' | 'FIXED'

export interface AuthUser {
  id: number
  name: string
  email: string
  role: UserRole
  busOperatorId?: number | null
  phone?: string | null
}

export interface AuthTokens {
  accessToken: string
  refreshToken: string
}

export interface LoginResponse {
  user: {
    id: number
    name: string
    email: string
    role: UserRole
    creditsBalance: number
    referralCode: string | null
  }
  tokens: AuthTokens
}

export interface UserProfile {
  id: number
  name: string
  email: string
  phone: string | null
  role: UserRole
  referralCode: string | null
  creditsBalance: number
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export interface BusOperator {
  id: number
  name: string
  contactEmail: string | null
  contactPhone: string | null
  createdAt: string
  updatedAt: string
  users?: OperatorUser[]
  busCount?: number
  buses?: Bus[]
}

export interface OperatorUser {
  id: number
  name: string
  email: string
  phone: string | null
  role: UserRole
}

export interface City {
  id: number
  name: string
  state: string | null
  country: string | null
  createdAt: string
  updatedAt: string
}

export interface Route {
  id: number
  code: string
  fromCityId: number
  toCityId: number
  distanceKm: number | null
  durationMin: number | null
  estimatedDurationMinutes: number | null
  fromCity?: City
  toCity?: City
  createdAt: string
  updatedAt: string
}

export interface Bus {
  id: number
  operatorId: number | null
  registrationNo: string
  name: string
  capacity: number
  bodyType: BusBodyType
  layoutType: BusLayoutType
  hasAc: boolean
  currentLayoutId?: number | null
  amenities: string[]
  createdAt: string
  updatedAt: string
}

export interface BusLayoutElement {
  id: number
  layoutId: number
  type: LayoutElementType
  deck: BusDeck
  row: number
  col: number
  label: string | null
  seatNumber: string | null
}

export interface BusLayout {
  id: number
  busId: number
  version: number
  layoutType: BusLayoutType
  seatsLeft: number
  seatsRight: number
  hasUpperDeck: boolean
  lowerDeckCapacity?: number | null
  upperDeckCapacity?: number | null
  seatCapacity: number
  createdByUserId: number | null
  createdAt: string
  elements: BusLayoutElement[]
}

export interface Schedule {
  id: number
  routeId: number
  busId: number
  departureTime: string
  arrivalTime: string | null
  basePrice: string | number
  status: ScheduleStatus
  color?: string | null
  recurrenceGroupId?: string | null
  isRecurrenceException?: boolean
  bookingsCount?: number
  seatsCount?: number
  bookedSeatsCount?: number
  route?: Route
  bus?: Bus
  _count?: { seats: number; bookings: number }
  seats?: Seat[]
}

export type ScheduleRecurrenceFrequency = 'DAILY' | 'WEEKLY' | 'MONTHLY'

export type ScheduleScope = 'this' | 'following' | 'all'

export interface ScheduleRecurrence {
  frequency: ScheduleRecurrenceFrequency
  daysOfWeek?: number[]
  endDate: string
}

export interface Seat {
  id: number
  scheduleId: number
  seatNumber: string
  row: number | null
  col: number | null
  deck: string | null
  status: SeatStatus
  createdAt: string
  updatedAt: string
}

export interface SeatMapLayoutSnapshot {
  seatsLeft: number
  seatsRight: number
  layoutType: BusLayoutType
  version: number
  fromSnapshot: boolean
  hasUpperDeck: boolean
  capElements: Array<{
    type: LayoutElementType
    deck: BusDeck
    row: number
    col: number
    label: string | null
  }>
}

export interface SeatMapResponse {
  schedule: {
    id: number
    departureTime: string
    arrivalTime: string | null
    basePrice: string | number
    status: ScheduleStatus
    route: {
      id: number
      code: string
      fromCity: City
      toCity: City
    }
    bus: Bus
  }
  summary: {
    total: number
    available: number
    held: number
    booked: number
  }
  seats: Seat[]
  layout: SeatMapLayoutSnapshot | null
}

export interface BookingSeat {
  id: number
  bookingId: number
  seatId: number
  seat: Seat
}

export interface Booking {
  id: number
  userId: number
  scheduleId: number
  baseAmount: string | number
  taxAmount: string | number
  discountAmount: string | number
  commissionRate: string | number
  commissionAmount: string | number
  totalAmount: string | number
  status: BookingStatus
  paymentStatus: PaymentStatus
  bookedAt: string
  cancelledAt: string | null
  cancellationReason?: string | null
  schedule?: Schedule
  user?: {
    id: number
    name: string
    email: string
    phone?: string | null
  }
  seats?: BookingSeat[]
  payment?: {
    id: number
    status: PaymentStatus
    amount: string | number
  } | null
}

export interface AdminBookingsResponse {
  bookings: Booking[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

export interface ReportsSummary {
  period: { fromDate: string | null; toDate: string | null }
  bookings: { total: number; confirmed: number; cancelled: number }
  payments: { paid: number; pending: number; refunded: number }
  revenue: { totalCollected: number; totalCommission: number }
}

export interface Coupon {
  id: number
  code: string
  type: CouponType
  value: string | number
  maxUsesPerUser: number | null
  maxGlobalUses: number | null
  usedCount: number
  isActive: boolean
  validFrom: string | null
  validTo: string | null
  createdAt: string
  updatedAt: string
}

export interface LogEntry {
  level?: string
  message?: string
  timestamp?: string
  raw?: string
  [key: string]: unknown
}

export interface LogsResponse {
  file: string
  linesRequested: number
  linesReturned: number
  logs: LogEntry[]
  message?: string
}

export interface AuditLogEntry {
  id: number
  actorId: number | null
  actorRole: string | null
  action: string
  entityType: string
  entityId: number | null
  metadata: Record<string, unknown> | null
  ipAddress: string | null
  userAgent: string | null
  createdAt: string
}

export interface AuditLogsResponse {
  logs: AuditLogEntry[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

export interface CreateOperatorResponse {
  operator: BusOperator
  user: OperatorUser
}

export interface JwtPayload {
  sub: number
  role: UserRole
  busOperatorId?: number | null
  exp?: number
  iat?: number
}
