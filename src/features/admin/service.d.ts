import { BookingStatus, PaymentStatus, Prisma } from "@prisma/client";
type ListAdminBookingsInput = {
    status?: BookingStatus;
    paymentStatus?: PaymentStatus;
    userId?: number;
    fromDate?: string;
    toDate?: string;
    page: number;
    limit: number;
};
export declare function listAdminBookings(input: ListAdminBookingsInput): Promise<{
    bookings: ({
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
            basePrice: Prisma.Decimal;
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
        payment: {
            status: import(".prisma/client").$Enums.PaymentStatus;
            id: number;
            amount: Prisma.Decimal;
            createdAt: Date;
            updatedAt: Date;
            bookingId: number;
            provider: string;
            providerRef: string | null;
            rawResponse: string | null;
            paidAt: Date | null;
            refundedAt: Date | null;
        } | null;
    } & {
        status: import(".prisma/client").$Enums.BookingStatus;
        id: number;
        scheduleId: number;
        createdAt: Date;
        updatedAt: Date;
        userId: number;
        baseAmount: Prisma.Decimal;
        taxAmount: Prisma.Decimal;
        discountAmount: Prisma.Decimal;
        commissionRate: Prisma.Decimal;
        commissionAmount: Prisma.Decimal;
        totalAmount: Prisma.Decimal;
        boardingPoint: string | null;
        droppingPoint: string | null;
        paymentStatus: import(".prisma/client").$Enums.PaymentStatus;
        bookedAt: Date;
        holdExpiresAt: Date | null;
        expiredAt: Date | null;
        cancelledAt: Date | null;
        cancellationReason: string | null;
    })[];
    pagination: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
    };
}>;
export declare function getAdminBookingById(bookingId: number): Promise<{
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
        basePrice: Prisma.Decimal;
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
    payment: {
        status: import(".prisma/client").$Enums.PaymentStatus;
        id: number;
        amount: Prisma.Decimal;
        createdAt: Date;
        updatedAt: Date;
        bookingId: number;
        provider: string;
        providerRef: string | null;
        rawResponse: string | null;
        paidAt: Date | null;
        refundedAt: Date | null;
    } | null;
} & {
    status: import(".prisma/client").$Enums.BookingStatus;
    id: number;
    scheduleId: number;
    createdAt: Date;
    updatedAt: Date;
    userId: number;
    baseAmount: Prisma.Decimal;
    taxAmount: Prisma.Decimal;
    discountAmount: Prisma.Decimal;
    commissionRate: Prisma.Decimal;
    commissionAmount: Prisma.Decimal;
    totalAmount: Prisma.Decimal;
    boardingPoint: string | null;
    droppingPoint: string | null;
    paymentStatus: import(".prisma/client").$Enums.PaymentStatus;
    bookedAt: Date;
    holdExpiresAt: Date | null;
    expiredAt: Date | null;
    cancelledAt: Date | null;
    cancellationReason: string | null;
}>;
type ReportsSummaryInput = {
    fromDate?: string;
    toDate?: string;
    busOperatorId?: number;
};
export declare function getReportsSummary(input: ReportsSummaryInput): Promise<{
    period: {
        fromDate: string | null;
        toDate: string | null;
    };
    bookings: {
        total: number;
        confirmed: number;
        cancelled: number;
    };
    payments: {
        paid: number;
        pending: number;
        refunded: number;
    };
    revenue: {
        totalCollected: number;
        totalCommission: number;
    };
}>;
export {};
//# sourceMappingURL=service.d.ts.map