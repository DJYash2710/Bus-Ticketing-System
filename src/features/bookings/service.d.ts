import type { AuditContext } from "../../core/audit/requestContext.js";
type CreateBookingInput = {
    userId: number;
    scheduleId: number;
    seatNumbers: string[];
    boardingPoint: string;
    droppingPoint: string;
    couponCode?: string;
    creditsToRedeem?: number;
};
export declare function createBooking(input: CreateBookingInput, audit?: AuditContext): Promise<({
    user: {
        id: number;
        name: string;
        email: string;
    };
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
    seats: ({
        seat: {
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
        };
    } & {
        id: number;
        createdAt: Date;
        bookingId: number;
        seatId: number;
    })[];
} & {
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
}) | null>;
export declare function getBookingById(bookingId: number, userId: number): Promise<{
    user: {
        id: number;
        name: string;
        email: string;
    };
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
    seats: ({
        seat: {
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
        };
    } & {
        id: number;
        createdAt: Date;
        bookingId: number;
        seatId: number;
    })[];
} & {
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
}>;
export declare function getMyBookings(userId: number): Promise<({
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
    seats: ({
        seat: {
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
        };
    } & {
        id: number;
        createdAt: Date;
        bookingId: number;
        seatId: number;
    })[];
} & {
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
})[]>;
export declare function cancelBooking(bookingId: number, userId: number, audit?: AuditContext): Promise<({
    user: {
        id: number;
        name: string;
        email: string;
    };
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
    seats: ({
        seat: {
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
        };
    } & {
        id: number;
        createdAt: Date;
        bookingId: number;
        seatId: number;
    })[];
} & {
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
}) | null>;
export declare function getOperatorBookings(busOperatorId: number): Promise<({
    user: {
        id: number;
        name: string;
        email: string;
        phone: string | null;
    };
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
    seats: ({
        seat: {
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
        };
    } & {
        id: number;
        createdAt: Date;
        bookingId: number;
        seatId: number;
    })[];
} & {
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
})[]>;
export {};
//# sourceMappingURL=service.d.ts.map