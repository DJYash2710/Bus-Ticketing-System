export const AISLE_WIDTH = 1;
export const MIN_SEATS_PER_SIDE = 1;
export const MAX_SEATS_PER_SIDE = 5;
export const LAYOUT_FRONT_ROW = 1000;
export const LAYOUT_REAR_ROW = 1001;
export const CAP_TYPES = [
    'DRIVER',
    'EXIT_FRONT',
    'EXIT_REAR',
    'EXIT_FIRE',
    'WASHROOM',
    'ENGINE',
];
export const AISLE_CAP_TYPES = ['ROOF_EXIT'];
export function gridWidth(seatsLeft, seatsRight) {
    return seatsLeft + AISLE_WIDTH + seatsRight;
}
export function seatColumnLayout(seatsLeft, seatsRight) {
    const leftCols = Array.from({ length: seatsLeft }, (_, i) => i);
    const aisleCols = Array.from({ length: AISLE_WIDTH }, (_, i) => seatsLeft + i);
    const rightStart = seatsLeft + AISLE_WIDTH;
    const rightCols = Array.from({ length: seatsRight }, (_, i) => rightStart + i);
    return {
        leftCols,
        rightCols,
        aisleCols,
        gridWidth: gridWidth(seatsLeft, seatsRight),
    };
}
export function validateSeatGeometry(seatsLeft, seatsRight) {
    if (seatsLeft < MIN_SEATS_PER_SIDE ||
        seatsLeft > MAX_SEATS_PER_SIDE ||
        seatsRight < MIN_SEATS_PER_SIDE ||
        seatsRight > MAX_SEATS_PER_SIDE) {
        throw new Error(`seatsLeft and seatsRight must each be between ${MIN_SEATS_PER_SIDE} and ${MAX_SEATS_PER_SIDE}`);
    }
}
export function inferSeatsFromLayoutType(layoutType) {
    switch (layoutType) {
        case 'SEATER_2_1':
            return { seatsLeft: 2, seatsRight: 1 };
        case 'SLEEPER_1_1':
            return { seatsLeft: 1, seatsRight: 1 };
        case 'SEATER_2_2':
        default:
            return { seatsLeft: 2, seatsRight: 2 };
    }
}
export function inferLayoutType(seatsLeft, seatsRight, bodyType) {
    if (bodyType === 'SLEEPER' && seatsLeft === 1 && seatsRight === 1) {
        return 'SLEEPER_1_1';
    }
    if (seatsLeft === 2 && seatsRight === 1) {
        return 'SEATER_2_1';
    }
    if (seatsLeft === 2 && seatsRight === 2) {
        return 'SEATER_2_2';
    }
    // Custom geometries (3+2, 1+4, etc.) store closest seater preset for enum compatibility.
    return 'SEATER_2_2';
}
export function isCapRow(row) {
    return row === LAYOUT_FRONT_ROW || row === LAYOUT_REAR_ROW;
}
export function isAisleCapType(type) {
    return AISLE_CAP_TYPES.includes(type);
}
export function isFixedCapType(type) {
    return CAP_TYPES.includes(type);
}
export function allGridCols(seatsLeft, seatsRight) {
    const width = gridWidth(seatsLeft, seatsRight);
    return Array.from({ length: width }, (_, i) => i);
}
export function standardSeatCols(seatsLeft, seatsRight) {
    const { leftCols, rightCols } = seatColumnLayout(seatsLeft, seatsRight);
    return [...leftCols, ...rightCols];
}
export function isValidSeatCol(col, _rowSeatCols, seatsLeft, seatsRight) {
    return standardSeatCols(seatsLeft, seatsRight).includes(col);
}
export function isLeftCol(col, seatsLeft) {
    return col < seatsLeft;
}
export function isRightCol(col, seatsLeft, seatsRight) {
    const { rightCols } = seatColumnLayout(seatsLeft, seatsRight);
    return rightCols.includes(col);
}
export function isAisleCol(col, seatsLeft, seatsRight) {
    const { aisleCols } = seatColumnLayout(seatsLeft, seatsRight);
    return aisleCols.includes(col);
}
/** Remap cap columns that fall outside the grid after a geometry change. */
export function normalizeCapCol(type, col, seatsLeft, seatsRight) {
    const maxCol = gridWidth(seatsLeft, seatsRight) - 1;
    const { aisleCols, rightCols } = seatColumnLayout(seatsLeft, seatsRight);
    const aisleCol = aisleCols[0] ?? seatsLeft;
    const farRight = rightCols[rightCols.length - 1] ?? maxCol;
    if (col >= 0 && col <= maxCol)
        return col;
    if (isAisleCapType(type))
        return aisleCol;
    if (type === 'EXIT_FRONT' || type === 'EXIT_REAR')
        return farRight;
    if (type === 'DRIVER' || type === 'EXIT_FIRE')
        return 0;
    if (type === 'WASHROOM')
        return aisleCol;
    if (col > maxCol)
        return farRight;
    return 0;
}
export function normalizeCapElements(elements, seatsLeft, seatsRight) {
    return elements.map((el) => {
        if (el.type === 'SEAT')
            return el;
        const col = normalizeCapCol(el.type, el.col, seatsLeft, seatsRight);
        return col === el.col ? el : { ...el, col };
    });
}
export function capRowForType(type) {
    switch (type) {
        case 'DRIVER':
        case 'EXIT_FRONT':
            return LAYOUT_FRONT_ROW;
        default:
            return LAYOUT_REAR_ROW;
    }
}
export function defaultLabelForCap(type) {
    switch (type) {
        case 'DRIVER':
            return 'Driver';
        case 'EXIT_FRONT':
            return 'Front Exit';
        case 'EXIT_REAR':
            return 'Rear Exit';
        case 'EXIT_FIRE':
            return 'Fire Exit';
        case 'WASHROOM':
            return 'Washroom';
        case 'ENGINE':
            return 'Engine';
        case 'ROOF_EXIT':
            return 'Roof exit';
        default:
            return type;
    }
}
/** Remap legacy 4-wide packed columns to aisle-centered grid. */
export function migrateLegacySeatCol(col, seatsLeft, seatsRight) {
    const legacyRightStart = 4 - seatsRight;
    if (col < seatsLeft)
        return col;
    if (col >= legacyRightStart) {
        return seatsLeft + AISLE_WIDTH + (col - legacyRightStart);
    }
    return col;
}
//# sourceMappingURL=geometry.js.map