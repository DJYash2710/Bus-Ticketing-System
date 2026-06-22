type CreateRouteInput = {
    code: string;
    fromCityId: number;
    toCityId: number;
    distanceKm?: number;
    durationMin?: number;
};
type UpdateRouteInput = {
    distanceKm?: number;
    durationMin?: number;
};
export declare function createRoute(input: CreateRouteInput): Promise<{
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
}>;
export declare function listRoutes(fromCityId?: number, toCityId?: number): Promise<({
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
})[]>;
export declare function getRouteById(id: number): Promise<{
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
}>;
export declare function updateRoute(id: number, input: UpdateRouteInput): Promise<{
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
}>;
export declare function deleteRoute(id: number): Promise<{
    message: string;
}>;
export {};
//# sourceMappingURL=service.d.ts.map