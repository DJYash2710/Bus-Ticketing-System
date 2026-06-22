import type { AuthUser } from "../../core/middleware/auth.middleware.js";
import { ScheduleStatus } from "@prisma/client";
type CreateScheduleInput = {
    routeId: number;
    busId: number;
    departureTime: string | Date;
    arrivalTime?: string | Date | null;
    basePrice: number;
    status?: ScheduleStatus;
};
type UpdateScheduleInput = {
    departureTime?: string | Date;
    arrivalTime?: string | Date | null;
    basePrice?: number;
    status?: ScheduleStatus;
};
export declare function createSchedule(input: CreateScheduleInput, caller: AuthUser): Promise<{
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
}>;
export declare function listSchedules(filters: {
    routeId?: number;
    busId?: number;
    status?: ScheduleStatus;
    date?: string;
}, caller: AuthUser): Promise<({
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
    _count: {
        seats: number;
        bookings: number;
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
})[]>;
export declare function getScheduleById(id: number, caller: AuthUser): Promise<{
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
    }[];
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
    bookings: {
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
    }[];
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
}>;
export declare function updateSchedule(id: number, input: UpdateScheduleInput, caller: AuthUser): Promise<{
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
}>;
export declare function deleteSchedule(id: number, caller: AuthUser): Promise<{
    message: string;
}>;
export {};
//# sourceMappingURL=service.d.ts.map