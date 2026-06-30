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
        _count: {
            seats: number;
            bookings: number;
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
    }, "_count"> & {
        bookingsCount: number;
        seatsCount: number;
        bookedSeatsCount: number;
    };
    schedules: (Omit<{
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
        _count: {
            seats: number;
            bookings: number;
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
    }, "_count"> & {
        bookingsCount: number;
        seatsCount: number;
        bookedSeatsCount: number;
    })[];
    recurrenceGroupId: null;
    count: number;
} | {
    schedule: (Omit<{
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
        _count: {
            seats: number;
            bookings: number;
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
    }, "_count"> & {
        bookingsCount: number;
        seatsCount: number;
        bookedSeatsCount: number;
    }) | undefined;
    schedules: (Omit<{
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
        _count: {
            seats: number;
            bookings: number;
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
    _count: {
        seats: number;
        bookings: number;
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
}, "_count"> & {
    bookingsCount: number;
    seatsCount: number;
    bookedSeatsCount: number;
})[]>;
export declare function getScheduleById(id: number, caller: AuthUser): Promise<{
    bookingsCount: number;
    seatsCount: number;
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
}>;
export declare function updateSchedule(id: number, input: UpdateScheduleInput, caller: AuthUser, audit?: AuditContext): Promise<{
    schedule: Omit<{
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
        _count: {
            seats: number;
            bookings: number;
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
        _count: {
            seats: number;
            bookings: number;
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