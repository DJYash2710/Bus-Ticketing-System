export const AISLE_WIDTH = 1
export const MIN_SEATS_PER_SIDE = 1
export const MAX_SEATS_PER_SIDE = 5

export const LAYOUT_FRONT_ROW = 1000
export const LAYOUT_REAR_ROW = 1001

export type CapTool =
  | 'DRIVER'
  | 'EXIT_FRONT'
  | 'EXIT_REAR'
  | 'EXIT_FIRE'
  | 'WASHROOM'
  | 'ENGINE'
  | 'ROOF_EXIT'
  | 'ERASER'

export type SeatTool = 'SEAT_ADD' | 'SEAT_REMOVE'

export type BuilderTool = CapTool | SeatTool

export const SEAT_TOOLS: { value: SeatTool; label: string }[] = [
  { value: 'SEAT_ADD', label: 'Add seat' },
  { value: 'SEAT_REMOVE', label: 'Remove seat' },
]

export const CAP_TOOLS: { value: CapTool; label: string }[] = [
  { value: 'DRIVER', label: 'Driver' },
  { value: 'EXIT_FRONT', label: 'Front exit' },
  { value: 'EXIT_REAR', label: 'Rear exit' },
  { value: 'EXIT_FIRE', label: 'Fire exit' },
  { value: 'WASHROOM', label: 'Washroom' },
  { value: 'ROOF_EXIT', label: 'Roof exit' },
  { value: 'ERASER', label: 'Eraser' },
]

export const GEOMETRY_PRESETS: { label: string; seatsLeft: number; seatsRight: number }[] = [
  { label: '2+2', seatsLeft: 2, seatsRight: 2 },
  { label: '2+1', seatsLeft: 2, seatsRight: 1 },
  { label: '1+1', seatsLeft: 1, seatsRight: 1 },
  { label: '3+2', seatsLeft: 3, seatsRight: 2 },
  { label: '2+3', seatsLeft: 2, seatsRight: 3 },
  { label: '1+3', seatsLeft: 1, seatsRight: 3 },
  { label: '1+4', seatsLeft: 1, seatsRight: 4 },
  { label: '4+2', seatsLeft: 4, seatsRight: 2 },
  { label: '3+3', seatsLeft: 3, seatsRight: 3 },
]

export function gridWidth(seatsLeft: number, seatsRight: number): number {
  return seatsLeft + AISLE_WIDTH + seatsRight
}

export function allGridCols(seatsLeft: number, seatsRight: number): number[] {
  const width = gridWidth(seatsLeft, seatsRight)
  return Array.from({ length: width }, (_, i) => i)
}

export function standardSeatCols(seatsLeft: number, seatsRight: number): number[] {
  const { leftCols, rightCols } = seatColumnLayout(seatsLeft, seatsRight)
  return [...leftCols, ...rightCols]
}

export function isValidSeatCol(
  col: number,
  _rowSeatCols: number[],
  seatsLeft: number,
  seatsRight: number,
): boolean {
  return standardSeatCols(seatsLeft, seatsRight).includes(col)
}

export function seatColumnLayout(seatsLeft: number, seatsRight: number) {
  const leftCols = Array.from({ length: seatsLeft }, (_, i) => i)
  const aisleCols = Array.from({ length: AISLE_WIDTH }, (_, i) => seatsLeft + i)
  const rightStart = seatsLeft + AISLE_WIDTH
  const rightCols = Array.from({ length: seatsRight }, (_, i) => rightStart + i)
  return { leftCols, rightCols, aisleCols, gridWidth: gridWidth(seatsLeft, seatsRight) }
}

export function capRowForType(type: CapTool): number {
  switch (type) {
    case 'DRIVER':
    case 'EXIT_FRONT':
      return LAYOUT_FRONT_ROW
    case 'ROOF_EXIT':
      return -1
    default:
      return LAYOUT_REAR_ROW
  }
}

export function isAisleCapTool(type: BuilderTool): boolean {
  return type === 'ROOF_EXIT'
}

export function splitDeckCapacity(
  total: number,
  lower?: number | null,
  upper?: number | null,
): { lower: number; upper: number } {
  if (lower != null && upper != null) {
    return { lower, upper }
  }
  if (lower != null) {
    return { lower, upper: Math.max(0, total - lower) }
  }
  if (upper != null) {
    return { upper, lower: Math.max(0, total - upper) }
  }
  const l = Math.ceil(total / 2)
  return { lower: l, upper: total - l }
}

