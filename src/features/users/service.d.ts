type UpdateProfileInput = {
    name?: string;
    phone?: string | null;
};
type ChangePasswordInput = {
    currentPassword: string;
    newPassword: string;
};
export declare function getUserProfile(userId: number): Promise<{
    id: number;
    name: string;
    role: import(".prisma/client").$Enums.UserRole;
    isActive: boolean;
    email: string;
    phone: string | null;
    referralCode: string | null;
    creditsBalance: number;
    createdAt: Date;
    updatedAt: Date;
}>;
export declare function updateUserProfile(userId: number, input: UpdateProfileInput): Promise<{
    id: number;
    name: string;
    role: import(".prisma/client").$Enums.UserRole;
    email: string;
    phone: string | null;
    referralCode: string | null;
    creditsBalance: number;
    updatedAt: Date;
}>;
export declare function changeUserPassword(userId: number, input: ChangePasswordInput): Promise<{
    message: string;
}>;
export {};
//# sourceMappingURL=service.d.ts.map