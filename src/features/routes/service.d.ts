import type { AuditContext } from "../../core/audit/requestContext.js";
type CreateRouteInput = {
    code: string;
    fromCityId: number;
    toCityId: number;
    startBusStopId: number;
    endBusStopId: number;
    distanceKm?: number;
    durationMin?: number;
};
type UpdateRouteInput = {
    distanceKm?: number;
    durationMin?: number;
};
export declare function createRoute(input: CreateRouteInput, audit?: AuditContext): Promise<{
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
    startBusStop: {
        name: string;
        locality: string;
        id: number;
        cityId: number;
        createdAt: Date;
        updatedAt: Date;
    } | null;
    endBusStop: {
        name: string;
        locality: string;
        id: number;
        cityId: number;
        createdAt: Date;
        updatedAt: Date;
    } | null;
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
}>;
export declare function listRoutes(fromCityId?: number, toCityId?: number): Promise<({
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
    startBusStop: {
        name: string;
        locality: string;
        id: number;
        cityId: number;
        createdAt: Date;
        updatedAt: Date;
    } | null;
    endBusStop: {
        name: string;
        locality: string;
        id: number;
        cityId: number;
        createdAt: Date;
        updatedAt: Date;
    } | null;
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
})[]>;
export declare function getRouteById(id: number): Promise<{
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
    startBusStop: {
        name: string;
        locality: string;
        id: number;
        cityId: number;
        createdAt: Date;
        updatedAt: Date;
    } | null;
    endBusStop: {
        name: string;
        locality: string;
        id: number;
        cityId: number;
        createdAt: Date;
        updatedAt: Date;
    } | null;
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
}>;
export declare function updateRoute(id: number, input: UpdateRouteInput, audit?: AuditContext): Promise<{
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
}>;
export declare function deleteRoute(id: number, audit?: AuditContext): Promise<{
    message: string;
}>;
export {};
//# sourceMappingURL=service.d.ts.map