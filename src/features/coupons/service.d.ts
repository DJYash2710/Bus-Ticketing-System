import { CouponType, Prisma } from "@prisma/client";
type CreateCouponInput = {
    code: string;
    type: CouponType;
    value: number;
    maxUsesPerUser?: number | null;
    maxGlobalUses?: number | null;
    isActive?: boolean;
    validFrom?: Date | null;
    validTo?: Date | null;
};
type UpdateCouponInput = Partial<Omit<CreateCouponInput, "code">>;
export declare function previewCoupon(code: string, userId: number, baseAmount: number): Promise<{
    code: string;
    type: import(".prisma/client").$Enums.CouponType;
    value: Prisma.Decimal;
    baseAmount: number;
    discountAmount: number;
    payableAmount: number;
}>;
export declare function resolveCouponForBooking(code: string, userId: number, baseAmount: number): Promise<{
    coupon: {
        code: string;
        id: number;
        value: Prisma.Decimal;
        type: import(".prisma/client").$Enums.CouponType;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
        maxUsesPerUser: number | null;
        maxGlobalUses: number | null;
        usedCount: number;
        validFrom: Date | null;
        validTo: Date | null;
    };
    discountAmount: number;
}>;
export declare function listCoupons(): Promise<{
    code: string;
    id: number;
    value: Prisma.Decimal;
    type: import(".prisma/client").$Enums.CouponType;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
    maxUsesPerUser: number | null;
    maxGlobalUses: number | null;
    usedCount: number;
    validFrom: Date | null;
    validTo: Date | null;
}[]>;
export declare function createCoupon(input: CreateCouponInput): Promise<{
    code: string;
    id: number;
    value: Prisma.Decimal;
    type: import(".prisma/client").$Enums.CouponType;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
    maxUsesPerUser: number | null;
    maxGlobalUses: number | null;
    usedCount: number;
    validFrom: Date | null;
    validTo: Date | null;
}>;
export declare function updateCoupon(id: number, input: UpdateCouponInput): Promise<{
    code: string;
    id: number;
    value: Prisma.Decimal;
    type: import(".prisma/client").$Enums.CouponType;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
    maxUsesPerUser: number | null;
    maxGlobalUses: number | null;
    usedCount: number;
    validFrom: Date | null;
    validTo: Date | null;
}>;
export declare function deleteCoupon(id: number): Promise<{
    message: string;
}>;
export {};
//# sourceMappingURL=service.d.ts.map