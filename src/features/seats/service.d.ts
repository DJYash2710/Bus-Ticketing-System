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
                state: string | null;
                id: number;
                name: string;
                country: string | null;
                createdAt: Date;
                updatedAt: Date;
            };
            toCity: {
                state: string | null;
                id: number;
                name: string;
                country: string | null;
                createdAt: Date;
                updatedAt: Date;
            };
        };
        bus: {
            type: import(".prisma/client").$Enums.BusType;
            id: number;
            name: string;
            operatorId: number | null;
            registrationNo: string;
            capacity: number;
            createdAt: Date;
            updatedAt: Date;
            amenities: string | null;
        };
    };
    summary: {
        total: number;
        available: number;
        held: number;
        booked: number;
    };
    seats: {
        id: number;
        status: import(".prisma/client").$Enums.SeatStatus;
        scheduleId: number;
        createdAt: Date;
        updatedAt: Date;
        seatNumber: string;
        row: number | null;
        col: number | null;
        deck: string | null;
        heldUntil: Date | null;
    }[];
}>;
export declare function getSeatById(id: number): Promise<{
    schedule: {
        route: {
            fromCity: {
                state: string | null;
                id: number;
                name: string;
                country: string | null;
                createdAt: Date;
                updatedAt: Date;
            };
            toCity: {
                state: string | null;
                id: number;
                name: string;
                country: string | null;
                createdAt: Date;
                updatedAt: Date;
            };
        } & {
            id: number;
            code: string;
            fromCityId: number;
            toCityId: number;
            distanceKm: number | null;
            durationMin: number | null;
            createdAt: Date;
            updatedAt: Date;
            estimatedDurationMinutes: number | null;
        };
        bus: {
            type: import(".prisma/client").$Enums.BusType;
            id: number;
            name: string;
            operatorId: number | null;
            registrationNo: string;
            capacity: number;
            createdAt: Date;
            updatedAt: Date;
            amenities: string | null;
        };
    } & {
        color: string | null;
        id: number;
        basePrice: import("@prisma/client/runtime/library").Decimal;
        status: import(".prisma/client").$Enums.ScheduleStatus;
        departureTime: Date;
        busId: number;
        routeId: number;
        createdAt: Date;
        updatedAt: Date;
        arrivalTime: Date | null;
        recurrenceGroupId: string | null;
        isRecurrenceException: boolean;
    };
    bookingSeats: ({
        booking: {
            id: number;
            status: import(".prisma/client").$Enums.BookingStatus;
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
    id: number;
    status: import(".prisma/client").$Enums.SeatStatus;
    scheduleId: number;
    createdAt: Date;
    updatedAt: Date;
    seatNumber: string;
    row: number | null;
    col: number | null;
    deck: string | null;
    heldUntil: Date | null;
}>;
export declare function updateSeatStatus(id: number, input: UpdateSeatStatusInput, caller: AuthUser, audit?: AuditContext): Promise<{
    schedule: {
        route: {
            fromCity: {
                state: string | null;
                id: number;
                name: string;
                country: string | null;
                createdAt: Date;
                updatedAt: Date;
            };
            toCity: {
                state: string | null;
                id: number;
                name: string;
                country: string | null;
                createdAt: Date;
                updatedAt: Date;
            };
        } & {
            id: number;
            code: string;
            fromCityId: number;
            toCityId: number;
            distanceKm: number | null;
            durationMin: number | null;
            createdAt: Date;
            updatedAt: Date;
            estimatedDurationMinutes: number | null;
        };
        bus: {
            type: import(".prisma/client").$Enums.BusType;
            id: number;
            name: string;
            operatorId: number | null;
            registrationNo: string;
            capacity: number;
            createdAt: Date;
            updatedAt: Date;
            amenities: string | null;
        };
    } & {
        color: string | null;
        id: number;
        basePrice: import("@prisma/client/runtime/library").Decimal;
        status: import(".prisma/client").$Enums.ScheduleStatus;
        departureTime: Date;
        busId: number;
        routeId: number;
        createdAt: Date;
        updatedAt: Date;
        arrivalTime: Date | null;
        recurrenceGroupId: string | null;
        isRecurrenceException: boolean;
    };
} & {
    id: number;
    status: import(".prisma/client").$Enums.SeatStatus;
    scheduleId: number;
    createdAt: Date;
    updatedAt: Date;
    seatNumber: string;
    row: number | null;
    col: number | null;
    deck: string | null;
    heldUntil: Date | null;
}>;
export {};
//# sourceMappingURL=service.d.ts.map