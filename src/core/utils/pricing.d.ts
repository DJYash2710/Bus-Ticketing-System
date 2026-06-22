import { CouponType } from "@prisma/client";
type CouponLike = {
    type: CouponType;
    value: {
        toString(): string;
    } | number;
    isActive: boolean;
    validFrom: Date | null;
    validTo: Date | null;
    maxGlobalUses: number | null;
    usedCount: number;
    maxUsesPerUser: number | null;
};
export declare function calculateCouponDiscount(coupon: CouponLike, baseAmount: number): number;
export declare function calculateCreditsDiscount(creditsToRedeem: number): number;
export declare function calculateLoyaltyCreditsEarned(baseAmount: number): number;
export declare function assertCouponUsable(coupon: CouponLike, _userId: number, userRedemptionCount: number): Promise<void>;
export {};
//# sourceMappingURL=pricing.d.ts.map