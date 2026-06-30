import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  BusFront,
  Eraser,
  LayoutGrid,
  History,
  RefreshCw,
  Save,
} from 'lucide-react'
import {
  applyBusLayoutTemplate,
  getBusLayout,
  getBusLayoutVersion,
  listBusLayoutVersions,
  regenerateBusLayout,
  restoreBusLayoutVersion,
  saveBusLayout,
} from '../api/busLayout'
import { listBuses } from '../api/buses'
import { getErrorMessage } from '../api/client'
import { EmptyState } from '../components/EmptyState'
import { LayoutVersionDiffPanel } from '../components/LayoutVersionDiffPanel'
import { PageHeader } from '../components/PageHeader'
import { useToast } from '../hooks/useToast'
import { capClass, capIcon } from '../lib/busLayoutCaps'
import {
  CAP_TOOLS,
  capRowForType,
  defaultLabelForCap,
  GEOMETRY_PRESETS,
  isAisleCapTool,
  isAisleCol,
  isLeftCol,
  isRightCol,
  LAYOUT_FRONT_ROW,
  LAYOUT_REAR_ROW,
  MAX_SEATS_PER_SIDE,
  normalizeCapElements,
  renumberSeatElements,
  SEAT_TOOLS,
  seatColumnLayout,
  seatNumberForPosition,
  seatsMatchGrid,
  splitDeckCapacity,
  validSeatCols,
  type BuilderTool,
  type CapTool,
} from '../lib/busLayoutGeometry'
import { compareLayoutVersions, type LayoutVersionDiff } from '../lib/layoutVersionDiff'
import type {
  BusBodyType,
  BusDeck,
  BusLayoutElement,
  BusLayoutType,
  LayoutElementType,
} from '../types'

const TEMPLATES: { value: BusLayoutType; label: string; seatsLeft: number; seatsRight: number }[] = [
  { value: 'SEATER_2_2', label: 'Seater 2+2', seatsLeft: 2, seatsRight: 2 },
  { value: 'SEATER_2_1', label: 'Seater 2+1', seatsLeft: 2, seatsRight: 1 },
  { value: 'SLEEPER_1_1', label: 'Sleeper 1+1', seatsLeft: 1, seatsRight: 1 },
]

const BODY_TYPES: { value: BusBodyType; label: string }[] = [
  { value: 'SEATER', label: 'Seater' },
  { value: 'SLEEPER', label: 'Sleeper' },
  { value: 'SEMI_SLEEPER', label: 'Semi-sleeper' },
]

function inferLayoutType(
  seatsLeft: number,
  seatsRight: number,
  bodyType: BusBodyType,
): BusLayoutType {
  if (bodyType === 'SLEEPER' && seatsLeft === 1 && seatsRight === 1) return 'SLEEPER_1_1'
  if (seatsLeft === 2 && seatsRight === 1) return 'SEATER_2_1'
  return 'SEATER_2_2'
}

function toInput(elements: BusLayoutElement[]) {
  return elements.map((el) => ({
    type: el.type,
    deck: el.deck,
    row: el.row,
    col: el.col,
    label: el.label,
    seatNumber: el.seatNumber,
  }))
}

function capElementsOnly(elements: BusLayoutElement[]) {
  return elements.filter((e) => e.type !== 'SEAT')
}

function capsForRegenerate(
  elements: BusLayoutElement[],
  seatsLeft: number,
  seatsRight: number,
) {
  return toInput(
    normalizeCapElements(capElementsOnly(elements), seatsLeft, seatsRight),
  )
}

function elementAt(
  elements: BusLayoutElement[],
  row: number,
  col: number,
  deck: BusDeck = 'LOWER',
) {
  return (
    elements.find(
      (e) => e.row === row && e.col === col && (e.deck ?? 'LOWER') === deck,
    ) ?? null
  )
}

