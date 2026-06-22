import type { AuthUser } from "../../core/middleware/auth.middleware.js";
import { ScheduleStatus, type Prisma } from "@prisma/client";
import type { AuditContext } from "../../core/audit/requestContext.js";
export type RecurrenceInput = {
    frequency: "DAILY" | "WEEKLY" | "MONTHLY";
    daysOfWeek?: number[];
    endDate: string | Date;
};
export type ScheduleScope = "this" | "following" | "all";
type CreateScheduleInput = {
    routeId: number;
    busId: number;
    departureTime: string | Date;
    arrivalTime?: string | Date | null;
    basePrice: number;
    status?: ScheduleStatus;
    color?: string;
    recurrence?: RecurrenceInput;
};
type UpdateScheduleInput = {
    departureTime?: string | Date;
    arrivalTime?: string | Date | null;
    basePrice?: number;
    status?: ScheduleStatus;
    color?: string;
    scope?: ScheduleScope;
};
export declare function createSchedule(input: CreateScheduleInput, caller: AuthUser, audit?: AuditContext): Promise<{
    schedule: Omit<{
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
        _count: {
            seats: number;
            bookings: number;
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
        basePrice: Prisma.Decimal;
        status: import(".prisma/client").$Enums.ScheduleStatus;
        departureTime: Date;
        busId: number;
        routeId: number;
        createdAt: Date;
        updatedAt: Date;
        arrivalTime: Date | null;
        recurrenceGroupId: string | null;
        isRecurrenceException: boolean;
    }, "_count"> & {
        bookingsCount: number;
        seatsCount: number;
        bookedSeatsCount: number;
    };
    schedules: (Omit<{
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
        _count: {
            seats: number;
            bookings: number;
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
        basePrice: Prisma.Decimal;
        status: import(".prisma/client").$Enums.ScheduleStatus;
        departureTime: Date;
        busId: number;
        routeId: number;
        createdAt: Date;
        updatedAt: Date;
        arrivalTime: Date | null;
        recurrenceGroupId: string | null;
        isRecurrenceException: boolean;
    }, "_count"> & {
        bookingsCount: number;
        seatsCount: number;
        bookedSeatsCount: number;
    })[];
    recurrenceGroupId: null;
    count: number;
} | {
    schedule: (Omit<{
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
        _count: {
            seats: number;
            bookings: number;
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
        basePrice: Prisma.Decimal;
        status: import(".prisma/client").$Enums.ScheduleStatus;
        departureTime: Date;
        busId: number;
        routeId: number;
        createdAt: Date;
        updatedAt: Date;
        arrivalTime: Date | null;
        recurrenceGroupId: string | null;
        isRecurrenceException: boolean;
    }, "_count"> & {
        bookingsCount: number;
        seatsCount: number;
        bookedSeatsCount: number;
    }) | undefined;
    schedules: (Omit<{
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
        _count: {
            seats: number;
            bookings: number;
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
        basePrice: Prisma.Decimal;
        status: import(".prisma/client").$Enums.ScheduleStatus;
        departureTime: Date;
        busId: number;
        routeId: number;
        createdAt: Date;
        updatedAt: Date;
        arrivalTime: Date | null;
        recurrenceGroupId: string | null;
        isRecurrenceException: boolean;
    }, "_count"> & {
        bookingsCount: number;
        seatsCount: number;
        bookedSeatsCount: number;
    })[];
    recurrenceGroupId: string;
    count: number;
}>;
export declare function listSchedules(filters: {
    routeId?: number;
    busId?: number;
    status?: ScheduleStatus;
    date?: string;
    from?: string;
    to?: string;
}, caller: AuthUser): Promise<(Omit<{
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
    _count: {
        seats: number;
        bookings: number;
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
    basePrice: Prisma.Decimal;
    status: import(".prisma/client").$Enums.ScheduleStatus;
    departureTime: Date;
    busId: number;
    routeId: number;
    createdAt: Date;
    updatedAt: Date;
    arrivalTime: Date | null;
    recurrenceGroupId: string | null;
    isRecurrenceException: boolean;
}, "_count"> & {
    bookingsCount: number;
    seatsCount: number;
    bookedSeatsCount: number;
})[]>;
export declare function getScheduleById(id: number, caller: AuthUser): Promise<{
    bookingsCount: number;
    seatsCount: number;
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
    color: string | null;
    id: number;
    basePrice: Prisma.Decimal;
    status: import(".prisma/client").$Enums.ScheduleStatus;
    departureTime: Date;
    busId: number;
    routeId: number;
    createdAt: Date;
    updatedAt: Date;
    arrivalTime: Date | null;
    recurrenceGroupId: string | null;
    isRecurrenceException: boolean;
}>;
export declare function updateSchedule(id: number, input: UpdateScheduleInput, caller: AuthUser, audit?: AuditContext): Promise<{
    schedule: Omit<{
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
        _count: {
            seats: number;
            bookings: number;
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
        basePrice: Prisma.Decimal;
        status: import(".prisma/client").$Enums.ScheduleStatus;
        departureTime: Date;
        busId: number;
        routeId: number;
        createdAt: Date;
        updatedAt: Date;
        arrivalTime: Date | null;
        recurrenceGroupId: string | null;
        isRecurrenceException: boolean;
    }, "_count"> & {
        bookingsCount: number;
        seatsCount: number;
        bookedSeatsCount: number;
    };
    affectedCount: number;
    cancellation: import("./cancelCascade.js").CancelScheduleSummary;
    alreadyCancelled: boolean;
} | {
    schedule: Omit<{
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
        _count: {
            seats: number;
            bookings: number;
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
        basePrice: Prisma.Decimal;
        status: import(".prisma/client").$Enums.ScheduleStatus;
        departureTime: Date;
        busId: number;
        routeId: number;
        createdAt: Date;
        updatedAt: Date;
        arrivalTime: Date | null;
        recurrenceGroupId: string | null;
        isRecurrenceException: boolean;
    }, "_count"> & {
        bookingsCount: number;
        seatsCount: number;
        bookedSeatsCount: number;
    };
    affectedCount: number;
    cancellation?: never;
    alreadyCancelled?: never;
}>;
export declare function deleteSchedule(id: number, caller: AuthUser, scope?: ScheduleScope): Promise<{
    message: string;
    affectedCount: number;
}>;
export {};
//# sourceMappingURL=service.d.ts.map