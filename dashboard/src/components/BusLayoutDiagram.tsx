import { BusFront } from 'lucide-react'
import {
  capClass,
  capIcon,
  capLabel,
} from '../lib/busLayoutCaps'
import {
  inferGeometryFromSeats,
  LAYOUT_FRONT_ROW,
  LAYOUT_REAR_ROW,
  layoutSummaryLabel,
  seatColumnLayout,
} from '../lib/busLayoutGeometry'
import type { Bus, LayoutElementType, Seat, SeatMapLayoutSnapshot, SeatStatus } from '../types'
import { seatStatusLabel } from './StatusBadge'

function seatClass(status: SeatStatus, selected: boolean, editable: boolean) {
  if (selected) {
    return 'border-brand bg-brand text-white shadow-md ring-2 ring-brand-light'
  }
  switch (status) {
    case 'AVAILABLE':
      return editable
        ? 'border-slate-200 bg-white text-slate-700 hover:border-brand-muted hover:bg-brand-light/30 cursor-pointer'
        : 'border-slate-200 bg-white text-slate-700'
    case 'HELD':
      return editable
        ? 'border-amber-300 bg-amber-50 text-amber-800 hover:bg-amber-100 cursor-pointer'
        : 'border-amber-300 bg-amber-50 text-amber-800'
    case 'BOOKED':
      return 'border-slate-600 bg-slate-600 text-white cursor-not-allowed opacity-90'
    default:
      return 'border-slate-200 bg-white text-slate-700'
  }
}

type CapElement = {
  type: LayoutElementType
  deck?: string
  row: number
  col: number
  label?: string | null
}

export interface BusLayoutDiagramProps {
  seats: Seat[]
  bus?: Bus | null
  layout?: SeatMapLayoutSnapshot | null
  selectedSeatId: number | null
  onSeatClick: (seat: Seat) => void
  canEditSeat: (seat: Seat) => boolean
}

