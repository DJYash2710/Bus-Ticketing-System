import { CouponType, Prisma } from "@prisma/client";
import { prisma } from "../../config/db.js";
import { ApiError } from "../../core/utils/apiError.js";
import {
  assertCouponUsable,
  calculateCouponDiscount,
} from "../../core/utils/pricing.js";

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

export async function previewCoupon(
  code: string,
  userId: number,
  baseAmount: number,
) {
  const coupon = await prisma.coupon.findUnique({
    where: { code: code.toUpperCase() },
  });

  if (!coupon) {
    throw new ApiError(404, "Coupon not found");
  }

  const userRedemptionCount = await prisma.couponRedemption.count({
    where: { couponId: coupon.id, userId },
  });

  await assertCouponUsable(coupon, userId, userRedemptionCount);

  const discountAmount = calculateCouponDiscount(coupon, baseAmount);

  return {
    code: coupon.code,
    type: coupon.type,
    value: coupon.value,
    baseAmount,
    discountAmount,
    payableAmount: Math.max(0, baseAmount - discountAmount),
  };
}

export async function resolveCouponForBooking(
  code: string,
  userId: number,
  baseAmount: number,
) {
  const preview = await previewCoupon(code, userId, baseAmount);
  const coupon = await prisma.coupon.findUniqueOrThrow({
    where: { code: preview.code },
  });

  return {
    coupon,
    discountAmount: preview.discountAmount,
  };
}

export async function listCoupons() {
  return prisma.coupon.findMany({
    orderBy: { createdAt: "desc" },
  });
}

export async function createCoupon(input: CreateCouponInput) {
  const existing = await prisma.coupon.findUnique({
    where: { code: input.code.toUpperCase() },
  });

  if (existing) {
    throw new ApiError(409, "Coupon code already exists");
  }

  return prisma.coupon.create({
    data: {
      code: input.code.toUpperCase(),
      type: input.type,
      value: input.value,
      maxUsesPerUser: input.maxUsesPerUser ?? null,
      maxGlobalUses: input.maxGlobalUses ?? null,
      isActive: input.isActive ?? true,
      validFrom: input.validFrom ?? null,
      validTo: input.validTo ?? null,
    },
  });
}

export async function updateCoupon(id: number, input: UpdateCouponInput) {
  const coupon = await prisma.coupon.findUnique({ where: { id } });
  if (!coupon) throw new ApiError(404, "Coupon not found");

  const data: Prisma.CouponUpdateInput = {};
  if (input.type !== undefined) data.type = input.type;
  if (input.value !== undefined) data.value = input.value;
  if (input.maxUsesPerUser !== undefined)
    data.maxUsesPerUser = input.maxUsesPerUser;
  if (input.maxGlobalUses !== undefined) data.maxGlobalUses = input.maxGlobalUses;
  if (input.isActive !== undefined) data.isActive = input.isActive;
  if (input.validFrom !== undefined) data.validFrom = input.validFrom;
  if (input.validTo !== undefined) data.validTo = input.validTo;

  return prisma.coupon.update({ where: { id }, data });
}

export async function deleteCoupon(id: number) {
  const coupon = await prisma.coupon.findUnique({ where: { id } });
  if (!coupon) throw new ApiError(404, "Coupon not found");

  await prisma.coupon.delete({ where: { id } });
  return { message: "Coupon deleted" };
}
