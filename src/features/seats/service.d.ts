import { SeatStatus } from "@prisma/client";
import type { AuthUser } from "../../core/middleware/auth.middleware.js";
import type { AuditContext } from "../../core/audit/requestContext.js";
type ListSeatsFilters = {
    scheduleId: number;
    status?: SeatStatus;
};
type UpdateSeatStatusInput = {
    status: SeatStatus;
};
export declare function listSeatsBySchedule(filters: ListSeatsFilters): Promise<{
    schedule: {
        id: number;
        departureTime: Date;
        arrivalTime: Date | null;
        basePrice: import("@prisma/client/runtime/library").Decimal;
        status: import(".prisma/client").$Enums.ScheduleStatus;
        route: {
            id: number;
            code: string;
            fromCity: {
                name: string;
                id: number;
                state: string | null;
                country: string | null;
                createdAt: Date;
                updatedAt: Date;
            };
            toCity: {
                name: string;
                id: number;
                state: string | null;
                country: string | null;
                createdAt: Date;
                updatedAt: Date;
            };
        };
        bus: {
            currentLayout: ({
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
            }) | null;
        } & {
            name: string;
            id: number;
            layoutType: import(".prisma/client").$Enums.BusLayoutType;
            bodyType: import(".prisma/client").$Enums.BusBodyType;
            hasAc: boolean;
            operatorId: number | null;
            registrationNo: string;
            capacity: number;
            createdAt: Date;
            currentLayoutId: number | null;
            amenities: string | null;
            updatedAt: Date;
        };
    };
    summary: {
        total: number;
        available: number;
        held: number;
        booked: number;
    };
    seats: {
        row: number | null;
        status: import(".prisma/client").$Enums.SeatStatus;
        id: number;
        deck: string | null;
        col: number | null;
        seatNumber: string;
        scheduleId: number;
        createdAt: Date;
        updatedAt: Date;
        heldUntil: Date | null;
    }[];
    layout: {
        seatsLeft: number;
        seatsRight: number;
        layoutType: import(".prisma/client").$Enums.BusLayoutType;
        version: number;
        fromSnapshot: boolean;
        hasUpperDeck: boolean;
        capElements: {
            type: import(".prisma/client").$Enums.LayoutElementType;
            deck: import(".prisma/client").$Enums.BusDeck;
            row: number;
            col: number;
            label: string | null;
        }[];
    } | null;
}>;
export declare function getSeatById(id: number): Promise<{
    schedule: {
        bus: {
            name: string;
            id: number;
            layoutType: import(".prisma/client").$Enums.BusLayoutType;
            bodyType: import(".prisma/client").$Enums.BusBodyType;
            hasAc: boolean;
            operatorId: number | null;
            registrationNo: string;
            capacity: number;
            createdAt: Date;
            currentLayoutId: number | null;
            amenities: string | null;
            updatedAt: Date;
        };
        route: {
            fromCity: {
                name: string;
                id: number;
                state: string | null;
                country: string | null;
                createdAt: Date;
                updatedAt: Date;
            };
            toCity: {
                name: string;
                id: number;
                state: string | null;
                country: string | null;
                createdAt: Date;
                updatedAt: Date;
            };
        } & {
            code: string;
            id: number;
            fromCityId: number;
            toCityId: number;
            startBusStopId: number | null;
            endBusStopId: number | null;
            distanceKm: number | null;
            durationMin: number | null;
            createdAt: Date;
            updatedAt: Date;
            estimatedDurationMinutes: number | null;
        };
    } & {
        status: import(".prisma/client").$Enums.ScheduleStatus;
        id: number;
        color: string | null;
        basePrice: import("@prisma/client/runtime/library").Decimal;
        busId: number;
        departureTime: Date;
        routeId: number;
        createdAt: Date;
        updatedAt: Date;
        arrivalTime: Date | null;
        recurrenceGroupId: string | null;
        isRecurrenceException: boolean;
        busLayoutId: number | null;
    };
    bookingSeats: ({
        booking: {
            status: import(".prisma/client").$Enums.BookingStatus;
            id: number;
            scheduleId: number;
            createdAt: Date;
            updatedAt: Date;
            userId: number;
            baseAmount: import("@prisma/client/runtime/library").Decimal;
            taxAmount: import("@prisma/client/runtime/library").Decimal;
            discountAmount: import("@prisma/client/runtime/library").Decimal;
            commissionRate: import("@prisma/client/runtime/library").Decimal;
            commissionAmount: import("@prisma/client/runtime/library").Decimal;
            totalAmount: import("@prisma/client/runtime/library").Decimal;
            boardingPoint: string | null;
            droppingPoint: string | null;
            paymentStatus: import(".prisma/client").$Enums.PaymentStatus;
            bookedAt: Date;
            holdExpiresAt: Date | null;
            expiredAt: Date | null;
            cancelledAt: Date | null;
            cancellationReason: string | null;
        };
    } & {
        id: number;
        createdAt: Date;
        bookingId: number;
        seatId: number;
    })[];
} & {
    row: number | null;
    status: import(".prisma/client").$Enums.SeatStatus;
    id: number;
    deck: string | null;
    col: number | null;
    seatNumber: string;
    scheduleId: number;
    createdAt: Date;
    updatedAt: Date;
    heldUntil: Date | null;
}>;
export declare function updateSeatStatus(id: number, input: UpdateSeatStatusInput, caller: AuthUser, audit?: AuditContext): Promise<{
    schedule: {
        bus: {
            name: string;
            id: number;
            layoutType: import(".prisma/client").$Enums.BusLayoutType;
            bodyType: import(".prisma/client").$Enums.BusBodyType;
            hasAc: boolean;
            operatorId: number | null;
            registrationNo: string;
            capacity: number;
            createdAt: Date;
            currentLayoutId: number | null;
            amenities: string | null;
            updatedAt: Date;
        };
        route: {
            fromCity: {
                name: string;
                id: number;
                state: string | null;
                country: string | null;
                createdAt: Date;
                updatedAt: Date;
            };
            toCity: {
                name: string;
                id: number;
                state: string | null;
                country: string | null;
                createdAt: Date;
                updatedAt: Date;
            };
        } & {
            code: string;
            id: number;
            fromCityId: number;
            toCityId: number;
            startBusStopId: number | null;
            endBusStopId: number | null;
            distanceKm: number | null;
            durationMin: number | null;
            createdAt: Date;
            updatedAt: Date;
            estimatedDurationMinutes: number | null;
        };
    } & {
        status: import(".prisma/client").$Enums.ScheduleStatus;
        id: number;
        color: string | null;
        basePrice: import("@prisma/client/runtime/library").Decimal;
        busId: number;
        departureTime: Date;
        routeId: number;
        createdAt: Date;
        updatedAt: Date;
        arrivalTime: Date | null;
        recurrenceGroupId: string | null;
        isRecurrenceException: boolean;
        busLayoutId: number | null;
    };
} & {
    row: number | null;
    status: import(".prisma/client").$Enums.SeatStatus;
    id: number;
    deck: string | null;
    col: number | null;
    seatNumber: string;
    scheduleId: number;
    createdAt: Date;
    updatedAt: Date;
    heldUntil: Date | null;
}>;
export {};
//# sourceMappingURL=service.d.ts.map