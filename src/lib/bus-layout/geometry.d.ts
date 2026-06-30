export declare const AISLE_WIDTH = 1;
export declare const MIN_SEATS_PER_SIDE = 1;
export declare const MAX_SEATS_PER_SIDE = 5;
export declare const LAYOUT_FRONT_ROW = 1000;
export declare const LAYOUT_REAR_ROW = 1001;
export declare const CAP_TYPES: readonly ["DRIVER", "EXIT_FRONT", "EXIT_REAR", "EXIT_FIRE", "WASHROOM", "ENGINE"];
export declare const AISLE_CAP_TYPES: readonly ["ROOF_EXIT"];
export type CapElementType = (typeof CAP_TYPES)[number];
export type AisleCapElementType = (typeof AISLE_CAP_TYPES)[number];
export type SeatColumnLayout = {
    leftCols: number[];
    rightCols: number[];
    aisleCols: number[];
    gridWidth: number;
};
export declare function gridWidth(seatsLeft: number, seatsRight: number): number;
export declare function seatColumnLayout(seatsLeft: number, seatsRight: number): SeatColumnLayout;
export declare function validateSeatGeometry(seatsLeft: number, seatsRight: number): void;
export declare function inferSeatsFromLayoutType(layoutType: string): {
    seatsLeft: number;
    seatsRight: number;
};
export declare function inferLayoutType(seatsLeft: number, seatsRight: number, bodyType: 'SEATER' | 'SLEEPER' | 'SEMI_SLEEPER'): 'SEATER_2_2' | 'SEATER_2_1' | 'SLEEPER_1_1';
export declare function isCapRow(row: number): row is 1000 | 1001;
export declare function isAisleCapType(type: string): boolean;
export declare function isFixedCapType(type: string): boolean;
export declare function allGridCols(seatsLeft: number, seatsRight: number): number[];
export declare function isLeftCol(col: number, seatsLeft: number): boolean;
export declare function isRightCol(col: number, seatsLeft: number, seatsRight: number): boolean;
export declare function isAisleCol(col: number, seatsLeft: number, seatsRight: number): boolean;
export declare function capRowForType(type: CapElementType): number;
export declare function defaultLabelForCap(type: CapElementType | AisleCapElementType): string;
/** Remap legacy 4-wide packed columns to aisle-centered grid. */
export declare function migrateLegacySeatCol(col: number, seatsLeft: number, seatsRight: number): number;
//# sourceMappingURL=geometry.d.ts.map