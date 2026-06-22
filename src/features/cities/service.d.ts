type CreateCityInput = {
    name: string;
    state?: string | null;
    country?: string | null;
};
type UpdateCityInput = {
    name?: string;
    state?: string | null;
    country?: string | null;
};
export declare function createCity(input: CreateCityInput): Promise<{
    state: string | null;
    id: number;
    name: string;
    country: string | null;
    createdAt: Date;
    updatedAt: Date;
}>;
export declare function listCities(search?: string): Promise<{
    state: string | null;
    id: number;
    name: string;
    country: string | null;
    createdAt: Date;
    updatedAt: Date;
}[]>;
export declare function getCityById(id: number): Promise<{
    state: string | null;
    id: number;
    name: string;
    country: string | null;
    createdAt: Date;
    updatedAt: Date;
}>;
export declare function updateCity(id: number, input: UpdateCityInput): Promise<{
    state: string | null;
    id: number;
    name: string;
    country: string | null;
    createdAt: Date;
    updatedAt: Date;
}>;
export declare function deleteCity(id: number): Promise<{
    message: string;
}>;
export {};
//# sourceMappingURL=service.d.ts.map