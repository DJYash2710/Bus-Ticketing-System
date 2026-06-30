import { BusBodyType, BusLayoutType, Prisma } from '@prisma/client';
import type { AuthUser } from '../../core/middleware/auth.middleware.js';
import { isCapRow, LAYOUT_FRONT_ROW, LAYOUT_REAR_ROW } from '../../lib/bus-layout/geometry.js';
import { extractCapElements } from '../../lib/bus-layout/templates.js';
import type { LayoutElementInput } from '../../lib/bus-layout/types.js';
type SaveLayoutInput = {
    layoutType: BusLayoutType;
    seatsLeft: number;
    seatsRight: number;
    hasUpperDeck?: boolean;
    elements: LayoutElementInput[];
    hasAc?: boolean;
    bodyType?: BusBodyType;
};
type RegenerateInput = {
    seatsLeft: number;
    seatsRight: number;
    seatCapacity: number;
    hasUpperDeck?: boolean;
    lowerDeckCapacity?: number;
    upperDeckCapacity?: number;
    capElements: LayoutElementInput[];
    bodyType?: BusBodyType;
};
export declare function createInitialLayoutForBus(busId: number, layoutType: BusLayoutType, seatCapacity: number, createdByUserId?: number, bodyType?: BusBodyType): Promise<{
    elements: {
        row: number;
        id: number;
        type: import(".prisma/client").$Enums.LayoutElementType;
        label: string | null;
        deck: import(".prisma/client").$Enums.BusDeck;
        col: number;
        seatNumber: string | null;
        layoutId: number;
    }[];
} & {
    id: number;
    version: number;
    hasUpperDeck: boolean;
    busId: number;
    layoutType: import(".prisma/client").$Enums.BusLayoutType;
    seatsLeft: number;
    seatsRight: number;
    seatCapacity: number;
    lowerDeckCapacity: number | null;
    upperDeckCapacity: number | null;
    createdByUserId: number | null;
    createdAt: Date;
}>;
export declare function getCurrentBusLayout(busId: number, caller: AuthUser): Promise<{
    bus: {
        id: number;
        name: string;
        bodyType: import(".prisma/client").$Enums.BusBodyType;
        layoutType: import(".prisma/client").$Enums.BusLayoutType;
        hasAc: boolean;
        capacity: number;
    };
    layout: {
        seatsLeft: number;
        seatsRight: number;
        elements: {
            row: number;
            id: number;
            type: import(".prisma/client").$Enums.LayoutElementType;
            label: string | null;
            deck: import(".prisma/client").$Enums.BusDeck;
            col: number;
            seatNumber: string | null;
            layoutId: number;
        }[];
        id: number;
        version: number;
        hasUpperDeck: boolean;
        busId: number;
        layoutType: import(".prisma/client").$Enums.BusLayoutType;
        seatCapacity: number;
        lowerDeckCapacity: number | null;
        upperDeckCapacity: number | null;
        createdByUserId: number | null;
        createdAt: Date;
    };
}>;
export declare function saveBusLayout(busId: number, input: SaveLayoutInput, caller: AuthUser): Promise<{
    message: string;
    layout: {
        elements: {
            row: number;
            id: number;
            type: import(".prisma/client").$Enums.LayoutElementType;
            label: string | null;
            deck: import(".prisma/client").$Enums.BusDeck;
            col: number;
            seatNumber: string | null;
            layoutId: number;
        }[];
    } & {
        id: number;
        version: number;
        hasUpperDeck: boolean;
        busId: number;
        layoutType: import(".prisma/client").$Enums.BusLayoutType;
        seatsLeft: number;
        seatsRight: number;
        seatCapacity: number;
        lowerDeckCapacity: number | null;
        upperDeckCapacity: number | null;
        createdByUserId: number | null;
        createdAt: Date;
    };
}>;
export declare function applyBusLayoutTemplate(busId: number, input: {
    layoutType: BusLayoutType;
    seatCapacity?: number;
    seatsLeft?: number;
    seatsRight?: number;
    hasUpperDeck?: boolean;
    lowerDeckCapacity?: number;
    upperDeckCapacity?: number;
    hasAc?: boolean;
    bodyType?: BusBodyType;
}, caller: AuthUser): Promise<{
    message: string;
    layout: {
        elements: {
            row: number;
            id: number;
            type: import(".prisma/client").$Enums.LayoutElementType;
            label: string | null;
            deck: import(".prisma/client").$Enums.BusDeck;
            col: number;
            seatNumber: string | null;
            layoutId: number;
        }[];
    } & {
        id: number;
        version: number;
        hasUpperDeck: boolean;
        busId: number;
        layoutType: import(".prisma/client").$Enums.BusLayoutType;
        seatsLeft: number;
        seatsRight: number;
        seatCapacity: number;
        lowerDeckCapacity: number | null;
        upperDeckCapacity: number | null;
        createdByUserId: number | null;
        createdAt: Date;
    };
}>;
export declare function regenerateBusLayoutPreview(busId: number, input: RegenerateInput, caller: AuthUser): Promise<{
    layoutType: import(".prisma/client").$Enums.BusLayoutType;
    seatsLeft: number;
    seatsRight: number;
    hasUpperDeck: boolean;
    lowerDeckCapacity: number | null;
    upperDeckCapacity: number | null;
    seatCapacity: number;
    elements: LayoutElementInput[];
}>;
export declare function listBusLayoutVersions(busId: number, caller: AuthUser): Promise<{
    id: number;
    version: number;
    layoutType: import(".prisma/client").$Enums.BusLayoutType;
    seatsLeft: number;
    seatsRight: number;
    seatCapacity: number;
    createdByUserId: number | null;
    createdAt: Date;
}[]>;
export declare function getBusLayoutVersion(busId: number, layoutId: number, caller: AuthUser): Promise<{
    elements: {
        row: number;
        id: number;
        type: import(".prisma/client").$Enums.LayoutElementType;
        label: string | null;
        deck: import(".prisma/client").$Enums.BusDeck;
        col: number;
        seatNumber: string | null;
        layoutId: number;
    }[];
} & {
    id: number;
    version: number;
    hasUpperDeck: boolean;
    busId: number;
    layoutType: import(".prisma/client").$Enums.BusLayoutType;
    seatsLeft: number;
    seatsRight: number;
    seatCapacity: number;
    lowerDeckCapacity: number | null;
    upperDeckCapacity: number | null;
    createdByUserId: number | null;
    createdAt: Date;
}>;
export declare function restoreBusLayoutVersion(busId: number, layoutId: number, caller: AuthUser): Promise<{
    message: string;
    layout: {
        elements: {
            row: number;
            id: number;
            type: import(".prisma/client").$Enums.LayoutElementType;
            label: string | null;
            deck: import(".prisma/client").$Enums.BusDeck;
            col: number;
            seatNumber: string | null;
            layoutId: number;
        }[];
    } & {
        id: number;
        version: number;
        hasUpperDeck: boolean;
        busId: number;
        layoutType: import(".prisma/client").$Enums.BusLayoutType;
        seatsLeft: number;
        seatsRight: number;
        seatCapacity: number;
        lowerDeckCapacity: number | null;
        upperDeckCapacity: number | null;
        createdByUserId: number | null;
        createdAt: Date;
    };
}>;
export declare function cloneLayoutSeatsToSchedule(tx: Prisma.TransactionClient, scheduleId: number, layoutId: number): Promise<void>;
export { extractCapElements, isCapRow, LAYOUT_FRONT_ROW, LAYOUT_REAR_ROW };
//# sourceMappingURL=service.d.ts.map