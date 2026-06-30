type ValidationResult = { ok: true } | { ok: false; message: string }

function fail(message: string): ValidationResult {
  return { ok: false, message }
}

export function validateEmail(email: string): ValidationResult {
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return fail('Enter a valid email address')
  }
  return { ok: true }
}

export function validatePassword(password: string): ValidationResult {
  if (!password || password.length < 8 || password.length > 128) {
    return fail('Password must be 8–128 characters')
  }
  return { ok: true }
}

export function validateName(name: string): ValidationResult {
  if (!name || name.length < 2 || name.length > 100) {
    return fail('Name must be 2–100 characters')
  }
  return { ok: true }
}

export function validatePhone(phone: string | null | undefined): ValidationResult {
  if (phone == null || phone === '') return { ok: true }
  if (phone.length < 8 || phone.length > 20) {
    return fail('Phone must be 8–20 characters')
  }
  return { ok: true }
}

export function validateBusForm(data: {
  registrationNo: string
  name: string
  capacity: number
  bodyType: string
  hasAc?: boolean
}): ValidationResult {
  if (!data.registrationNo || data.registrationNo.length < 3 || data.registrationNo.length > 50) {
    return fail('Registration number must be 3–50 characters')
  }
  const nameCheck = validateName(data.name)
  if (!nameCheck.ok) return nameCheck
  if (!Number.isInteger(data.capacity) || data.capacity < 1 || data.capacity > 100) {
    return fail('Capacity must be between 1 and 100')
  }
  const bodyTypes = ['SEATER', 'SLEEPER', 'SEMI_SLEEPER']
  if (!bodyTypes.includes(data.bodyType)) {
    return fail('Select a valid body type')
  }
  return { ok: true }
}

export function validateScheduleForm(data: {
  routeId: number
  busId: number
  departureTime: string
  basePrice: number
}): ValidationResult {
  if (!data.routeId) return fail('Select a route')
  if (!data.busId) return fail('Select a bus')
  if (!data.departureTime) return fail('Departure time is required')
  if (data.basePrice < 0) return fail('Base price must be 0 or more')
  return { ok: true }
}

export function validateCityForm(data: { name: string; state?: string; country?: string }): ValidationResult {
  const nameCheck = validateName(data.name)
  if (!nameCheck.ok) return nameCheck
  if (data.state && (data.state.length < 2 || data.state.length > 100)) {
    return fail('State must be 2–100 characters')
  }
  if (data.country && (data.country.length < 2 || data.country.length > 100)) {
    return fail('Country must be 2–100 characters')
  }
  return { ok: true }
}

export function validateRouteForm(data: {
  code: string
  fromCityId: number
  toCityId: number
  distanceKm?: number
  durationMin?: number
}): ValidationResult {
  if (!data.code || data.code.length < 2 || data.code.length > 50) {
    return fail('Route code must be 2–50 characters')
  }
  if (!data.fromCityId) return fail('Select a departure city')
  if (!data.toCityId) return fail('Select an arrival city')
  if (data.fromCityId === data.toCityId) return fail('Cities must be different')
  if (data.distanceKm != null && (!Number.isInteger(data.distanceKm) || data.distanceKm < 1)) {
    return fail('Distance must be at least 1 km')
  }
  if (data.durationMin != null && (!Number.isInteger(data.durationMin) || data.durationMin < 1)) {
    return fail('Duration must be at least 1 minute')
  }
  return { ok: true }
}

export function validateCouponForm(data: {
  code: string
  type: string
  value: number
}): ValidationResult {
  if (!data.code || data.code.length < 3 || data.code.length > 30) {
    return fail('Coupon code must be 3–30 characters')
  }
  if (!['PERCENT', 'FIXED'].includes(data.type)) {
    return fail('Select a valid coupon type')
  }
  if (!data.value || data.value <= 0) {
    return fail('Value must be greater than 0')
  }
  return { ok: true }
}

export function validateOperatorForm(data: {
  companyName: string
  operatorUser: { name: string; email: string; phone?: string; password: string }
}): ValidationResult {
  if (!data.companyName || data.companyName.length < 2 || data.companyName.length > 150) {
    return fail('Company name must be 2–150 characters')
  }
  const nameCheck = validateName(data.operatorUser.name)
  if (!nameCheck.ok) return nameCheck
  const emailCheck = validateEmail(data.operatorUser.email)
  if (!emailCheck.ok) return emailCheck
  const phoneCheck = validatePhone(data.operatorUser.phone)
  if (!phoneCheck.ok) return phoneCheck
  const pwCheck = validatePassword(data.operatorUser.password)
  if (!pwCheck.ok) return pwCheck
  return { ok: true }
}

export function validateChangePassword(data: {
  currentPassword: string
  newPassword: string
}): ValidationResult {
  const cur = validatePassword(data.currentPassword)
  if (!cur.ok) return fail('Current password must be 8–128 characters')
  const neu = validatePassword(data.newPassword)
  if (!neu.ok) return neu
  return { ok: true }
}
