type UpdateProfileInput = {
    name?: string;
    phone?: string | null;
};
type ChangePasswordInput = {
    currentPassword: string;
    newPassword: string;
};
export declare function getUserProfile(userId: number): Promise<{
    name: string;
    email: string;
    id: number;
    role: import(".prisma/client").$Enums.UserRole;
    isActive: boolean;
    phone: string | null;
    referralCode: string | null;
    creditsBalance: number;
    createdAt: Date;
    updatedAt: Date;
}>;
export declare function updateUserProfile(userId: number, input: UpdateProfileInput): Promise<{
    name: string;
    email: string;
    id: number;
    role: import(".prisma/client").$Enums.UserRole;
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