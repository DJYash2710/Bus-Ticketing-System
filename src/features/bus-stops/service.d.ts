type CreateBusStopInput = {
    name: string;
    locality: string;
    cityId: number;
};
type UpdateBusStopInput = {
    name?: string;
    locality?: string;
    cityId?: number;
};
export declare function formatBusStopLabel(stop: {
    name: string;
    locality: string;
}): string;
export declare function createBusStop(input: CreateBusStopInput): Promise<{
    city: {
        name: string;
        id: number;
        state: string | null;
        country: string | null;
        createdAt: Date;
        updatedAt: Date;
    };
} & {
    name: string;
    locality: string;
    id: number;
    cityId: number;
    createdAt: Date;
    updatedAt: Date;
}>;
export declare function listBusStops(cityId?: number, search?: string): Promise<{
    name: string;
    locality: string;
    id: number;
    cityId: number;
    createdAt: Date;
    updatedAt: Date;
}[]>;
export declare function getBusStopById(id: number): Promise<{
    city: {
        name: string;
        id: number;
        state: string | null;
        country: string | null;
        createdAt: Date;
        updatedAt: Date;
    };
} & {
    name: string;
    locality: string;
    id: number;
    cityId: number;
    createdAt: Date;
    updatedAt: Date;
}>;
export declare function updateBusStop(id: number, input: UpdateBusStopInput): Promise<{
    city: {
        name: string;
        id: number;
        state: string | null;
        country: string | null;
        createdAt: Date;
        updatedAt: Date;
    };
} & {
    name: string;
    locality: string;
    id: number;
    cityId: number;
    createdAt: Date;
    updatedAt: Date;
}>;
export declare function deleteBusStop(id: number): Promise<{
    message: string;
}>;
export {};
//# sourceMappingURL=service.d.ts.map