export function BusLayoutDiagram({
  seats,
  bus,
  layout,
  selectedSeatId,
  onSeatClick,
  canEditSeat,
}: BusLayoutDiagramProps) {
  const inferred = inferGeometryFromSeats(seats)
  const seatsLeft = layout?.seatsLeft ?? inferred.seatsLeft
  const seatsRight = layout?.seatsRight ?? inferred.seatsRight
  const { leftCols, rightCols, aisleCols } = seatColumnLayout(seatsLeft, seatsRight)
  const capElements: CapElement[] = layout?.capElements ?? []
  const hasUpperDeck =
    layout?.hasUpperDeck ?? seats.some((s) => (s.deck ?? 'LOWER').toUpperCase() === 'UPPER')

  const decks: Array<{ id: string; label: string; seats: Seat[] }> = hasUpperDeck
    ? [
        {
          id: 'LOWER',
          label: 'Lower deck',
          seats: seats.filter((s) => (s.deck ?? 'LOWER').toUpperCase() !== 'UPPER'),
        },
        {
          id: 'UPPER',
          label: 'Upper deck',
          seats: seats.filter((s) => (s.deck ?? 'LOWER').toUpperCase() === 'UPPER'),
        },
      ]
    : [{ id: 'LOWER', label: 'Lower deck', seats }]

  function buildRows(deckSeats: Seat[]) {
    const maxRow = deckSeats.length > 0 ? Math.max(...deckSeats.map((s) => s.row ?? 0)) : 0
    const rows: { left: Seat[]; aisleSeat?: Seat; right: Seat[] }[] = []
    for (let r = 0; r <= maxRow; r++) {
      const rowSeats = deckSeats.filter((s) => s.row === r)
      rows.push({
        left: rowSeats
          .filter((s) => leftCols.includes(s.col ?? 0))
          .sort((a, b) => (a.col ?? 0) - (b.col ?? 0)),
        aisleSeat: rowSeats.find((s) => aisleCols.includes(s.col ?? 0)),
        right: rowSeats
          .filter((s) => rightCols.includes(s.col ?? 0))
          .sort((a, b) => (a.col ?? 0) - (b.col ?? 0)),
      })
    }
    return rows
  }

  function capAt(row: number, col: number, deckId?: string) {
    return capElements.find((el) => {
      if (el.row !== row || el.col !== col) return false
      if (!deckId) return true
      return (el.deck ?? 'LOWER').toUpperCase() === deckId.toUpperCase()
    })
  }

  function renderAisleCapCell(row: number, deckId: string) {
    const col = aisleCols[0]
    const el = col != null ? capAt(row, col, deckId) : undefined
    if (!el) {
      return (
        <div
          className="flex h-full min-h-[2.75rem] w-6 flex-col items-center justify-center rounded bg-slate-100/90 sm:w-7"
          aria-hidden
        >
          <div className="h-full w-0.5 rounded-full bg-slate-300" />
        </div>
      )
    }

    const Icon = capIcon(el.type)
    return (
      <div
        title={capLabel(el.type, el.label)}
        className={`flex h-10 w-6 flex-col items-center justify-center rounded-md border sm:h-11 sm:w-7 ${capClass(el.type)}`}
      >
        <Icon className="h-3.5 w-3.5" />
      </div>
    )
  }

  function renderSeat(seat: Seat) {
    const editable = canEditSeat(seat)
    return (
      <button
        key={seat.id}
        type="button"
        disabled={!editable}
        onClick={() => editable && onSeatClick(seat)}
        title={`${seat.seatNumber} · ${seatStatusLabel(seat.status)}${editable ? '' : ' (locked)'}`}
        className={`flex h-10 w-10 items-center justify-center rounded-md border text-[10px] font-semibold transition sm:h-11 sm:w-11 sm:text-xs ${seatClass(seat.status, selectedSeatId === seat.id, editable)}`}
      >
        {seat.seatNumber}
      </button>
    )
  }

  function renderSeatSide(cols: number[], rowSeats: Seat[]) {
    return cols.map((col) => {
      const seat = rowSeats.find((s) => s.col === col)
      return seat ? (
        renderSeat(seat)
      ) : (
        <div key={`pad-${col}`} className="h-10 w-10 sm:h-11 sm:w-11" />
      )
    })
  }

  function renderCapCell(row: number, col: number) {
    const el = capAt(row, col)
    if (!el) {
      return <div key={`${row}-${col}`} className="h-10 w-10 sm:h-11 sm:w-11" />
    }

    const Icon = capIcon(el.type)
    return (
      <div
        key={`${row}-${col}`}
        title={capLabel(el.type, el.label)}
        className={`flex h-10 w-10 flex-col items-center justify-center rounded-md border sm:h-11 sm:w-11 ${capClass(el.type)}`}
      >
        <Icon className="h-4 w-4" />
      </div>
    )
  }

  function renderCapRow(row: number, label: string) {
    const hasCaps = capElements.some((el) => el.row === row)
    if (layout && !hasCaps) return null

    return (
      <div className="space-y-1">
        <p className="text-center text-[10px] font-medium uppercase tracking-wide text-slate-400">
          {label}
        </p>
        <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-2 sm:gap-3">
          <div className="flex justify-end gap-1.5 sm:gap-2">
            {leftCols.map((col) => renderCapCell(row, col))}
          </div>
          <div className="flex w-6 flex-col items-center gap-1 sm:w-7">
            {[seatsLeft].map((col) => renderCapCell(row, col))}
          </div>
          <div className="flex justify-start gap-1.5 sm:gap-2">
            {rightCols.map((col) => renderCapCell(row, col))}
          </div>
        </div>
      </div>
    )
  }

  const showSnapshotCaps = !!layout && capElements.length > 0
  const wideGrid = seatsLeft + seatsRight > 4

  return (
    <div className={`mx-auto w-full ${wideGrid ? 'max-w-full overflow-x-auto' : 'max-w-md'}`}>
      <div className={`overflow-hidden rounded-2xl border-2 border-slate-300 bg-gradient-to-b from-slate-50 to-white shadow-inner ${wideGrid ? 'min-w-fit' : ''}`}>
        {!showSnapshotCaps && (
          <div className="border-b border-slate-200 bg-slate-100/80 px-4 py-3">
            <div className="mb-2 flex items-center justify-between text-[10px] font-semibold uppercase tracking-wide text-slate-500">
              <span className="flex items-center gap-1">
                <BusFront className="h-3.5 w-3.5" />
                Front
              </span>
              <span>Windshield</span>
            </div>
            <p className="text-center text-[10px] text-slate-400">
              Cap layout unavailable for this schedule
            </p>
          </div>
        )}

        {showSnapshotCaps && layout && !layout.fromSnapshot && (
          <div className="border-b border-amber-200 bg-amber-50 px-4 py-2 text-center text-[10px] text-amber-800">
            Caps from current bus layout — schedule was created before layout snapshots
          </div>
        )}

        <div className={`space-y-4 px-3 py-4 ${hasUpperDeck ? 'flex flex-col items-stretch gap-4 md:flex-row md:justify-center md:gap-6 md:space-y-0' : ''}`}>
          {decks.map((deck, deckIndex) => {
            const deckRows = buildRows(deck.seats)
            const showCaps = showSnapshotCaps && deck.id === 'LOWER'
            return (
              <div
                key={deck.id}
                className={`space-y-2 ${
                  hasUpperDeck
                    ? `min-w-fit flex-1 ${
                        deckIndex > 0
                          ? 'border-t border-dashed border-slate-200 pt-4 md:border-l md:border-t-0 md:pl-6 md:pt-0'
                          : ''
                      }`
                    : ''
                }`}
              >
                {hasUpperDeck && (
                  <p className="text-center text-[10px] font-semibold uppercase tracking-wide text-slate-500">
                    {deck.label}
                  </p>
                )}
                {showCaps && renderCapRow(LAYOUT_FRONT_ROW, 'Front')}
                {deckRows.map((row, ri) => (
                  <div
                    key={`${deck.id}-${ri}`}
                    className="grid grid-cols-[1fr_auto_1fr] items-center gap-2 sm:gap-3"
                  >
                    <div className="flex justify-end gap-1.5 sm:gap-2">
                      {renderSeatSide(leftCols, row.left)}
                    </div>
                    {row.aisleSeat ? (
                      renderSeat(row.aisleSeat)
                    ) : (
                      renderAisleCapCell(ri, deck.id)
                    )}
                    <div className="flex justify-start gap-1.5 sm:gap-2">
                      {renderSeatSide(rightCols, row.right)}
                    </div>
                  </div>
                ))}
                {showCaps && renderCapRow(LAYOUT_REAR_ROW, 'Rear')}
              </div>
            )
          })}
        </div>
      </div>

      <p className="mt-3 text-center text-xs text-slate-500">
        {layoutSummaryLabel(seatsLeft, seatsRight)} · row 1 is front
        {layout ? ` · layout v${layout.version}${layout.fromSnapshot ? '' : ' (approx)'}` : ''}
        {hasUpperDeck ? ' · double deck' : ''}
        {bus?.hasAc ? ' · AC' : ''}
      </p>
    </div>
  )
}
