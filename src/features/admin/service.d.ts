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
            basePrice: Prisma.Decimal;
            createdAt: Date;
            updatedAt: Date;
        };
        payment: {
            id: number;
            amount: Prisma.Decimal;
            status: import(".prisma/client").$Enums.PaymentStatus;
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
        id: number;
        status: import(".prisma/client").$Enums.BookingStatus;
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
        paymentStatus: import(".prisma/client").$Enums.PaymentStatus;
        bookedAt: Date;
        cancelledAt: Date | null;
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
        basePrice: Prisma.Decimal;
        createdAt: Date;
        updatedAt: Date;
    };
    payment: {
        id: number;
        amount: Prisma.Decimal;
        status: import(".prisma/client").$Enums.PaymentStatus;
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
    id: number;
    status: import(".prisma/client").$Enums.BookingStatus;
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
    paymentStatus: import(".prisma/client").$Enums.PaymentStatus;
    bookedAt: Date;
    cancelledAt: Date | null;
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