import type { AuthUser } from "../../core/middleware/auth.middleware.js";
import type { BusType } from "@prisma/client";
type CreateBusInput = {
    registrationNo: string;
    name: string;
    capacity: number;
    type: BusType | string;
    amenities?: string[];
    operatorId?: number | null;
};
type UpdateBusInput = {
    name?: string;
    capacity?: number;
    type?: BusType | string;
    amenities?: string[];
    operatorId?: number | null;
};
export declare function createBus(input: CreateBusInput, caller: AuthUser): Promise<{
    amenities: string[];
    type: import(".prisma/client").$Enums.BusType;
    id: number;
    name: string;
    operatorId: number | null;
    registrationNo: string;
    capacity: number;
    createdAt: Date;
    updatedAt: Date;
}>;
export declare function listBuses(caller: AuthUser): Promise<{
    amenities: string[];
    type: import(".prisma/client").$Enums.BusType;
    id: number;
    name: string;
    operatorId: number | null;
    registrationNo: string;
    capacity: number;
    createdAt: Date;
    updatedAt: Date;
}[]>;
export declare function getBusById(id: number, caller: AuthUser): Promise<{
    amenities: string[];
    type: import(".prisma/client").$Enums.BusType;
    id: number;
    name: string;
    operatorId: number | null;
    registrationNo: string;
    capacity: number;
    createdAt: Date;
    updatedAt: Date;
}>;
export declare function updateBus(id: number, input: UpdateBusInput, caller: AuthUser): Promise<{
    amenities: string[];
    type: import(".prisma/client").$Enums.BusType;
    id: number;
    name: string;
    operatorId: number | null;
    registrationNo: string;
    capacity: number;
    createdAt: Date;
    updatedAt: Date;
}>;
export declare function deleteBus(id: number, caller: AuthUser): Promise<{
    message: string;
}>;
export {};
//# sourceMappingURL=service.d.ts.map