export function BusLayoutBuilder() {
  const { busId: busIdParam } = useParams()
  const { showToast } = useToast()
  const queryClient = useQueryClient()

  const [selectedBusId, setSelectedBusId] = useState<number | ''>(
    busIdParam ? Number(busIdParam) : '',
  )
  const [layoutType, setLayoutType] = useState<BusLayoutType>('SEATER_2_2')
  const [seatsLeft, setSeatsLeft] = useState(2)
  const [seatsRight, setSeatsRight] = useState(2)
  const [seatCapacity, setSeatCapacity] = useState(40)
  const [bodyType, setBodyType] = useState<BusBodyType>('SEATER')
  const [hasAc, setHasAc] = useState(false)
  const [hasUpperDeck, setHasUpperDeck] = useState(false)
  const [lowerDeckCapacity, setLowerDeckCapacity] = useState(20)
  const [upperDeckCapacity, setUpperDeckCapacity] = useState(20)
  const [elements, setElements] = useState<BusLayoutElement[]>([])
  const [selectedTool, setSelectedTool] = useState<BuilderTool>('DRIVER')
  const [dirty, setDirty] = useState(false)
  const [versionDiff, setVersionDiff] = useState<{
    fromVersion: number
    toVersion: number
    diff: LayoutVersionDiff
  } | null>(null)
  const autoRegenReady = useRef(false)

  const busesQuery = useQuery({ queryKey: ['buses'], queryFn: listBuses })

  const layoutQuery = useQuery({
    queryKey: ['bus-layout', selectedBusId],
    queryFn: () => getBusLayout(selectedBusId as number),
    enabled: !!selectedBusId,
  })

  const versionsQuery = useQuery({
    queryKey: ['bus-layout-versions', selectedBusId],
    queryFn: () => listBusLayoutVersions(selectedBusId as number),
    enabled: !!selectedBusId,
  })

  useEffect(() => {
    if (busIdParam) setSelectedBusId(Number(busIdParam))
  }, [busIdParam])

  useEffect(() => {
    setDirty(false)
    autoRegenReady.current = false
    setVersionDiff(null)
  }, [selectedBusId])

  const applyRegeneratedElements = useCallback(
    (
      data: {
        layoutType: BusLayoutType
        seatCapacity: number
        elements: {
          type: LayoutElementType
          deck?: 'LOWER' | 'UPPER'
          row: number
          col: number
          label?: string | null
          seatNumber?: string | null
        }[]
      },
      markDirty = true,
    ) => {
      setElements(
        data.elements.map((el, idx) => ({
          id: -(idx + 1),
          layoutId: layoutQuery.data?.layout.id ?? 0,
          type: el.type,
          deck: el.deck ?? 'LOWER',
          row: el.row,
          col: el.col,
          label: el.label ?? null,
          seatNumber: el.seatNumber ?? null,
        })),
      )
      setLayoutType(data.layoutType)
      setSeatCapacity(data.seatCapacity)
      if (markDirty) setDirty(true)
    },
    [layoutQuery.data?.layout.id],
  )

  useEffect(() => {
    if (!layoutQuery.data || layoutQuery.data.bus.id !== selectedBusId || dirty) return
    const { bus, layout } = layoutQuery.data
    setElements(normalizeCapElements(layout.elements, layout.seatsLeft, layout.seatsRight))
    setLayoutType(layout.layoutType)
    setSeatsLeft(layout.seatsLeft)
    setSeatsRight(layout.seatsRight)
    setSeatCapacity(layout.seatCapacity)
    setHasUpperDeck(layout.hasUpperDeck)
    const split = splitDeckCapacity(
      layout.seatCapacity,
      layout.lowerDeckCapacity,
      layout.upperDeckCapacity,
    )
    setLowerDeckCapacity(split.lower)
    setUpperDeckCapacity(split.upper)
    setBodyType(bus.bodyType)
    setHasAc(bus.hasAc)
    autoRegenReady.current = true
  }, [layoutQuery.data, selectedBusId, dirty])

  const { leftCols, rightCols, aisleCols, gridWidth: currentGridWidth } = useMemo(
    () => seatColumnLayout(seatsLeft, seatsRight),
    [seatsLeft, seatsRight],
  )

  const lowerSeatRows = useMemo(() => {
    const seats = elements.filter(
      (e) => e.type === 'SEAT' && (e.deck ?? 'LOWER') === 'LOWER',
    )
    const maxRow = seats.length > 0 ? Math.max(...seats.map((s) => s.row)) : -1
    const rowCount = Math.max(maxRow + 2, 1)
    const rows: BusLayoutElement[][] = []
    for (let r = 0; r < rowCount; r++) {
      rows.push(seats.filter((s) => s.row === r))
    }
    return rows
  }, [elements])

  const upperSeatRows = useMemo(() => {
    const seats = elements.filter(
      (e) => e.type === 'SEAT' && (e.deck ?? 'LOWER') === 'UPPER',
    )
    const maxRow = seats.length > 0 ? Math.max(...seats.map((s) => s.row)) : -1
    const rowCount = Math.max(maxRow + 2, 1)
    const rows: BusLayoutElement[][] = []
    for (let r = 0; r < rowCount; r++) {
      rows.push(seats.filter((s) => s.row === r))
    }
    return rows
  }, [elements])

  const needsSeatRegen = useMemo(
    () =>
      !seatsMatchGrid(elements, seatsLeft, seatsRight, seatCapacity, {
        hasUpperDeck,
        lowerDeckCapacity,
        upperDeckCapacity,
      }),
    [elements, seatsLeft, seatsRight, seatCapacity, hasUpperDeck, lowerDeckCapacity, upperDeckCapacity],
  )

  const isCapTool = (tool: BuilderTool): tool is CapTool =>
    tool !== 'SEAT_ADD' && tool !== 'SEAT_REMOVE'

  const applyMutation = useMutation({
    mutationFn: () =>
      applyBusLayoutTemplate(selectedBusId as number, {
        layoutType,
        seatCapacity,
        seatsLeft,
        seatsRight,
        bodyType,
        hasAc,
        hasUpperDeck,
        lowerDeckCapacity: hasUpperDeck ? lowerDeckCapacity : undefined,
        upperDeckCapacity: hasUpperDeck ? upperDeckCapacity : undefined,
      }),
    onSuccess: (data) => {
      applyRegeneratedElements(
        {
          layoutType: data.layout.layoutType,
          seatCapacity: data.layout.seatCapacity,
          elements: data.layout.elements,
        },
        false,
      )
      setSeatsLeft(data.layout.seatsLeft)
      setSeatsRight(data.layout.seatsRight)
      setHasUpperDeck(data.layout.hasUpperDeck)
      if (data.layout.lowerDeckCapacity != null && data.layout.upperDeckCapacity != null) {
        setLowerDeckCapacity(data.layout.lowerDeckCapacity)
        setUpperDeckCapacity(data.layout.upperDeckCapacity)
      }
      setDirty(false)
      autoRegenReady.current = true
      void queryClient.invalidateQueries({ queryKey: ['bus-layout', selectedBusId] })
      void queryClient.invalidateQueries({ queryKey: ['bus-layout-versions', selectedBusId] })
      void queryClient.invalidateQueries({ queryKey: ['buses'] })
      showToast('Template applied and saved as a new layout version', 'success')
    },
    onError: (err) => showToast(getErrorMessage(err), 'error'),
  })

  const regenerateMutation = useMutation({
    mutationFn: (overrides?: {
      seatsLeft?: number
      seatsRight?: number
      seatCapacity?: number
      hasUpperDeck?: boolean
      lowerDeckCapacity?: number
      upperDeckCapacity?: number
    }) =>
      regenerateBusLayout(selectedBusId as number, {
        seatsLeft: overrides?.seatsLeft ?? seatsLeft,
        seatsRight: overrides?.seatsRight ?? seatsRight,
        seatCapacity: overrides?.seatCapacity ?? seatCapacity,
        hasUpperDeck: overrides?.hasUpperDeck ?? hasUpperDeck,
        lowerDeckCapacity: hasUpperDeck
          ? (overrides?.lowerDeckCapacity ?? lowerDeckCapacity)
          : undefined,
        upperDeckCapacity: hasUpperDeck
          ? (overrides?.upperDeckCapacity ?? upperDeckCapacity)
          : undefined,
        capElements: capsForRegenerate(
          elements,
          overrides?.seatsLeft ?? seatsLeft,
          overrides?.seatsRight ?? seatsRight,
        ),
        bodyType,
      }),
    onSuccess: (data) => {
      applyRegeneratedElements(data)
      if (data.lowerDeckCapacity != null && data.upperDeckCapacity != null) {
        setLowerDeckCapacity(data.lowerDeckCapacity)
        setUpperDeckCapacity(data.upperDeckCapacity)
      }
      autoRegenReady.current = true
      showToast('Seat grid updated', 'success')
    },
    onError: (err) => showToast(getErrorMessage(err), 'error'),
  })

  const saveMutation = useMutation({
    mutationFn: () =>
      saveBusLayout(selectedBusId as number, {
        layoutType: inferLayoutType(seatsLeft, seatsRight, bodyType),
        seatsLeft,
        seatsRight,
        hasUpperDeck,
        elements: toInput(normalizeCapElements(elements, seatsLeft, seatsRight)),
        hasAc,
        bodyType,
      }),
    onSuccess: (data) => {
      setElements(data.layout.elements)
      setHasUpperDeck(data.layout.hasUpperDeck)
      if (data.layout.lowerDeckCapacity != null && data.layout.upperDeckCapacity != null) {
        setLowerDeckCapacity(data.layout.lowerDeckCapacity)
        setUpperDeckCapacity(data.layout.upperDeckCapacity)
      }
      setDirty(false)
      autoRegenReady.current = true
      void queryClient.invalidateQueries({ queryKey: ['bus-layout', selectedBusId] })
      void queryClient.invalidateQueries({ queryKey: ['bus-layout-versions', selectedBusId] })
      void queryClient.invalidateQueries({ queryKey: ['buses'] })
      showToast('Custom layout saved as a new version', 'success')
    },
    onError: (err) => showToast(getErrorMessage(err), 'error'),
  })

  const restoreMutation = useMutation({
    mutationFn: (layoutId: number) =>
      restoreBusLayoutVersion(selectedBusId as number, layoutId),
    onSuccess: (data) => {
      setElements(data.layout.elements)
      setLayoutType(data.layout.layoutType)
      setSeatsLeft(data.layout.seatsLeft)
      setSeatsRight(data.layout.seatsRight)
      setSeatCapacity(data.layout.seatCapacity)
      setHasUpperDeck(data.layout.hasUpperDeck)
      if (data.layout.lowerDeckCapacity != null && data.layout.upperDeckCapacity != null) {
        setLowerDeckCapacity(data.layout.lowerDeckCapacity)
        setUpperDeckCapacity(data.layout.upperDeckCapacity)
      }
      setDirty(false)
      autoRegenReady.current = true
      void queryClient.invalidateQueries({ queryKey: ['bus-layout', selectedBusId] })
      void queryClient.invalidateQueries({ queryKey: ['bus-layout-versions', selectedBusId] })
      void queryClient.invalidateQueries({ queryKey: ['buses'] })
      showToast(data.message, 'success')
    },
    onError: (err) => showToast(getErrorMessage(err), 'error'),
  })

  async function previewVersion(layoutId: number) {
    try {
      const layout = await getBusLayoutVersion(selectedBusId as number, layoutId)
      setElements(normalizeCapElements(layout.elements, layout.seatsLeft, layout.seatsRight))
      setLayoutType(layout.layoutType)
      setSeatsLeft(layout.seatsLeft)
      setSeatsRight(layout.seatsRight)
      setSeatCapacity(layout.seatCapacity)
      setHasUpperDeck(layout.hasUpperDeck)
      if (layout.lowerDeckCapacity != null && layout.upperDeckCapacity != null) {
        setLowerDeckCapacity(layout.lowerDeckCapacity)
        setUpperDeckCapacity(layout.upperDeckCapacity)
      }
      setDirty(true)
      setVersionDiff(null)
      showToast(
        `Previewing version ${layout.version} — save or restore to make it current`,
        'info',
      )
    } catch (err) {
      showToast(getErrorMessage(err), 'error')
    }
  }

  async function compareVersionToCurrent(layoutId: number, version: number) {
    if (!layoutQuery.data) return
    try {
      const older = await getBusLayoutVersion(selectedBusId as number, layoutId)
      const current = layoutQuery.data.layout
      const diff = compareLayoutVersions(older, current)
      setVersionDiff({
        fromVersion: version,
        toVersion: current.version,
        diff,
      })
    } catch (err) {
      showToast(getErrorMessage(err), 'error')
    }
  }

  function applyGeometryPreset(left: number, right: number) {
    setSeatsLeft(left)
    setSeatsRight(right)
    setElements((prev) => normalizeCapElements(prev, left, right))
    setDirty(true)
    if (selectedBusId && autoRegenReady.current) {
      regenerateMutation.mutate({ seatsLeft: left, seatsRight: right })
    }
  }

  function runAutoRegen(nextLeft: number, nextRight: number) {
    if (!selectedBusId || !autoRegenReady.current) return
    regenerateMutation.mutate({ seatsLeft: nextLeft, seatsRight: nextRight })
  }

  function handleSeatsLeftChange(next: number) {
    if (next === seatsLeft) return
    setSeatsLeft(next)
    setElements((prev) => normalizeCapElements(prev, next, seatsRight))
    setDirty(true)
    runAutoRegen(next, seatsRight)
  }

  function handleSeatsRightChange(next: number) {
    if (next === seatsRight) return
    setSeatsRight(next)
    setElements((prev) => normalizeCapElements(prev, seatsLeft, next))
    setDirty(true)
    runAutoRegen(seatsLeft, next)
  }

  function handleTemplateChange(value: BusLayoutType) {
    const template = TEMPLATES.find((t) => t.value === value)
    if (!template) return
    setLayoutType(value)
    setSeatsLeft(template.seatsLeft)
    setSeatsRight(template.seatsRight)
    setElements((prev) =>
      normalizeCapElements(prev, template.seatsLeft, template.seatsRight),
    )
    if (value === 'SLEEPER_1_1') setBodyType('SLEEPER')
    setDirty(true)
  }

  function handleCapClick(row: number, col: number) {
    if (!isCapTool(selectedTool)) return
    if (selectedTool === 'ROOF_EXIT') return

    if (selectedTool === 'ERASER') {
      setElements(
        elements.filter(
          (e) =>
            !(
              e.row === row &&
              e.col === col &&
              e.type !== 'SEAT' &&
              (e.deck ?? 'LOWER') === 'LOWER'
            ),
        ),
      )
      setDirty(true)
      return
    }

    const expectedRow = capRowForType(selectedTool)
    if (row !== expectedRow) {
      showToast(
        `${defaultLabelForCap(selectedTool)} belongs on the ${expectedRow === LAYOUT_FRONT_ROW ? 'front' : 'rear'} row`,
        'error',
      )
      return
    }

    const filtered = elements.filter(
      (e) =>
        e.type === 'SEAT' ||
        (e.row === row && e.col === col ? false : e.type !== selectedTool),
    )

    const newCap: BusLayoutElement = {
      id: -Date.now(),
      layoutId: layoutQuery.data?.layout.id ?? 0,
      type: selectedTool,
      deck: 'LOWER',
      row,
      col,
      label: defaultLabelForCap(selectedTool),
      seatNumber: null,
    }

    setElements([...filtered, newCap])
    setDirty(true)
  }

  function handleAisleCapClick(row: number, col: number, deck: BusDeck) {
    if (!isAisleCol(col, seatsLeft, seatsRight)) return

    if (selectedTool === 'ERASER') {
      setElements(
        elements.filter(
          (e) =>
            !(
              e.row === row &&
              e.col === col &&
              e.type !== 'SEAT' &&
              (e.deck ?? 'LOWER') === deck
            ),
        ),
      )
      setDirty(true)
      return
    }

    if (selectedTool !== 'ROOF_EXIT') return

    const filtered = elements.filter(
      (e) =>
        e.type === 'SEAT' ||
        !(e.row === row && e.col === col && (e.deck ?? 'LOWER') === deck),
    )

    const newCap: BusLayoutElement = {
      id: -Date.now(),
      layoutId: layoutQuery.data?.layout.id ?? 0,
      type: 'ROOF_EXIT',
      deck,
      row,
      col,
      label: defaultLabelForCap('ROOF_EXIT'),
      seatNumber: null,
    }

    setElements([...filtered, newCap])
    setDirty(true)
  }

  function renderAisleCell(row: number, col: number, deck: BusDeck) {
    const seat = elements.find(
      (e) =>
        e.type === 'SEAT' &&
        e.row === row &&
        e.col === col &&
        (e.deck ?? 'LOWER') === deck,
    )
    if (seat) {
      return renderSeatCell(row, col, deck, seat)
    }

    const el = elementAt(elements, row, col, deck)
    const isAisleMode = isAisleCapTool(selectedTool) || selectedTool === 'ERASER'

    if (el && el.type !== 'SEAT') {
      const Icon = capIcon(el.type)
      return (
        <button
          key={`aisle-${deck}-${row}-${col}`}
          type="button"
          onClick={() => isAisleMode && handleAisleCapClick(row, col, deck)}
          className={`flex h-10 w-8 items-center justify-center rounded-md border transition hover:ring-2 hover:ring-brand/40 ${capClass(el.type)}`}
          title={`${el.label ?? el.type} — click to edit`}
        >
          <Icon className="h-3.5 w-3.5" />
        </button>
      )
    }

    return (
      <button
        key={`aisle-empty-${deck}-${row}-${col}`}
        type="button"
        onClick={() => selectedTool === 'ROOF_EXIT' && handleAisleCapClick(row, col, deck)}
        disabled={selectedTool !== 'ROOF_EXIT'}
        className={`flex h-10 w-8 items-center justify-center rounded-md border text-slate-400 transition ${
          selectedTool === 'ROOF_EXIT'
            ? 'border-dashed border-slate-300 bg-slate-50 hover:border-brand hover:bg-brand-light/20'
            : 'border-transparent bg-slate-100'
        }`}
        title={selectedTool === 'ROOF_EXIT' ? 'Place roof exit in aisle' : 'Aisle'}
      >
        {selectedTool === 'ROOF_EXIT' ? '+' : ''}
      </button>
    )
  }

  function handleSeatClick(row: number, col: number, deck: BusDeck) {
    if (!validSeatCols(seatsLeft, seatsRight).includes(col)) return

    const existing = elementAt(elements, row, col, deck)
    const layoutId = layoutQuery.data?.layout.id ?? 0

    if (selectedTool === 'SEAT_REMOVE') {
      if (!existing || existing.type !== 'SEAT') return
      const next = renumberSeatElements(
        elements.filter(
          (e) =>
            !(
              e.row === row &&
              e.col === col &&
              e.type === 'SEAT' &&
              (e.deck ?? 'LOWER') === deck
            ),
        ),
        seatsLeft,
        seatsRight,
        bodyType,
        hasUpperDeck,
      )
      const seatCount = next.filter((e) => e.type === 'SEAT').length
      setElements(next)
      setSeatCapacity(seatCount)
      setDirty(true)
      return
    }

    if (selectedTool === 'SEAT_ADD') {
      if (existing) return
      const seatNumber = seatNumberForPosition(
        row,
        col,
        seatsLeft,
        seatsRight,
        bodyType,
        deck,
        hasUpperDeck,
      )
      const newSeat: BusLayoutElement = {
        id: -Date.now(),
        layoutId,
        type: 'SEAT',
        deck,
        row,
        col,
        label: seatNumber,
        seatNumber,
      }
      const next = renumberSeatElements([...elements, newSeat], seatsLeft, seatsRight, bodyType, hasUpperDeck)
      const seatCount = next.filter((e) => e.type === 'SEAT').length
      setElements(next)
      setSeatCapacity(seatCount)
      setDirty(true)
    }
  }

  function renderSeatCell(
    row: number,
    col: number,
    deck: BusDeck,
    seat: BusLayoutElement | undefined,
  ) {
    const isSeatMode = selectedTool === 'SEAT_ADD' || selectedTool === 'SEAT_REMOVE'

    if (seat) {
      return (
        <button
          key={`${deck}-${row}-${col}`}
          type="button"
          onClick={() => isSeatMode && handleSeatClick(row, col, deck)}
          disabled={!isSeatMode}
          className={`flex h-10 w-10 items-center justify-center rounded-md border text-[10px] font-semibold transition ${
            isSeatMode && selectedTool === 'SEAT_REMOVE'
              ? 'border-red-200 bg-red-50 text-red-800 hover:border-red-400'
              : 'border-slate-200 bg-white text-slate-700'
          } ${isSeatMode ? 'cursor-pointer' : 'cursor-default'}`}
          title={isSeatMode ? `Remove ${seat.seatNumber}` : seat.seatNumber ?? ''}
        >
          {seat.seatNumber}
        </button>
      )
    }

    return (
      <button
        key={`empty-${deck}-${row}-${col}`}
        type="button"
        onClick={() => isSeatMode && handleSeatClick(row, col, deck)}
        disabled={!isSeatMode || selectedTool !== 'SEAT_ADD'}
        className={`flex h-10 w-10 items-center justify-center rounded-md border border-dashed text-slate-400 transition ${
          isSeatMode && selectedTool === 'SEAT_ADD'
            ? 'border-slate-300 bg-white hover:border-brand hover:bg-brand-light/20'
            : 'border-transparent'
        }`}
        title={isSeatMode && selectedTool === 'SEAT_ADD' ? 'Add seat' : undefined}
      >
        {isSeatMode && selectedTool === 'SEAT_ADD' ? '+' : ''}
      </button>
    )
  }

  function renderCapCell(row: number, col: number) {
    const el = elementAt(elements, row, col, 'LOWER')
    const aisle = isAisleCol(col, seatsLeft, seatsRight)

    if (el && el.type !== 'SEAT') {
      const Icon = capIcon(el.type)
      return (
        <button
          key={`${row}-${col}`}
          type="button"
          onClick={() => handleCapClick(row, col)}
          className={`flex h-10 w-10 items-center justify-center rounded-md border transition hover:ring-2 hover:ring-brand/40 ${capClass(el.type)}`}
          title={`${el.label ?? el.type} — click to edit`}
        >
          <Icon className="h-4 w-4" />
        </button>
      )
    }

    return (
      <button
        key={`${row}-${col}`}
        type="button"
        onClick={() => handleCapClick(row, col)}
        className={`flex h-10 w-10 items-center justify-center rounded-md border border-dashed text-slate-400 transition hover:border-brand hover:bg-brand-light/20 ${
          aisle ? 'border-slate-200 bg-slate-50' : 'border-slate-200 bg-white'
        }`}
        title={aisle ? 'Aisle — place exit or cap' : 'Place cap element'}
      >
        {isCapTool(selectedTool) && selectedTool === 'ERASER' ? (
          <Eraser className="h-3.5 w-3.5" />
        ) : (
          <span className="text-[10px]">+</span>
        )}
      </button>
    )
  }

  function renderCapRow(row: number, label: string) {
    return (
      <div className="space-y-1">
        <p className="text-center text-[10px] font-medium uppercase tracking-wide text-slate-400">
          {label}
        </p>
        <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-3">
          <div className="flex justify-end gap-2">
            {Array.from({ length: currentGridWidth }, (_, col) => col)
              .filter((col) => isLeftCol(col, seatsLeft))
              .map((col) => renderCapCell(row, col))}
          </div>
          <div className="flex w-8 flex-col items-center gap-1">
            {Array.from({ length: currentGridWidth }, (_, col) => col)
              .filter((col) => isAisleCol(col, seatsLeft, seatsRight))
              .map((col) => renderCapCell(row, col))}
          </div>
          <div className="flex gap-2">
            {Array.from({ length: currentGridWidth }, (_, col) => col)
              .filter((col) => isRightCol(col, seatsLeft, seatsRight))
              .map((col) => renderCapCell(row, col))}
          </div>
        </div>
      </div>
    )
  }

  function renderDeckGrid(deck: BusDeck, label: string, seatRows: BusLayoutElement[][]) {
    const deckSeats = elements.filter(
      (e) => e.type === 'SEAT' && (e.deck ?? 'LOWER') === deck,
    )

    return (
      <div
        className={`min-w-fit flex-1 space-y-4 ${
          deck === 'UPPER' ? 'border-t border-dashed border-slate-200 pt-4 md:border-l md:border-t-0 md:pl-6 md:pt-0' : ''
        }`}
      >
        <p className="text-center text-xs font-semibold uppercase tracking-wide text-slate-500">
          {label}
        </p>
        {deck === 'LOWER' && renderCapRow(LAYOUT_FRONT_ROW, 'Front caps')}
        {seatRows.map((rowSeats, idx) => (
          <div key={`${deck}-${idx}`} className="grid grid-cols-[1fr_auto_1fr] items-center gap-3">
            <div className="flex justify-end gap-2">
              {leftCols.map((col) =>
                renderSeatCell(
                  idx,
                  col,
                  deck,
                  rowSeats.find((s) => s.col === col),
                ),
              )}
            </div>
            <div className="flex w-8 flex-col items-center gap-1">
              {aisleCols.map((col) => renderAisleCell(idx, col, deck))}
            </div>
            <div className="flex gap-2">
              {rightCols.map((col) =>
                renderSeatCell(
                  idx,
                  col,
                  deck,
                  rowSeats.find((s) => s.col === col),
                ),
              )}
            </div>
          </div>
        ))}
        {deck === 'LOWER' && renderCapRow(LAYOUT_REAR_ROW, 'Rear caps')}
      </div>
    )
  }

  if (busesQuery.isError) {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
        Failed to load buses. {getErrorMessage(busesQuery.error)}
      </div>
    )
  }

  const buses = busesQuery.data ?? []
  const layoutReady =
    !!selectedBusId &&
    !!layoutQuery.data &&
    layoutQuery.data.bus.id === selectedBusId &&
    !layoutQuery.isFetching

  return (
    <div className="space-y-6">
      <PageHeader
        title="Bus Layout Builder"
        subtitle="Configure aisle geometry, cap positions, and AC. Saved layouts apply to new schedules only."
        action={
          dirty ? (
            <button
              type="button"
              className="btn-primary"
              disabled={!selectedBusId || saveMutation.isPending || needsSeatRegen}
              onClick={() => saveMutation.mutate()}
              title={needsSeatRegen ? 'Update the seat grid before saving' : undefined}
            >
              <Save className="h-4 w-4" />
              Save custom layout
            </button>
          ) : null
        }
      />

      {needsSeatRegen && layoutReady && (
        <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
          Seat grid is out of date for the current column layout or capacity. Click{' '}
          <strong>Update seat grid</strong> before saving.
        </div>
      )}

      <div className="grid gap-4 rounded-xl border border-slate-200 bg-white p-4 xl:grid-cols-[280px_1fr]">
        <div className="space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">Bus</label>
            <select
              className="input-field"
              value={selectedBusId}
              onChange={(e) => setSelectedBusId(e.target.value ? Number(e.target.value) : '')}
            >
              <option value="">Select bus</option>
              {buses.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.name} ({b.registrationNo})
                </option>
              ))}
            </select>
          </div>

          <div className="rounded-lg border border-slate-200 bg-slate-50 p-3 space-y-3">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Bus profile</p>
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">Body type</label>
              <select
                className="input-field"
                value={bodyType}
                onChange={(e) => {
                  const next = e.target.value as BusBodyType
                  setBodyType(next)
                  setElements(renumberSeatElements(elements, seatsLeft, seatsRight, next, hasUpperDeck))
                  setDirty(true)
                }}
              >
                {BODY_TYPES.map((t) => (
                  <option key={t.value} value={t.value}>
                    {t.label}
                  </option>
                ))}
              </select>
            </div>
            <label className="flex items-center gap-2 text-sm text-slate-700">
              <input
                type="checkbox"
                checked={hasAc}
                onChange={(e) => {
                  setHasAc(e.target.checked)
                  setDirty(true)
                }}
              />
              Air conditioned (AC)
            </label>
            <label className="flex items-center gap-2 text-sm text-slate-700">
              <input
                type="checkbox"
                checked={hasUpperDeck}
                onChange={(e) => {
                  const next = e.target.checked
                  setHasUpperDeck(next)
                  if (next) {
                    const split = splitDeckCapacity(seatCapacity)
                    setLowerDeckCapacity(split.lower)
                    setUpperDeckCapacity(split.upper)
                  }
                  setDirty(true)
                  if (selectedBusId && autoRegenReady.current) {
                    regenerateMutation.mutate({ hasUpperDeck: next })
                  }
                }}
              />
              Upper deck (double-decker)
            </label>
          </div>

          <div className="rounded-lg border border-slate-200 p-3 space-y-3">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Aisle geometry</p>
            <div className="flex flex-wrap gap-1.5">
              {GEOMETRY_PRESETS.map((preset) => (
                <button
                  key={preset.label}
                  type="button"
                  onClick={() => applyGeometryPreset(preset.seatsLeft, preset.seatsRight)}
                  className={`rounded-md border px-2 py-1 text-xs transition ${
                    seatsLeft === preset.seatsLeft && seatsRight === preset.seatsRight
                      ? 'border-brand bg-brand-light text-brand'
                      : 'border-slate-200 hover:border-slate-300'
                  }`}
                >
                  {preset.label}
                </button>
              ))}
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="mb-1 block text-xs font-medium text-slate-600">Left columns</label>
                <select
                  className="input-field"
                  value={seatsLeft}
                  onChange={(e) => handleSeatsLeftChange(Number(e.target.value))}
                >
                  {Array.from({ length: MAX_SEATS_PER_SIDE }, (_, i) => i + 1).map((n) => (
                    <option key={n} value={n}>
                      {n}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-slate-600">Right columns</label>
                <select
                  className="input-field"
                  value={seatsRight}
                  onChange={(e) => handleSeatsRightChange(Number(e.target.value))}
                >
                  {Array.from({ length: MAX_SEATS_PER_SIDE }, (_, i) => i + 1).map((n) => (
                    <option key={n} value={n}>
                      {n}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <p className="text-xs text-slate-500">
              {seatsLeft}+{seatsRight} · {currentGridWidth} grid columns (incl. aisle). Left/right changes
              auto-update seats.
            </p>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">Template</label>
            <select
              className="input-field"
              value={layoutType}
              onChange={(e) => handleTemplateChange(e.target.value as BusLayoutType)}
            >
              {TEMPLATES.map((t) => (
                <option key={t.value} value={t.value}>
                  {t.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">Seat capacity</label>
            <input
              type="number"
              min={1}
              max={100}
              className="input-field"
              value={seatCapacity}
              onChange={(e) => {
                const next = Number(e.target.value)
                const capacity = Number.isFinite(next) && next > 0 ? next : 1
                setSeatCapacity(capacity)
                if (hasUpperDeck) {
                  const split = splitDeckCapacity(capacity, lowerDeckCapacity, null)
                  setLowerDeckCapacity(split.lower)
                  setUpperDeckCapacity(split.upper)
                }
                setDirty(true)
              }}
            />
          </div>

          {hasUpperDeck && (
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="mb-1 block text-xs font-medium text-slate-600">
                  Lower deck seats
                </label>
                <input
                  type="number"
                  min={0}
                  max={seatCapacity}
                  className="input-field"
                  value={lowerDeckCapacity}
                  onChange={(e) => {
                    const next = Math.max(0, Math.min(seatCapacity, Number(e.target.value) || 0))
                    setLowerDeckCapacity(next)
                    setUpperDeckCapacity(Math.max(0, seatCapacity - next))
                    setDirty(true)
                  }}
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-slate-600">
                  Upper deck seats
                </label>
                <input
                  type="number"
                  min={0}
                  max={seatCapacity}
                  className="input-field"
                  value={upperDeckCapacity}
                  onChange={(e) => {
                    const next = Math.max(0, Math.min(seatCapacity, Number(e.target.value) || 0))
                    setUpperDeckCapacity(next)
                    setLowerDeckCapacity(Math.max(0, seatCapacity - next))
                    setDirty(true)
                  }}
                />
              </div>
              <p className="col-span-2 text-xs text-slate-500">
                Total {lowerDeckCapacity + upperDeckCapacity} seats across decks. Click{' '}
                <strong>Update seat grid</strong> after changing counts.
              </p>
            </div>
          )}

          <button
            type="button"
            className="btn-secondary w-full"
            disabled={!selectedBusId || applyMutation.isPending}
            onClick={() => applyMutation.mutate()}
          >
            Apply & save template
          </button>
          <p className="text-xs text-slate-500">
            Applies the preset and immediately saves a new layout version.
          </p>

          <button
            type="button"
            className="btn-secondary flex w-full items-center justify-center gap-2"
            disabled={!selectedBusId || regenerateMutation.isPending}
            onClick={() => regenerateMutation.mutate({})}
          >
            <RefreshCw className="h-4 w-4" />
            Update seat grid
          </button>

          <div className="rounded-lg border border-slate-200 p-3 space-y-2">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Seats</p>
            <p className="text-xs text-slate-500">Add or remove individual seats on the diagram.</p>
            <div className="grid grid-cols-2 gap-1.5">
              {SEAT_TOOLS.map((tool) => (
                <button
                  key={tool.value}
                  type="button"
                  onClick={() => setSelectedTool(tool.value)}
                  className={`rounded-md border px-2 py-1.5 text-left text-xs transition ${
                    selectedTool === tool.value
                      ? 'border-brand bg-brand-light text-brand'
                      : 'border-slate-200 hover:border-slate-300'
                  }`}
                >
                  {tool.label}
                </button>
              ))}
            </div>
          </div>

          <div className="rounded-lg border border-slate-200 p-3 space-y-2">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Cap elements</p>
            <p className="text-xs text-slate-500">
              Front/rear caps: click diagram ends. Roof exit: select tool, then click an aisle cell on a
              seat row.
            </p>
            <div className="grid grid-cols-2 gap-1.5">
              {CAP_TOOLS.map((tool) => (
                <button
                  key={tool.value}
                  type="button"
                  onClick={() => setSelectedTool(tool.value)}
                  className={`rounded-md border px-2 py-1.5 text-left text-xs transition ${
                    selectedTool === tool.value
                      ? 'border-brand bg-brand-light text-brand'
                      : 'border-slate-200 hover:border-slate-300'
                  }`}
                >
                  {tool.label}
                </button>
              ))}
            </div>
          </div>

          {layoutQuery.data && (
            <p className="text-xs text-slate-500">
              Version {layoutQuery.data.layout.version} · {elements.filter((e) => e.type === 'SEAT').length} seats
            </p>
          )}

          {versionsQuery.data && versionsQuery.data.length > 0 && (
            <div className="rounded-lg border border-slate-200 p-3 space-y-2">
              <p className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-slate-500">
                <History className="h-3.5 w-3.5" />
                Version history
              </p>
              <ul className="max-h-48 space-y-2 overflow-y-auto text-xs">
                {versionsQuery.data.map((v) => {
                  const isCurrent = layoutQuery.data?.layout.id === v.id
                  return (
                    <li
                      key={v.id}
                      className={`rounded-md border px-2 py-2 ${isCurrent ? 'border-brand bg-brand-light/30' : 'border-slate-200'}`}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-medium text-slate-800">
                          v{v.version}
                          {isCurrent ? ' · current' : ''}
                        </span>
                        <span className="text-slate-500">
                          {v.seatsLeft}+{v.seatsRight}
                        </span>
                      </div>
                      <p className="mt-0.5 text-slate-500">
                        {v.seatCapacity} seats ·{' '}
                        {new Date(v.createdAt).toLocaleDateString('en-IN')}
                      </p>
                      {!isCurrent && (
                        <div className="mt-2 flex flex-wrap gap-1.5">
                          <button
                            type="button"
                            className="btn-secondary flex-1 px-2 py-1 text-[11px] min-w-[4.5rem]"
                            onClick={() => void previewVersion(v.id)}
                          >
                            Preview
                          </button>
                          <button
                            type="button"
                            className="btn-secondary flex-1 px-2 py-1 text-[11px] min-w-[4.5rem]"
                            onClick={() => void compareVersionToCurrent(v.id, v.version)}
                          >
                            Compare
                          </button>
                          <button
                            type="button"
                            className="btn-secondary flex-1 px-2 py-1 text-[11px] min-w-[4.5rem]"
                            disabled={restoreMutation.isPending}
                            onClick={() => restoreMutation.mutate(v.id)}
                          >
                            Restore
                          </button>
                        </div>
                      )}
                    </li>
                  )
                })}
              </ul>
              {versionDiff && (
                <LayoutVersionDiffPanel
                  fromVersion={versionDiff.fromVersion}
                  toVersion={versionDiff.toVersion}
                  diff={versionDiff.diff}
                  onClose={() => setVersionDiff(null)}
                />
              )}
            </div>
          )}
        </div>

        <div>
          {!selectedBusId ? (
            <EmptyState
              icon={LayoutGrid}
              title="Select a bus"
              description="Choose a bus to view or edit its layout."
            />
          ) : !layoutReady ? (
            <div className="flex h-64 items-center justify-center text-sm text-slate-500">
              Loading layout…
            </div>
          ) : layoutQuery.isError ? (
            <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
              {getErrorMessage(layoutQuery.error)}
            </div>
          ) : (
            <div className="mx-auto max-w-full overflow-x-auto">
            <div className={`mx-auto min-w-fit space-y-4 px-2 ${hasUpperDeck ? 'max-w-6xl' : 'max-w-3xl'}`}>
              <div className="flex flex-col items-center gap-2">
                <div className="flex items-center justify-center gap-2 text-xs font-medium uppercase tracking-wide text-slate-500">
                  <BusFront className="h-4 w-4" />
                  Front of bus
                </div>
              </div>

              <div
                className={
                  hasUpperDeck
                    ? 'flex flex-col items-stretch gap-4 md:flex-row md:justify-center'
                    : ''
                }
              >
                {renderDeckGrid('LOWER', 'Lower deck', lowerSeatRows)}
                {hasUpperDeck && renderDeckGrid('UPPER', 'Upper deck', upperSeatRows)}
              </div>

              <p className="text-center text-xs text-slate-500">
                Use cap tools on front/rear rows; use seat tools on the cabin grid. Custom layouts
                need <strong>Save custom layout</strong>.{' '}
                <Link to="/schedules" className="text-brand hover:underline">
                  Manage schedules
                </Link>
              </p>
            </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
