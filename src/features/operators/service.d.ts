import { UserRole } from "@prisma/client";
type CreateOperatorInput = {
    companyName: string;
    contactEmail?: string;
    contactPhone?: string;
    operatorUser: {
        name: string;
        email: string;
        phone?: string;
        password: string;
    };
};
type UpdateOperatorInput = {
    name?: string;
    contactEmail?: string | null;
    contactPhone?: string | null;
};
export declare function createOperator(input: CreateOperatorInput): Promise<{
    operator: {
        id: number;
        name: string;
        contactEmail: string | null;
        contactPhone: string | null;
        createdAt: Date;
        updatedAt: Date;
    };
    user: {
        name: string;
        email: string;
        id: number;
        role: import(".prisma/client").$Enums.UserRole;
        phone: string | null;
    };
}>;
export declare function listOperators(): Promise<{
    buses?: unknown[];
    users: {
        id: number;
        name: string;
        email: string;
        phone: string | null;
        role: UserRole;
    }[];
    busCount: number;
    id: number;
    name: string;
    contactEmail: string | null;
    contactPhone: string | null;
    createdAt: Date;
    updatedAt: Date;
}[]>;
export declare function getOperatorById(id: number): Promise<{
    buses?: unknown[];
    users: {
        id: number;
        name: string;
        email: string;
        phone: string | null;
        role: UserRole;
    }[];
    busCount: number;
    id: number;
    name: string;
    contactEmail: string | null;
    contactPhone: string | null;
    createdAt: Date;
    updatedAt: Date;
}>;
export declare function updateOperator(id: number, input: UpdateOperatorInput): Promise<{
    buses?: unknown[];
    users: {
        id: number;
        name: string;
        email: string;
        phone: string | null;
        role: UserRole;
    }[];
    busCount: number;
    id: number;
    name: string;
    contactEmail: string | null;
    contactPhone: string | null;
    createdAt: Date;
    updatedAt: Date;
}>;
export {};
//# sourceMappingURL=service.d.ts.map