export function defaultLabelForCap(type: CapTool): string {
  switch (type) {
    case 'DRIVER':
      return 'Driver'
    case 'EXIT_FRONT':
      return 'Front Exit'
    case 'EXIT_REAR':
      return 'Rear Exit'
    case 'EXIT_FIRE':
      return 'Fire Exit'
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

export function isLeftCol(col: number, seatsLeft: number) {
  return col < seatsLeft
}

export function isRightCol(col: number, seatsLeft: number, seatsRight: number) {
  const { rightCols } = seatColumnLayout(seatsLeft, seatsRight)
  return rightCols.includes(col)
}

export function isAisleCol(col: number, seatsLeft: number, seatsRight: number) {
  const { aisleCols } = seatColumnLayout(seatsLeft, seatsRight)
  return aisleCols.includes(col)
}

/** Remap cap columns that fall outside the grid after a geometry change. */
export function normalizeCapCol(
  type: string,
  col: number,
  seatsLeft: number,
  seatsRight: number,
): number {
  const maxCol = gridWidth(seatsLeft, seatsRight) - 1
  const { aisleCols, rightCols } = seatColumnLayout(seatsLeft, seatsRight)
  const aisleCol = aisleCols[0] ?? seatsLeft
  const farRight = rightCols[rightCols.length - 1] ?? maxCol

  if (col >= 0 && col <= maxCol) return col

  if (type === 'ROOF_EXIT') return aisleCol
  if (type === 'EXIT_FRONT' || type === 'EXIT_REAR') return farRight
  if (type === 'DRIVER' || type === 'EXIT_FIRE') return 0
  if (type === 'WASHROOM') return aisleCol
  if (col > maxCol) return farRight
  return 0
}

export function normalizeCapElements<T extends { type: string; col: number }>(
  elements: T[],
  seatsLeft: number,
  seatsRight: number,
): T[] {
  return elements.map((el) => {
    if (el.type === 'SEAT') return el
    const col = normalizeCapCol(el.type, el.col, seatsLeft, seatsRight)
    return col === el.col ? el : { ...el, col }
  })
}

/** Infer left/right column counts from seat positions (handles gaps for aisle). */
export function inferGeometryFromSeats(seats: { col?: number | null }[]) {
  const occupied = [...new Set(seats.map((s) => s.col ?? 0))].sort((a, b) => a - b)
  if (occupied.length === 0) {
    return { seatsLeft: 2, seatsRight: 2, ...seatColumnLayout(2, 2) }
  }

  const groups: number[][] = []
  let current = [occupied[0]!]
  for (let i = 1; i < occupied.length; i++) {
    const col = occupied[i]!
    if (col === occupied[i - 1]! + 1) {
      current.push(col)
    } else {
      groups.push(current)
      current = [col]
    }
  }
  groups.push(current)

  let seatsLeft: number
  let seatsRight: number

  if (groups.length >= 2) {
    seatsLeft = groups[0]!.length
    seatsRight = groups[groups.length - 1]!.length
  } else if (groups[0]!.length >= 3) {
    seatsLeft = Math.ceil(groups[0]!.length / 2)
    seatsRight = groups[0]!.length - seatsLeft
  } else {
    seatsLeft = 1
    seatsRight = 1
  }

  return { seatsLeft, seatsRight, ...seatColumnLayout(seatsLeft, seatsRight) }
}

export function layoutSummaryLabel(seatsLeft: number, seatsRight: number) {
  return `${seatsLeft}+${seatsRight} layout`
}

const SEAT_LETTERS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'

function seatLetter(index: number): string {
  return SEAT_LETTERS[index] ?? String.fromCharCode(65 + index)
}

export type SeatBodyType = 'SEATER' | 'SLEEPER' | 'SEMI_SLEEPER'

export function seatNumberForPosition(
  row: number,
  col: number,
  seatsLeft: number,
  seatsRight: number,
  bodyType: SeatBodyType,
  deck: 'LOWER' | 'UPPER' = 'LOWER',
  hasUpperDeck = false,
): string {
  const { leftCols, rightCols } = seatColumnLayout(seatsLeft, seatsRight)

  if (bodyType === 'SLEEPER') {
    if (hasUpperDeck) {
      if (deck === 'UPPER') {
        if (col === leftCols[0]) return `U${row + 1}`
        if (col === rightCols[0]) return `U${row + 1}R`
        return `U${row + 1}`
      }
      if (col === leftCols[0]) return `L${row + 1}`
      if (col === rightCols[0]) return `L${row + 1}R`
      return `L${row + 1}`
    }
    if (col === leftCols[0]) return `L${row + 1}`
    if (col === rightCols[0]) return `U${row + 1}`
    return `${row + 1}`
  }

  const leftIndex = leftCols.indexOf(col)
  if (leftIndex >= 0) {
    const num = `${row + 1}${seatLetter(leftIndex)}`
    return deck === 'UPPER' ? `U${num}` : num
  }

  const rightIndex = rightCols.indexOf(col)
  if (rightIndex >= 0) {
    const letterIndex = seatsLeft + rightIndex
    const num = `${row + 1}${seatLetter(letterIndex)}`
    return deck === 'UPPER' ? `U${num}` : num
  }

  const fallback = `${row + 1}`
  return deck === 'UPPER' ? `U${fallback}` : fallback
}

export function validSeatCols(seatsLeft: number, seatsRight: number): number[] {
  const { leftCols, rightCols } = seatColumnLayout(seatsLeft, seatsRight)
  return [...leftCols, ...rightCols]
}

export function seatsMatchGrid(
  elements: { type: string; col: number; row: number; deck?: string }[],
  seatsLeft: number,
  seatsRight: number,
  seatCapacity: number,
  options?: {
    hasUpperDeck?: boolean
    lowerDeckCapacity?: number
    upperDeckCapacity?: number
  },
): boolean {
  const seats = elements.filter((e) => e.type === 'SEAT')
  if (seats.length !== seatCapacity) return false

  const seatColsByDeckRow = new Map<string, number[]>()
  for (const seat of seats) {
    const key = `${seat.deck ?? 'LOWER'}:${seat.row}`
    const cols = seatColsByDeckRow.get(key) ?? []
    cols.push(seat.col)
    seatColsByDeckRow.set(key, cols)
  }

  if (
    !seats.every((seat) => {
      const rowKey = `${seat.deck ?? 'LOWER'}:${seat.row}`
      const rowSeatCols = seatColsByDeckRow.get(rowKey) ?? []
      return isValidSeatCol(seat.col, rowSeatCols, seatsLeft, seatsRight)
    })
  ) {
    return false
  }

  if (!options?.hasUpperDeck) return true

  const lowerSeats = seats.filter((s) => (s.deck ?? 'LOWER') !== 'UPPER').length
  const upperSeats = seats.filter((s) => (s.deck ?? 'LOWER') === 'UPPER').length
  const target = splitDeckCapacity(
    seatCapacity,
    options.lowerDeckCapacity,
    options.upperDeckCapacity,
  )
  return lowerSeats === target.lower && upperSeats === target.upper
}

export function renumberSeatElements<T extends {
  type: string
  row: number
  col: number
  deck?: string
  label?: string | null
  seatNumber?: string | null
  id?: number
  layoutId?: number
}>(
  elements: T[],
  seatsLeft: number,
  seatsRight: number,
  bodyType: SeatBodyType,
  hasUpperDeck = false,
): T[] {
  const caps = elements.filter((e) => e.type !== 'SEAT')
  const seats = elements
    .filter((e) => e.type === 'SEAT')
    .sort(
      (a, b) =>
        (a.deck ?? 'LOWER').localeCompare(b.deck ?? 'LOWER') ||
        a.row - b.row ||
        a.col - b.col,
    )

  const renumbered = seats.map((seat) => {
    const deck = (seat.deck ?? 'LOWER') as 'LOWER' | 'UPPER'
    const seatNumber = seatNumberForPosition(
      seat.row,
      seat.col,
      seatsLeft,
      seatsRight,
      bodyType,
      deck,
      hasUpperDeck,
    )
    return { ...seat, deck, seatNumber, label: seatNumber }
  })

  return [...caps, ...renumbered]
}
