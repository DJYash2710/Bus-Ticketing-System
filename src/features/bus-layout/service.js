import { BusBodyType, BusLayoutType, LayoutElementType, Prisma, SeatStatus, } from '@prisma/client';
import { prisma } from '../../config/db.js';
import { ApiError } from '../../core/utils/apiError.js';
import { isOperator, requireOperatorFleetId, } from '../../core/utils/operatorScope.js';
import { capRowForType, gridWidth, inferSeatsFromLayoutType, isAisleCapType, isAisleCol, isCapRow, isFixedCapType, isValidSeatCol, LAYOUT_FRONT_ROW, LAYOUT_REAR_ROW, MAX_SEATS_PER_SIDE, normalizeCapElements, validateSeatGeometry, } from '../../lib/bus-layout/geometry.js';
import { buildLayout, extractCapElements, generateLayoutFromTemplate, layoutConfigFromTemplate, regenerateLayoutElements, } from '../../lib/bus-layout/templates.js';
const layoutInclude = {
    elements: {
        orderBy: [
            { row: 'asc' },
            { col: 'asc' },
        ],
    },
};
function deckSeatCounts(elements) {
    let lower = 0;
    let upper = 0;
    for (const el of elements) {
        if (el.type !== LayoutElementType.SEAT)
            continue;
        if ((el.deck ?? 'LOWER') === 'UPPER')
            upper += 1;
        else
            lower += 1;
    }
    return { lower, upper };
}
async function assertBusLayoutAccess(busId, caller) {
    const bus = await prisma.bus.findUnique({ where: { id: busId } });
    if (!bus)
        throw new ApiError(404, 'Bus not found');
    if (isOperator(caller)) {
        const fleetId = requireOperatorFleetId(caller);
        if (bus.operatorId !== fleetId) {
            throw new ApiError(403, 'You do not have permission to access this bus layout');
        }
    }
    return bus;
}
function validateSeatGeometryInput(seatsLeft, seatsRight) {
    try {
        validateSeatGeometry(seatsLeft, seatsRight);
    }
    catch {
        throw new ApiError(400, `seatsLeft and seatsRight must each be between 1 and ${MAX_SEATS_PER_SIDE}`);
    }
}
function validateElements(elements, seatsLeft, seatsRight) {
    validateSeatGeometryInput(seatsLeft, seatsRight);
    const seatNumbers = new Set();
    const grid = new Set();
    const maxCol = gridWidth(seatsLeft, seatsRight) - 1;
    let driverCount = 0;
    const seatColsByDeckRow = new Map();
    for (const el of elements) {
        if (el.type !== LayoutElementType.SEAT)
            continue;
        const key = `${el.deck ?? 'LOWER'}:${el.row}`;
        const cols = seatColsByDeckRow.get(key) ?? [];
        cols.push(el.col);
        seatColsByDeckRow.set(key, cols);
    }
    for (const el of elements) {
        if (el.col < 0 || el.col > maxCol) {
            throw new ApiError(400, `Column ${el.col} is outside the bus grid`);
        }
        const key = `${el.deck ?? 'LOWER'}:${el.row}:${el.col}`;
        if (grid.has(key)) {
            throw new ApiError(400, `Duplicate grid position at row ${el.row}, col ${el.col}`);
        }
        grid.add(key);
        if (el.type === LayoutElementType.SEAT) {
            const rowKey = `${el.deck ?? 'LOWER'}:${el.row}`;
            const rowSeatCols = seatColsByDeckRow.get(rowKey) ?? [];
            if (!isValidSeatCol(el.col, rowSeatCols, seatsLeft, seatsRight)) {
                throw new ApiError(400, `Seat at col ${el.col} is not a valid seat column`);
            }
            if (!el.seatNumber?.trim()) {
                throw new ApiError(400, 'Seat elements require a seatNumber');
            }
            if (seatNumbers.has(el.seatNumber)) {
                throw new ApiError(400, `Duplicate seat number: ${el.seatNumber}`);
            }
            seatNumbers.add(el.seatNumber);
            continue;
        }
        if (isAisleCapType(el.type)) {
            if (!isAisleCol(el.col, seatsLeft, seatsRight)) {
                throw new ApiError(400, `${el.type} must be placed in the aisle column`);
            }
            if (isCapRow(el.row)) {
                throw new ApiError(400, `${el.type} must be placed on a seat row, not a front/rear cap row`);
            }
            continue;
        }
        if (!isCapRow(el.row)) {
            throw new ApiError(400, `${el.type} must be placed on a front or rear cap row`);
        }
        if ((el.deck ?? 'LOWER') !== 'LOWER' && !isAisleCapType(el.type)) {
            throw new ApiError(400, `${el.type} must be placed on the lower deck`);
        }
        if (!isFixedCapType(el.type)) {
            continue;
        }
        const expectedRow = capRowForType(el.type);
        if (el.row !== expectedRow) {
            throw new ApiError(400, `${el.type} must be on row ${expectedRow}`);
        }
        if (el.type === LayoutElementType.DRIVER) {
            driverCount++;
        }
    }
    if (driverCount > 1) {
        throw new ApiError(400, 'Only one driver position is allowed');
    }
}
function deckCapacityFields(hasUpperDeck, lowerDeckCapacity, upperDeckCapacity) {
    if (!hasUpperDeck)
        return {};
    return {
        ...(lowerDeckCapacity !== undefined ? { lowerDeckCapacity } : {}),
        ...(upperDeckCapacity !== undefined ? { upperDeckCapacity } : {}),
    };
}
async function createLayoutVersion(busId, layoutType, seatsLeft, seatsRight, elements, createdByUserId, hasUpperDeck = false) {
    const seatCapacity = elements.filter((e) => e.type === LayoutElementType.SEAT).length;
    const upperDeck = hasUpperDeck ||
        elements.some((e) => e.type === LayoutElementType.SEAT && (e.deck ?? 'LOWER') === 'UPPER');
    const { lower, upper } = deckSeatCounts(elements);
    const latest = await prisma.busLayout.findFirst({
        where: { busId },
        orderBy: { version: 'desc' },
        select: { version: true },
    });
    const version = (latest?.version ?? 0) + 1;
    try {
        const layout = await prisma.$transaction(async (tx) => {
            const created = await tx.busLayout.create({
                data: {
                    busId,
                    version,
                    layoutType,
                    seatsLeft,
                    seatsRight,
                    hasUpperDeck: upperDeck,
                    lowerDeckCapacity: upperDeck ? lower : null,
                    upperDeckCapacity: upperDeck ? upper : null,
                    seatCapacity,
                    createdByUserId: createdByUserId ?? null,
                    elements: {
                        create: elements.map((el) => ({
                            type: el.type,
                            deck: el.deck ?? 'LOWER',
                            row: el.row,
                            col: el.col,
                            label: el.label ?? null,
                            seatNumber: el.seatNumber ?? null,
                        })),
                    },
                },
                include: layoutInclude,
            });
            await tx.bus.update({
                where: { id: busId },
                data: {
                    currentLayoutId: created.id,
                    capacity: seatCapacity,
                    layoutType,
                },
            });
            return created;
        });
        return layout;
    }
    catch (err) {
        if (err instanceof Prisma.PrismaClientKnownRequestError &&
            err.code === 'P2002') {
            const target = Array.isArray(err.meta?.target)
                ? err.meta.target.join(', ')
                : 'unique field';
            throw new ApiError(400, `Layout save failed: duplicate ${target}. Regenerate the seat grid and try again.`);
        }
        throw err;
    }
}
export async function createInitialLayoutForBus(busId, layoutType, seatCapacity, createdByUserId, bodyType = BusBodyType.SEATER) {
    const generated = generateLayoutFromTemplate(layoutType, seatCapacity, bodyType);
    return createLayoutVersion(busId, generated.layoutType, generated.seatsLeft, generated.seatsRight, generated.elements, createdByUserId);
}
export async function getCurrentBusLayout(busId, caller) {
    const bus = await assertBusLayoutAccess(busId, caller);
    if (!bus.currentLayoutId) {
        throw new ApiError(404, 'No layout configured for this bus');
    }
    const layout = await prisma.busLayout.findUnique({
        where: { id: bus.currentLayoutId },
        include: layoutInclude,
    });
    if (!layout)
        throw new ApiError(404, 'Layout not found');
    const geometry = inferSeatsFromLayoutType(layout.layoutType);
    return {
        bus: {
            id: bus.id,
            name: bus.name,
            bodyType: bus.bodyType,
            layoutType: bus.layoutType,
            hasAc: bus.hasAc,
            capacity: bus.capacity,
        },
        layout: {
            ...layout,
            seatsLeft: layout.seatsLeft ?? geometry.seatsLeft,
            seatsRight: layout.seatsRight ?? geometry.seatsRight,
        },
    };
}
export async function saveBusLayout(busId, input, caller) {
    const bus = await assertBusLayoutAccess(busId, caller);
    const normalizedElements = normalizeCapElements(input.elements, input.seatsLeft, input.seatsRight);
    validateElements(normalizedElements, input.seatsLeft, input.seatsRight);
    const layout = await createLayoutVersion(busId, input.layoutType, input.seatsLeft, input.seatsRight, normalizedElements, caller.id, input.hasUpperDeck);
    if (input.hasAc !== undefined || input.bodyType !== undefined) {
        await prisma.bus.update({
            where: { id: busId },
            data: {
                hasAc: input.hasAc ?? bus.hasAc,
                bodyType: input.bodyType ?? bus.bodyType,
            },
        });
    }
    return {
        message: 'Layout saved. New schedules will use this version.',
        layout,
    };
}
export async function applyBusLayoutTemplate(busId, input, caller) {
    const bus = await assertBusLayoutAccess(busId, caller);
    const capacity = input.seatCapacity || bus.capacity;
    const bodyType = input.bodyType ?? bus.bodyType;
    const baseConfig = layoutConfigFromTemplate(input.layoutType, capacity, bodyType);
    const generated = buildLayout({
        ...baseConfig,
        seatsLeft: input.seatsLeft ?? baseConfig.seatsLeft,
        seatsRight: input.seatsRight ?? baseConfig.seatsRight,
        bodyType,
        ...(input.hasUpperDeck !== undefined ? { hasUpperDeck: input.hasUpperDeck } : {}),
        ...deckCapacityFields(input.hasUpperDeck, input.lowerDeckCapacity, input.upperDeckCapacity),
    });
    const layout = await createLayoutVersion(busId, generated.layoutType, generated.seatsLeft, generated.seatsRight, generated.elements, caller.id, generated.hasUpperDeck);
    if (input.hasAc !== undefined || input.bodyType !== undefined) {
        await prisma.bus.update({
            where: { id: busId },
            data: {
                hasAc: input.hasAc ?? bus.hasAc,
                bodyType: input.bodyType ?? bus.bodyType,
            },
        });
    }
    return {
        message: 'Template applied. New schedules will use this layout.',
        layout,
    };
}
export async function regenerateBusLayoutPreview(busId, input, caller) {
    const bus = await assertBusLayoutAccess(busId, caller);
    validateSeatGeometryInput(input.seatsLeft, input.seatsRight);
    const capElements = normalizeCapElements(input.capElements, input.seatsLeft, input.seatsRight);
    validateElements(capElements, input.seatsLeft, input.seatsRight);
    const bodyType = input.bodyType ?? bus.bodyType;
    const elements = regenerateLayoutElements(capElements, {
        seatsLeft: input.seatsLeft,
        seatsRight: input.seatsRight,
        seatCapacity: input.seatCapacity,
        bodyType,
        ...(input.hasUpperDeck !== undefined ? { hasUpperDeck: input.hasUpperDeck } : {}),
        ...deckCapacityFields(input.hasUpperDeck, input.lowerDeckCapacity, input.upperDeckCapacity),
    });
    validateElements(elements, input.seatsLeft, input.seatsRight);
    const seatCapacity = elements.filter((e) => e.type === LayoutElementType.SEAT).length;
    const { lower, upper } = deckSeatCounts(elements);
    const layoutType = buildLayout({
        seatsLeft: input.seatsLeft,
        seatsRight: input.seatsRight,
        seatCapacity,
        bodyType,
        ...(input.hasUpperDeck !== undefined ? { hasUpperDeck: input.hasUpperDeck } : {}),
        ...deckCapacityFields(input.hasUpperDeck, input.lowerDeckCapacity, input.upperDeckCapacity),
    }).layoutType;
    return {
        layoutType,
        seatsLeft: input.seatsLeft,
        seatsRight: input.seatsRight,
        hasUpperDeck: !!input.hasUpperDeck,
        lowerDeckCapacity: input.hasUpperDeck ? lower : null,
        upperDeckCapacity: input.hasUpperDeck ? upper : null,
        seatCapacity,
        elements,
    };
}
export async function listBusLayoutVersions(busId, caller) {
    await assertBusLayoutAccess(busId, caller);
    return prisma.busLayout.findMany({
        where: { busId },
        orderBy: { version: 'desc' },
        select: {
            id: true,
            version: true,
            layoutType: true,
            seatsLeft: true,
            seatsRight: true,
            seatCapacity: true,
            createdAt: true,
            createdByUserId: true,
        },
    });
}
export async function getBusLayoutVersion(busId, layoutId, caller) {
    await assertBusLayoutAccess(busId, caller);
    const layout = await prisma.busLayout.findFirst({
        where: { id: layoutId, busId },
        include: layoutInclude,
    });
    if (!layout)
        throw new ApiError(404, 'Layout version not found');
    return layout;
}
export async function restoreBusLayoutVersion(busId, layoutId, caller) {
    await assertBusLayoutAccess(busId, caller);
    const source = await prisma.busLayout.findFirst({
        where: { id: layoutId, busId },
        include: layoutInclude,
    });
    if (!source)
        throw new ApiError(404, 'Layout version not found');
    const elements = source.elements.map((el) => ({
        type: el.type,
        deck: el.deck,
        row: el.row,
        col: el.col,
        label: el.label,
        seatNumber: el.seatNumber,
    }));
    const layout = await createLayoutVersion(busId, source.layoutType, source.seatsLeft, source.seatsRight, elements, caller.id, source.hasUpperDeck);
    return {
        message: `Restored layout as version ${layout.version}`,
        layout,
    };
}
export async function cloneLayoutSeatsToSchedule(tx, scheduleId, layoutId) {
    const seatElements = await tx.busLayoutElement.findMany({
        where: {
            layoutId,
            type: LayoutElementType.SEAT,
        },
        orderBy: [{ row: 'asc' }, { col: 'asc' }],
    });
    if (seatElements.length === 0) {
        throw new ApiError(400, 'Bus layout has no seats configured');
    }
    await tx.seat.createMany({
        data: seatElements.map((el) => ({
            scheduleId,
            seatNumber: el.seatNumber,
            row: el.row,
            col: el.col,
            deck: el.deck,
            status: SeatStatus.AVAILABLE,
        })),
    });
}
export { extractCapElements, isCapRow, LAYOUT_FRONT_ROW, LAYOUT_REAR_ROW };
//# sourceMappingURL=service.js.map