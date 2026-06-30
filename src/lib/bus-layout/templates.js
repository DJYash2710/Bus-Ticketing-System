import { BusDeck, BusLayoutType, LayoutElementType } from '@prisma/client';
import { capRowForType, defaultLabelForCap, inferLayoutType, isAisleCapType, isFixedCapType, LAYOUT_FRONT_ROW, LAYOUT_REAR_ROW, seatColumnLayout, standardSeatCols, } from './geometry.js';
const SEAT_LETTERS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
function seatLetter(index) {
    return SEAT_LETTERS[index] ?? String.fromCharCode(65 + index);
}
function defaultCapPlacement(seatsLeft, seatsRight, includeWashroom) {
    const { rightCols } = seatColumnLayout(seatsLeft, seatsRight);
    const farRight = rightCols[rightCols.length - 1] ?? 3;
    const caps = {
        DRIVER: { row: LAYOUT_FRONT_ROW, col: 0 },
        EXIT_FRONT: { row: LAYOUT_FRONT_ROW, col: farRight },
        EXIT_FIRE: { row: LAYOUT_REAR_ROW, col: 0 },
        EXIT_REAR: { row: LAYOUT_REAR_ROW, col: farRight },
    };
    if (includeWashroom) {
        const { aisleCols } = seatColumnLayout(seatsLeft, seatsRight);
        caps.WASHROOM = { row: LAYOUT_REAR_ROW, col: aisleCols[0] ?? seatsLeft };
    }
    return caps;
}
function capElementsFromPlacement(caps) {
    return Object.entries(caps)
        .map(([type, pos]) => ({
        type: type,
        deck: BusDeck.LOWER,
        row: pos.row,
        col: pos.col,
        label: defaultLabelForCap(type),
        seatNumber: null,
    }));
}
function seatNumberForPosition(row, col, seatsLeft, seatsRight, bodyType, deck = BusDeck.LOWER, hasUpperDeck = false) {
    const { leftCols, rightCols } = seatColumnLayout(seatsLeft, seatsRight);
    if (bodyType === 'SLEEPER') {
        if (hasUpperDeck) {
            if (deck === BusDeck.UPPER) {
                if (col === leftCols[0])
                    return `U${row + 1}`;
                if (col === rightCols[0])
                    return `U${row + 1}R`;
                return `U${row + 1}`;
            }
            if (col === leftCols[0])
                return `L${row + 1}`;
            if (col === rightCols[0])
                return `L${row + 1}R`;
            return `L${row + 1}`;
        }
        if (col === leftCols[0])
            return `L${row + 1}`;
        if (col === rightCols[0])
            return `U${row + 1}`;
        return `${row + 1}`;
    }
    const leftIndex = leftCols.indexOf(col);
    if (leftIndex >= 0) {
        const num = `${row + 1}${seatLetter(leftIndex)}`;
        return deck === BusDeck.UPPER ? `U${num}` : num;
    }
    const rightIndex = rightCols.indexOf(col);
    if (rightIndex >= 0) {
        const letterIndex = seatsLeft + rightIndex;
        const num = `${row + 1}${seatLetter(letterIndex)}`;
        return deck === BusDeck.UPPER ? `U${num}` : num;
    }
    const fallback = `${row + 1}`;
    return deck === BusDeck.UPPER ? `U${fallback}` : fallback;
}
function generateSeatElementsForDeck(config, deck, capacity) {
    const cols = standardSeatCols(config.seatsLeft, config.seatsRight);
    const seats = [];
    if (capacity <= 0)
        return seats;
    let row = 0;
    let count = 0;
    while (count < capacity) {
        for (const col of cols) {
            if (count >= capacity)
                break;
            const seatNumber = seatNumberForPosition(row, col, config.seatsLeft, config.seatsRight, config.bodyType, deck, !!config.hasUpperDeck);
            seats.push({
                type: LayoutElementType.SEAT,
                deck,
                row,
                col,
                label: seatNumber,
                seatNumber,
            });
            count++;
        }
        row++;
    }
    return seats;
}
function resolveDeckCapacities(config) {
    const total = config.seatCapacity;
    if (!config.hasUpperDeck) {
        return { lower: total, upper: 0 };
    }
    if (config.lowerDeckCapacity != null &&
        config.upperDeckCapacity != null) {
        return {
            lower: config.lowerDeckCapacity,
            upper: config.upperDeckCapacity,
        };
    }
    if (config.lowerDeckCapacity != null) {
        return {
            lower: config.lowerDeckCapacity,
            upper: Math.max(0, total - config.lowerDeckCapacity),
        };
    }
    if (config.upperDeckCapacity != null) {
        return {
            lower: Math.max(0, total - config.upperDeckCapacity),
            upper: config.upperDeckCapacity,
        };
    }
    const lower = Math.ceil(total / 2);
    return { lower, upper: total - lower };
}
function generateSeatElements(config) {
    if (!config.hasUpperDeck) {
        return generateSeatElementsForDeck(config, BusDeck.LOWER, config.seatCapacity);
    }
    const { lower, upper } = resolveDeckCapacities(config);
    return [
        ...generateSeatElementsForDeck(config, BusDeck.LOWER, lower),
        ...generateSeatElementsForDeck(config, BusDeck.UPPER, upper),
    ];
}
export function extractCapPlacement(elements) {
    const caps = {};
    for (const el of elements) {
        if (el.type === LayoutElementType.SEAT || isAisleCapType(el.type))
            continue;
        caps[el.type] = { row: el.row, col: el.col };
    }
    return caps;
}
export function extractAisleCapElements(elements) {
    return elements.filter((el) => el.type !== LayoutElementType.SEAT && isAisleCapType(el.type));
}
export function extractCapElements(elements) {
    return elements.filter((el) => el.type !== LayoutElementType.SEAT && isFixedCapType(el.type));
}
export function extractPreservedCapElements(elements) {
    return elements.filter((el) => el.type !== LayoutElementType.SEAT &&
        (isFixedCapType(el.type) || isAisleCapType(el.type)));
}
export function buildLayout(config) {
    const includeWashroom = config.includeWashroom ??
        (config.caps?.WASHROOM != null ||
            config.seatCapacity >= 32 ||
            config.bodyType === 'SLEEPER' ||
            config.bodyType === 'SEMI_SLEEPER');
    const caps = config.caps ??
        defaultCapPlacement(config.seatsLeft, config.seatsRight, includeWashroom);
    const capEls = capElementsFromPlacement(caps);
    const aisleCapEls = config.aisleCaps ?? [];
    const seatEls = generateSeatElements(config);
    const layoutType = inferLayoutType(config.seatsLeft, config.seatsRight, config.bodyType);
    const { lower, upper } = config.hasUpperDeck
        ? resolveDeckCapacities(config)
        : { lower: seatEls.length, upper: 0 };
    return {
        layoutType,
        seatsLeft: config.seatsLeft,
        seatsRight: config.seatsRight,
        hasUpperDeck: !!config.hasUpperDeck,
        lowerDeckCapacity: config.hasUpperDeck ? lower : null,
        upperDeckCapacity: config.hasUpperDeck ? upper : null,
        seatCapacity: seatEls.length,
        elements: [...capEls, ...aisleCapEls, ...seatEls],
    };
}
export function regenerateLayoutElements(capElements, config) {
    const caps = extractCapPlacement(capElements);
    const aisleCaps = extractAisleCapElements(capElements);
    return buildLayout({ ...config, caps, aisleCaps }).elements;
}
export function defaultLayoutTypeForBody(bodyType) {
    switch (bodyType) {
        case 'SLEEPER':
            return BusLayoutType.SLEEPER_1_1;
        case 'SEMI_SLEEPER':
            return BusLayoutType.SEATER_2_1;
        default:
            return BusLayoutType.SEATER_2_2;
    }
}
export function layoutConfigFromTemplate(layoutType, seatCapacity, bodyType = 'SEATER') {
    switch (layoutType) {
        case BusLayoutType.SEATER_2_1:
            return {
                seatsLeft: 2,
                seatsRight: 1,
                seatCapacity,
                bodyType,
            };
        case BusLayoutType.SLEEPER_1_1:
            return {
                seatsLeft: 1,
                seatsRight: 1,
                seatCapacity,
                bodyType: 'SLEEPER',
            };
        case BusLayoutType.SEATER_2_2:
        default:
            return {
                seatsLeft: 2,
                seatsRight: 2,
                seatCapacity,
                bodyType,
            };
    }
}
export function generateLayoutFromTemplate(layoutType, seatCapacity, bodyType = 'SEATER') {
    return buildLayout(layoutConfigFromTemplate(layoutType, seatCapacity, bodyType));
}
export { capRowForType, defaultLabelForCap };
//# sourceMappingURL=templates.js.map