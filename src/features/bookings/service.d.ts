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
        name: string;
        email: string;
        id: number;
    };
    seats: ({
        seat: {
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
        };
    } & {
        id: number;
        createdAt: Date;
        bookingId: number;
        seatId: number;
    })[];
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
}) | null>;
export declare function getBookingById(bookingId: number, userId: number): Promise<{
    user: {
        name: string;
        email: string;
        id: number;
    };
    seats: ({
        seat: {
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
        };
    } & {
        id: number;
        createdAt: Date;
        bookingId: number;
        seatId: number;
    })[];
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
}>;
export declare function getMyBookings(userId: number): Promise<({
    seats: ({
        seat: {
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
        };
    } & {
        id: number;
        createdAt: Date;
        bookingId: number;
        seatId: number;
    })[];
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
})[]>;
export declare function cancelBooking(bookingId: number, userId: number, audit?: AuditContext): Promise<({
    user: {
        name: string;
        email: string;
        id: number;
    };
    seats: ({
        seat: {
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
        };
    } & {
        id: number;
        createdAt: Date;
        bookingId: number;
        seatId: number;
    })[];
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
}) | null>;
export declare function getOperatorBookings(busOperatorId: number): Promise<({
    user: {
        name: string;
        email: string;
        id: number;
        phone: string | null;
    };
    seats: ({
        seat: {
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
        };
    } & {
        id: number;
        createdAt: Date;
        bookingId: number;
        seatId: number;
    })[];
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
})[]>;
export {};
//# sourceMappingURL=service.d.ts.map