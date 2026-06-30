import { BusBodyType, BusLayoutType } from "@prisma/client";
import type { AuthUser } from "../../core/middleware/auth.middleware.js";
import type { AuditContext } from "../../core/audit/requestContext.js";
type CreateBusInput = {
    registrationNo: string;
    name: string;
    capacity: number;
    bodyType?: BusBodyType | string;
    layoutType?: BusLayoutType | string;
    hasAc?: boolean;
    /** @deprecated use bodyType + hasAc */
    type?: string;
    amenities?: string[];
    operatorId?: number | null;
};
type UpdateBusInput = {
    name?: string;
    capacity?: number;
    bodyType?: BusBodyType | string;
    layoutType?: BusLayoutType | string;
    hasAc?: boolean;
    /** @deprecated use bodyType + hasAc */
    type?: string;
    amenities?: string[];
    operatorId?: number | null;
};
export declare function createBus(input: CreateBusInput, caller: AuthUser, audit?: AuditContext): Promise<{
    amenities: string[];
    id: number;
    operatorId: number | null;
    registrationNo: string;
    name: string;
    bodyType: BusBodyType;
    layoutType: BusLayoutType;
    hasAc: boolean;
    capacity: number;
    currentLayoutId: number | null;
    createdAt: Date;
    updatedAt: Date;
}>;
export declare function listBuses(caller: AuthUser): Promise<{
    amenities: string[];
    id: number;
    operatorId: number | null;
    registrationNo: string;
    name: string;
    bodyType: BusBodyType;
    layoutType: BusLayoutType;
    hasAc: boolean;
    capacity: number;
    currentLayoutId: number | null;
    createdAt: Date;
    updatedAt: Date;
}[]>;
export declare function getBusById(id: number, caller: AuthUser): Promise<{
    amenities: string[];
    id: number;
    operatorId: number | null;
    registrationNo: string;
    name: string;
    bodyType: BusBodyType;
    layoutType: BusLayoutType;
    hasAc: boolean;
    capacity: number;
    currentLayoutId: number | null;
    createdAt: Date;
    updatedAt: Date;
}>;
export declare function updateBus(id: number, input: UpdateBusInput, caller: AuthUser, audit?: AuditContext): Promise<{
    amenities: string[];
    id: number;
    operatorId: number | null;
    registrationNo: string;
    name: string;
    bodyType: BusBodyType;
    layoutType: BusLayoutType;
    hasAc: boolean;
    capacity: number;
    currentLayoutId: number | null;
    createdAt: Date;
    updatedAt: Date;
}>;
export declare function deleteBus(id: number, caller: AuthUser, audit?: AuditContext): Promise<{
    message: string;
}>;
export {};
//# sourceMappingURL=service.d.ts.map