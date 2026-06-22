import { type AuditContext } from "../../core/audit/requestContext.js";
type ClientMeta = {
    userAgent: string;
    ipAddress: string;
};
type RegisterInput = {
    name: string;
    email: string;
    phone?: string;
    password: string;
    referralCode?: string;
};
type LoginInput = {
    email: string;
    password: string;
};
export declare function registerUser(input: RegisterInput, client: ClientMeta): Promise<{
    user: {
        id: number;
        name: string;
        email: string;
        role: import(".prisma/client").$Enums.UserRole;
        creditsBalance: number;
        referralCode: string | null;
    };
    tokens: {
        accessToken: string;
        refreshToken: string;
    };
}>;
export declare function loginUser(input: LoginInput, client: ClientMeta): Promise<{
    user: {
        id: number;
        name: string;
        email: string;
        role: import(".prisma/client").$Enums.UserRole;
        creditsBalance: number;
        referralCode: string | null;
    };
    tokens: {
        accessToken: string;
        refreshToken: string;
    };
}>;
export declare function refreshTokens(refreshToken: string, client: ClientMeta): Promise<{
    user: {
        id: number;
        name: string;
        email: string;
        role: import(".prisma/client").$Enums.UserRole;
        creditsBalance: number;
        referralCode: string | null;
    };
    tokens: {
        accessToken: string;
        refreshToken: string;
    };
}>;
export declare function logoutUser(userId: number, ip?: string, audit?: AuditContext): Promise<{
    message: string;
}>;
export {};
//# sourceMappingURL=service.d.ts.map