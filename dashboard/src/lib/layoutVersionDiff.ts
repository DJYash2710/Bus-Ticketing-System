import type { BusLayout, BusLayoutElement } from '../types'

export type LayoutVersionDiff = {
  geometryChanged: boolean
  seatsLeftFrom: number
  seatsLeftTo: number
  seatsRightFrom: number
  seatsRightTo: number
  seatCountFrom: number
  seatCountTo: number
  addedCaps: string[]
  removedCaps: string[]
  movedCaps: Array<{ label: string; from: string; to: string }>
  addedSeats: string[]
  removedSeats: string[]
}

type ElementLike = Pick<BusLayoutElement, 'type' | 'deck' | 'row' | 'col' | 'label' | 'seatNumber'>

function posKey(row: number, col: number) {
  return `r${row}c${col}`
}

function capLabel(el: ElementLike) {
  return el.label?.trim() || el.type
}

function capKey(el: ElementLike) {
  return `${el.type}@${el.deck ?? 'LOWER'}@${posKey(el.row, el.col)}`
}

export function compareLayoutVersions(
  from: BusLayout,
  to: BusLayout,
): LayoutVersionDiff {
  const fromCaps = from.elements.filter((e) => e.type !== 'SEAT')
  const toCaps = to.elements.filter((e) => e.type !== 'SEAT')
  const fromSeats = from.elements.filter((e) => e.type === 'SEAT')
  const toSeats = to.elements.filter((e) => e.type === 'SEAT')

  const fromCapByKey = new Map<string, ElementLike>()
  for (const cap of fromCaps) {
    fromCapByKey.set(capKey(cap), cap)
  }
  const toCapByKey = new Map<string, ElementLike>()
  for (const cap of toCaps) {
    toCapByKey.set(capKey(cap), cap)
  }

  const addedCaps: string[] = []
  const removedCaps: string[] = []
  const movedCaps: LayoutVersionDiff['movedCaps'] = []

  for (const [key, cap] of toCapByKey) {
    if (!fromCapByKey.has(key)) {
      addedCaps.push(capLabel(cap))
    }
  }

  for (const [key, cap] of fromCapByKey) {
    if (!toCapByKey.has(key)) {
      removedCaps.push(capLabel(cap))
    }
  }

  const fromSeatNums = new Set(
    fromSeats.map((s) => s.seatNumber).filter((n): n is string => !!n),
  )
  const toSeatNums = new Set(
    toSeats.map((s) => s.seatNumber).filter((n): n is string => !!n),
  )

  const addedSeats = [...toSeatNums].filter((n) => !fromSeatNums.has(n)).sort()
  const removedSeats = [...fromSeatNums].filter((n) => !toSeatNums.has(n)).sort()

  const geometryChanged =
    from.seatsLeft !== to.seatsLeft ||
    from.seatsRight !== to.seatsRight ||
    from.seatCapacity !== to.seatCapacity ||
    from.hasUpperDeck !== to.hasUpperDeck ||
    from.lowerDeckCapacity !== to.lowerDeckCapacity ||
    from.upperDeckCapacity !== to.upperDeckCapacity

  return {
    geometryChanged,
    seatsLeftFrom: from.seatsLeft,
    seatsLeftTo: to.seatsLeft,
    seatsRightFrom: from.seatsRight,
    seatsRightTo: to.seatsRight,
    seatCountFrom: from.seatCapacity,
    seatCountTo: to.seatCapacity,
    addedCaps,
    removedCaps,
    movedCaps,
    addedSeats,
    removedSeats,
  }
}

export function diffHasChanges(diff: LayoutVersionDiff): boolean {
  return (
    diff.geometryChanged ||
    diff.addedCaps.length > 0 ||
    diff.removedCaps.length > 0 ||
    diff.movedCaps.length > 0 ||
    diff.addedSeats.length > 0 ||
    diff.removedSeats.length > 0
  )
}

export function summarizeLayoutDiff(diff: LayoutVersionDiff): string[] {
  const lines: string[] = []
  if (diff.geometryChanged) {
    const deckNote =
      diff.seatsLeftFrom !== diff.seatsLeftTo ||
      diff.seatsRightFrom !== diff.seatsRightTo ||
      diff.seatCountFrom !== diff.seatCountTo
        ? `${diff.seatsLeftFrom}+${diff.seatsRightFrom} (${diff.seatCountFrom} seats) → ${diff.seatsLeftTo}+${diff.seatsRightTo} (${diff.seatCountTo} seats)`
        : `Seat count ${diff.seatCountFrom} → ${diff.seatCountTo}`
    lines.push(`Geometry: ${deckNote}`)
  }
  if (diff.addedCaps.length) lines.push(`Added caps: ${diff.addedCaps.join(', ')}`)
  if (diff.removedCaps.length) lines.push(`Removed caps: ${diff.removedCaps.join(', ')}`)
  for (const move of diff.movedCaps) {
    lines.push(`${move.label} moved ${move.from} → ${move.to}`)
  }
  if (diff.addedSeats.length) {
    lines.push(`Added seats (${diff.addedSeats.length}): ${diff.addedSeats.slice(0, 8).join(', ')}${diff.addedSeats.length > 8 ? '…' : ''}`)
  }
  if (diff.removedSeats.length) {
    lines.push(`Removed seats (${diff.removedSeats.length}): ${diff.removedSeats.slice(0, 8).join(', ')}${diff.removedSeats.length > 8 ? '…' : ''}`)
  }
  if (lines.length === 0) lines.push('No differences')
  return lines
}
