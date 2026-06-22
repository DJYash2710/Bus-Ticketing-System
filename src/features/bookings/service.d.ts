type CreateBookingInput = {
    userId: number;
    scheduleId: number;
    seatNumbers: string[];
    boardingPoint: string;
    droppingPoint: string;
    couponCode?: string;
    creditsToRedeem?: number;
};
export declare function createBooking(input: CreateBookingInput): Promise<({
    user: {
        id: number;
        name: string;
        email: string;
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
        };
    } & {
        id: number;
        createdAt: Date;
        bookingId: number;
        seatId: number;
    })[];
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
        id: number;
        status: import(".prisma/client").$Enums.ScheduleStatus;
        routeId: number;
        busId: number;
        departureTime: Date;
        arrivalTime: Date | null;
        basePrice: import("@prisma/client/runtime/library").Decimal;
        createdAt: Date;
        updatedAt: Date;
    };
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
    cancelledAt: Date | null;
}) | null>;
export declare function getBookingById(bookingId: number, userId: number): Promise<{
    user: {
        id: number;
        name: string;
        email: string;
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
        };
    } & {
        id: number;
        createdAt: Date;
        bookingId: number;
        seatId: number;
    })[];
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
        id: number;
        status: import(".prisma/client").$Enums.ScheduleStatus;
        routeId: number;
        busId: number;
        departureTime: Date;
        arrivalTime: Date | null;
        basePrice: import("@prisma/client/runtime/library").Decimal;
        createdAt: Date;
        updatedAt: Date;
    };
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
    cancelledAt: Date | null;
}>;
export declare function getMyBookings(userId: number): Promise<({
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
        };
    } & {
        id: number;
        createdAt: Date;
        bookingId: number;
        seatId: number;
    })[];
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
        id: number;
        status: import(".prisma/client").$Enums.ScheduleStatus;
        routeId: number;
        busId: number;
        departureTime: Date;
        arrivalTime: Date | null;
        basePrice: import("@prisma/client/runtime/library").Decimal;
        createdAt: Date;
        updatedAt: Date;
    };
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
    cancelledAt: Date | null;
})[]>;
export declare function cancelBooking(bookingId: number, userId: number): Promise<({
    user: {
        id: number;
        name: string;
        email: string;
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
        };
    } & {
        id: number;
        createdAt: Date;
        bookingId: number;
        seatId: number;
    })[];
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
        id: number;
        status: import(".prisma/client").$Enums.ScheduleStatus;
        routeId: number;
        busId: number;
        departureTime: Date;
        arrivalTime: Date | null;
        basePrice: import("@prisma/client/runtime/library").Decimal;
        createdAt: Date;
        updatedAt: Date;
    };
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
    cancelledAt: Date | null;
}) | null>;
export declare function getOperatorBookings(busOperatorId: number): Promise<({
    user: {
        id: number;
        name: string;
        email: string;
        phone: string | null;
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
        };
    } & {
        id: number;
        createdAt: Date;
        bookingId: number;
        seatId: number;
    })[];
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
        id: number;
        status: import(".prisma/client").$Enums.ScheduleStatus;
        routeId: number;
        busId: number;
        departureTime: Date;
        arrivalTime: Date | null;
        basePrice: import("@prisma/client/runtime/library").Decimal;
        createdAt: Date;
        updatedAt: Date;
    };
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
    cancelledAt: Date | null;
})[]>;
export {};
//# sourceMappingURL=service.d.ts.map