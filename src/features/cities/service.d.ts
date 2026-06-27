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
    name: string;
    id: number;
    state: string | null;
    country: string | null;
    createdAt: Date;
    updatedAt: Date;
}>;
export declare function listCities(search?: string): Promise<{
    name: string;
    id: number;
    state: string | null;
    country: string | null;
    createdAt: Date;
    updatedAt: Date;
}[]>;
export declare function getCityById(id: number): Promise<{
    name: string;
    id: number;
    state: string | null;
    country: string | null;
    createdAt: Date;
    updatedAt: Date;
}>;
export declare function updateCity(id: number, input: UpdateCityInput): Promise<{
    name: string;
    id: number;
    state: string | null;
    country: string | null;
    createdAt: Date;
    updatedAt: Date;
}>;
export declare function deleteCity(id: number): Promise<{
    message: string;
}>;
export {};
//# sourceMappingURL=service.d.ts.map