import { CouponType } from "@prisma/client";
import { env } from "../../config/env.js";
import { ApiError } from "./apiError.js";

type CouponLike = {
  type: CouponType;
  value: { toString(): string } | number;
  isActive: boolean;
  validFrom: Date | null;
  validTo: Date | null;
  maxGlobalUses: number | null;
  usedCount: number;
  maxUsesPerUser: number | null;
};

export function calculateCouponDiscount(coupon: CouponLike, baseAmount: number) {
  if (coupon.type === CouponType.PERCENT) {
    return Math.min(baseAmount, Math.round((baseAmount * Number(coupon.value)) / 100));
  }

  return Math.min(baseAmount, Number(coupon.value));
}

export function calculateCreditsDiscount(creditsToRedeem: number) {
  return Math.round(creditsToRedeem * env.loyaltyPointValue * 100) / 100;
}

export function calculateLoyaltyCreditsEarned(baseAmount: number) {
  return Math.floor(baseAmount * env.loyaltyEarnRate);
}

export async function assertCouponUsable(
  coupon: CouponLike,
  _userId: number,
  userRedemptionCount: number,
) {
  const now = new Date();

  if (!coupon.isActive) {
    throw new ApiError(400, "Coupon is not active");
  }

  if (coupon.validFrom && coupon.validFrom > now) {
    throw new ApiError(400, "Coupon is not valid yet");
  }

  if (coupon.validTo && coupon.validTo < now) {
    throw new ApiError(400, "Coupon has expired");
  }

  if (coupon.maxGlobalUses != null && coupon.usedCount >= coupon.maxGlobalUses) {
    throw new ApiError(400, "Coupon usage limit reached");
  }

  if (
    coupon.maxUsesPerUser != null &&
    userRedemptionCount >= coupon.maxUsesPerUser
  ) {
    throw new ApiError(400, "You have already used this coupon");
  }
}
