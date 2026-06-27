import {
  BookingStatus,
  PaymentStatus,
  ScheduleStatus,
  SeatStatus,
} from "@prisma/client";
import { prisma } from "../../config/db.js";
import { env } from "../../config/env.js";
import { ApiError } from "../../core/utils/apiError.js";
import {
  calculateCreditsDiscount,
} from "../../core/utils/pricing.js";
import { resolveCouponForBooking } from "../coupons/service.js";
import { calculateHoldExpiresAt, CancellationReason } from "./constants.js";
import { expireStaleHolds } from "./holdExpiry.js";
import {
  cancelBookingInTx,
  logBookingCancellationAudits,
} from "./cancelBookingCore.js";
import { AuditAction, AuditEntityType } from "../../core/audit/actions.js";
import { auditLogFrom } from "../../core/audit/auditLog.service.js";
import type { AuditContext } from "../../core/audit/requestContext.js";

type CreateBookingInput = {
  userId: number;
  scheduleId: number;
  seatNumbers: string[];
  boardingPoint: string;
  droppingPoint: string;
  couponCode?: string;
  creditsToRedeem?: number;
};

export async function createBooking(
  input: CreateBookingInput,
  audit?: AuditContext,
) {
  await expireStaleHolds();

  const uniqueSeatNumbers = [
    ...new Set(input.seatNumbers.map((seat) => seat.trim().toUpperCase())),
  ];

  if (uniqueSeatNumbers.length === 0) {
    throw new ApiError(400, "At least one seat number is required");
  }

  const schedule = await prisma.schedule.findUnique({
    where: { id: input.scheduleId },
    include: {
      route: {
        include: {
          fromCity: true,
          toCity: true,
        },
      },
      bus: true,
    },
  });

  if (!schedule) {
    throw new ApiError(404, "Schedule not found");
  }

  if (schedule.status !== ScheduleStatus.ACTIVE) {
    throw new ApiError(400, "Schedule is not active");
  }

  const seats = await prisma.seat.findMany({
    where: {
      scheduleId: input.scheduleId,
      seatNumber: {
        in: uniqueSeatNumbers,
      },
    },
  });

  if (seats.length !== uniqueSeatNumbers.length) {
    throw new ApiError(
      404,
      "One or more selected seats were not found for this schedule",
    );
  }

  const unavailableSeats = seats.filter(
    (seat) => seat.status !== SeatStatus.AVAILABLE,
  );

  if (unavailableSeats.length > 0) {
    throw new ApiError(
      409,
      `Selected seats are not available: ${unavailableSeats
        .map((seat) => seat.seatNumber)
        .join(", ")}`,
    );
  }

  const baseAmount = Number(schedule.basePrice) * seats.length;
  const taxAmount =
    Math.round(baseAmount * env.gstRate * 100) / 100;
  let couponDiscount = 0;
  let creditsDiscount = 0;
  let couponId: number | undefined;
  const creditsToRedeem = input.creditsToRedeem ?? 0;

  if (input.couponCode) {
    const couponResult = await resolveCouponForBooking(
      input.couponCode,
      input.userId,
      baseAmount,
    );
    couponDiscount = couponResult.discountAmount;
    couponId = couponResult.coupon.id;
  }

  if (creditsToRedeem > 0) {
    const user = await prisma.user.findUnique({ where: { id: input.userId } });
    if (!user) throw new ApiError(404, "User not found");

    if (creditsToRedeem > user.creditsBalance) {
      throw new ApiError(400, "Insufficient credits balance");
    }

    creditsDiscount = calculateCreditsDiscount(creditsToRedeem);
  }

  const discountAmount = couponDiscount + creditsDiscount;
  if (discountAmount > baseAmount) {
    throw new ApiError(400, "Total discount cannot exceed base amount");
  }

  const commissionRate = env.platformCommissionRate;
  const commissionAmount = baseAmount * commissionRate;
  const totalAmount = baseAmount + taxAmount - discountAmount;
  const holdExpiresAt = calculateHoldExpiresAt();

  const booking = await prisma.$transaction(async (tx) => {
    const updatedSeats = await tx.seat.updateMany({
      where: {
        id: {
          in: seats.map((seat) => seat.id),
        },
        status: SeatStatus.AVAILABLE,
      },
      data: {
        status: SeatStatus.HELD,
        heldUntil: holdExpiresAt,
      },
    });

    if (updatedSeats.count !== seats.length) {
      throw new ApiError(
        409,
        "Some seats were just held by another user. Please try again.",
      );
    }

    const createdBooking = await tx.booking.create({
      data: {
        userId: input.userId,
        scheduleId: input.scheduleId,
        baseAmount,
        taxAmount,
        discountAmount,
        commissionRate,
        commissionAmount,
        totalAmount,
        status: BookingStatus.PENDING,
        paymentStatus: PaymentStatus.PENDING,
        holdExpiresAt,
        boardingPoint: input.boardingPoint,
        droppingPoint: input.droppingPoint,
      },
      include: {
        schedule: {
          include: {
            route: {
              include: {
                fromCity: true,
                toCity: true,
              },
            },
            bus: true,
          },
        },
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    await tx.bookingSeat.createMany({
      data: seats.map((seat) => ({
        bookingId: createdBooking.id,
        seatId: seat.id,
      })),
    });

    if (couponId) {
      await tx.couponRedemption.create({
        data: {
          couponId,
          userId: input.userId,
          bookingId: createdBooking.id,
        },
      });

      await tx.coupon.update({
        where: { id: couponId },
        data: { usedCount: { increment: 1 } },
      });
    }

    if (creditsToRedeem > 0) {
      await tx.loyaltyEvent.create({
        data: {
          userId: input.userId,
          bookingId: createdBooking.id,
          type: "REDEEM_BOOKING",
          credits: -creditsToRedeem,
          description: `Redeemed ${creditsToRedeem} credits on booking #${createdBooking.id}`,
        },
      });

      await tx.user.update({
        where: { id: input.userId },
        data: { creditsBalance: { decrement: creditsToRedeem } },
      });
    }

    return tx.booking.findUnique({
      where: { id: createdBooking.id },
      include: {
        seats: {
          include: {
            seat: true,
          },
        },
        schedule: {
          include: {
            route: {
              include: {
                fromCity: true,
                toCity: true,
              },
            },
            bus: true,
          },
        },
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });
  });

  if (booking) {
    const seatNumbers = booking.seats?.map((s) => s.seat.seatNumber) ?? uniqueSeatNumbers;
    const auditCtx = audit ?? {
      actorId: input.userId,
      actorRole: "USER",
    };

    auditLogFrom(auditCtx, {
      action: AuditAction.BOOKING_CREATED,
      entityType: AuditEntityType.BOOKING,
      entityId: booking.id,
      metadata: {
        scheduleId: input.scheduleId,
        seatNumbers,
        amount: Number(booking.totalAmount),
        holdExpiresAt: booking.holdExpiresAt,
        status: booking.status,
      },
    });

    for (const seatLink of booking.seats ?? []) {
      auditLogFrom(auditCtx, {
        action: AuditAction.SEAT_HELD,
        entityType: AuditEntityType.SEAT,
        entityId: seatLink.seatId,
        metadata: {
          bookingId: booking.id,
          scheduleId: input.scheduleId,
          seatNumber: seatLink.seat.seatNumber,
          holdExpiresAt: booking.holdExpiresAt,
        },
      });
    }

    if (couponId) {
      auditLogFrom(auditCtx, {
        action: AuditAction.COUPON_APPLIED,
        entityType: AuditEntityType.COUPON,
        entityId: couponId,
        metadata: {
          bookingId: booking.id,
          discountAmount: couponDiscount,
          code: input.couponCode,
        },
      });
      auditLogFrom(auditCtx, {
        action: AuditAction.COUPON_REDEEMED,
        entityType: AuditEntityType.COUPON,
        entityId: couponId,
        metadata: { bookingId: booking.id },
      });
    }

    if (creditsToRedeem > 0) {
      auditLogFrom(auditCtx, {
        action: AuditAction.CREDITS_REDEEMED,
        entityType: AuditEntityType.LOYALTY,
        entityId: input.userId,
        metadata: {
          bookingId: booking.id,
          credits: creditsToRedeem,
        },
      });
    }
  }

  return booking;
}

export async function getBookingById(bookingId: number, userId: number) {
  const booking = await prisma.booking.findFirst({
    where: {
      id: bookingId,
      userId,
    },
    include: {
      seats: {
        include: {
          seat: true,
        },
      },
      schedule: {
        include: {
          route: {
            include: {
              fromCity: true,
              toCity: true,
            },
          },
          bus: true,
        },
      },
      user: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
    },
  });

  if (!booking) {
    throw new ApiError(404, "Booking not found");
  }

  return booking;
}

export async function getMyBookings(userId: number) {
  return prisma.booking.findMany({
    where: { userId },
    include: {
      seats: {
        include: {
          seat: true,
        },
      },
      schedule: {
        include: {
          route: {
            include: {
              fromCity: true,
              toCity: true,
            },
          },
          bus: true,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });
}

export async function cancelBooking(
  bookingId: number,
  userId: number,
  audit?: AuditContext,
) {
  const booking = await prisma.booking.findFirst({
    where: {
      id: bookingId,
      userId,
    },
    include: {
      seats: true,
      payment: true,
    },
  });

  if (!booking) {
    throw new ApiError(404, "Booking not found");
  }

  if (booking.status === BookingStatus.CANCELLED) {
    throw new ApiError(400, "Booking is already cancelled");
  }

  if (booking.status === BookingStatus.EXPIRED) {
    throw new ApiError(400, "Booking has already expired");
  }

  const cancelResult = await prisma.$transaction(async (tx) => {
    const result = await cancelBookingInTx(tx, booking, {
      reason: CancellationReason.USER_CANCELLED,
    });

    if (!result.changed) {
      throw new ApiError(400, "Booking cannot be cancelled");
    }

    return result;
  });

  const result = await prisma.booking.findUnique({
    where: { id: booking.id },
    include: {
      seats: {
        include: {
          seat: true,
        },
      },
      schedule: {
        include: {
          route: {
            include: {
              fromCity: true,
              toCity: true,
            },
          },
          bus: true,
        },
      },
      user: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
    },
  });

  if (cancelResult.changed) {
    const auditCtx = audit ?? { actorId: userId, actorRole: "USER" };
    const wasPaid = booking.paymentStatus === PaymentStatus.SUCCESS;

    logBookingCancellationAudits(auditCtx, cancelResult, {
      seatReleaseReason: wasPaid ? "cancelled" : "cancelled_pending",
      cancellationReason: CancellationReason.USER_CANCELLED,
    });
  }

  return result;
}

export async function getOperatorBookings(busOperatorId: number) {
  return prisma.booking.findMany({
    where: {
      schedule: {
        bus: {
          operatorId: busOperatorId,
        },
      },
    },
    include: {
      seats: {
        include: {
          seat: true,
        },
      },
      schedule: {
        include: {
          route: {
            include: {
              fromCity: true,
              toCity: true,
            },
          },
          bus: true,
        },
      },
      user: {
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });
}
