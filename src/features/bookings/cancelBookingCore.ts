import {
  BookingStatus,
  PaymentStatus,
  SeatStatus,
  type Booking,
  type BookingSeat,
  type Payment,
  type Prisma,
} from "@prisma/client";
import { reverseBookingIncentives } from "./bookingSideEffects.js";
import { type CancellationReasonType } from "./constants.js";
import { simulateMockRefund } from "../payments/refund.js";
import { AuditAction, AuditEntityType } from "../../core/audit/actions.js";
import { auditLogFrom } from "../../core/audit/auditLog.service.js";
import type { AuditContext } from "../../core/audit/requestContext.js";

export type BookingForCancellation = Booking & {
  seats: BookingSeat[];
  payment: Payment | null;
};

export type CancelBookingInTxOptions = {
  reason: CancellationReasonType;
  /** When true, release seats in HELD or BOOKED state (schedule cascade). */
  releaseAnyHeldOrBooked?: boolean;
};

export type CancelBookingInTxResult = {
  changed: boolean;
  bookingId: number;
  scheduleId: number;
  userId: number;
  previousStatus: BookingStatus;
  seatIds: number[];
  paymentId: number | null;
  refunded: boolean;
  paymentCancelled: boolean;
  totalAmount: number;
};

export async function cancelBookingInTx(
  tx: Prisma.TransactionClient,
  booking: BookingForCancellation,
  options: CancelBookingInTxOptions,
): Promise<CancelBookingInTxResult> {
  const baseResult: CancelBookingInTxResult = {
    changed: false,
    bookingId: booking.id,
    scheduleId: booking.scheduleId,
    userId: booking.userId,
    previousStatus: booking.status,
    seatIds: [],
    paymentId: booking.payment?.id ?? null,
    refunded: false,
    paymentCancelled: false,
    totalAmount: Number(booking.totalAmount),
  };

  if (
    booking.status === BookingStatus.CANCELLED ||
    booking.status === BookingStatus.EXPIRED
  ) {
    return baseResult;
  }

  const cancelled = await tx.booking.updateMany({
    where: {
      id: booking.id,
      status: {
        in: [BookingStatus.PENDING, BookingStatus.CONFIRMED],
      },
    },
    data: {
      status: BookingStatus.CANCELLED,
      cancelledAt: new Date(),
      cancellationReason: options.reason,
    },
  });

  if (cancelled.count === 0) {
    return baseResult;
  }

  const seatStatusToRelease = options.releaseAnyHeldOrBooked
    ? [SeatStatus.HELD, SeatStatus.BOOKED]
    : [
        booking.status === BookingStatus.PENDING
          ? SeatStatus.HELD
          : SeatStatus.BOOKED,
      ];

  let paymentId: number | null = booking.payment?.id ?? null;
  let refunded = false;
  let paymentCancelled = false;
  const bookingPaymentUpdate: { paymentStatus?: PaymentStatus } = {};

  if (booking.paymentStatus === PaymentStatus.SUCCESS) {
    const refundPending = await tx.payment.updateMany({
      where: { bookingId: booking.id, status: PaymentStatus.SUCCESS },
      data: { status: PaymentStatus.REFUND_PENDING },
    });

    if (refundPending.count > 0) {
      const payment = await tx.payment.findUnique({
        where: { bookingId: booking.id },
      });
      if (payment) {
        paymentId = payment.id;
        const didRefund = await simulateMockRefund(tx, payment.id);
        refunded = didRefund;
        if (didRefund) {
          bookingPaymentUpdate.paymentStatus = PaymentStatus.REFUNDED;
        }
      }

      const earnEvent = await tx.loyaltyEvent.findFirst({
        where: { bookingId: booking.id, type: "EARN_BOOKING" },
      });

      const existingReversal = await tx.loyaltyEvent.findFirst({
        where: {
          bookingId: booking.id,
          type: "ADJUSTMENT",
          credits: { lt: 0 },
        },
      });

      if (earnEvent && earnEvent.credits > 0 && !existingReversal) {
        await tx.user.update({
          where: { id: booking.userId },
          data: { creditsBalance: { decrement: earnEvent.credits } },
        });

        await tx.loyaltyEvent.create({
          data: {
            userId: booking.userId,
            bookingId: booking.id,
            type: "ADJUSTMENT",
            credits: -earnEvent.credits,
            description: `Reversed ${earnEvent.credits} credits after booking #${booking.id} cancellation`,
          },
        });
      }
    }
  } else {
    const cancelledPayment = await tx.payment.updateMany({
      where: { bookingId: booking.id, status: PaymentStatus.PENDING },
      data: { status: PaymentStatus.CANCELLED },
    });

    paymentCancelled = cancelledPayment.count > 0;
    if (paymentCancelled) {
      const payment = await tx.payment.findUnique({
        where: { bookingId: booking.id },
      });
      paymentId = payment?.id ?? null;
      bookingPaymentUpdate.paymentStatus = PaymentStatus.CANCELLED;
    }

    if (booking.status === BookingStatus.PENDING) {
      await reverseBookingIncentives(tx, booking.id, booking.userId);
    }
  }

  if (bookingPaymentUpdate.paymentStatus) {
    await tx.booking.update({
      where: { id: booking.id },
      data: { paymentStatus: bookingPaymentUpdate.paymentStatus },
    });
  }

  const seatIds = booking.seats.map((item) => item.seatId);
  let releasedSeatIds: number[] = [];

  if (seatIds.length > 0) {
    const releasableSeats = await tx.seat.findMany({
      where: {
        id: { in: seatIds },
        status: { in: seatStatusToRelease },
      },
      select: { id: true },
    });

    releasedSeatIds = releasableSeats.map((seat) => seat.id);

    if (releasedSeatIds.length > 0) {
      await tx.seat.updateMany({
        where: {
          id: { in: releasedSeatIds },
          status: { in: seatStatusToRelease },
        },
        data: {
          status: SeatStatus.AVAILABLE,
          heldUntil: null,
        },
      });
    }
  }

  return {
    changed: true,
    bookingId: booking.id,
    scheduleId: booking.scheduleId,
    userId: booking.userId,
    previousStatus: booking.status,
    seatIds: releasedSeatIds,
    paymentId,
    refunded,
    paymentCancelled,
    totalAmount: Number(booking.totalAmount),
  };
}

export function logBookingCancellationAudits(
  auditCtx: AuditContext,
  result: CancelBookingInTxResult,
  options: {
    scheduleId?: number;
    seatReleaseReason: string;
    cancellationReason: CancellationReasonType;
  },
): void {
  if (!result.changed) {
    return;
  }

  auditLogFrom(auditCtx, {
    action: AuditAction.BOOKING_CANCELLED,
    entityType: AuditEntityType.BOOKING,
    entityId: result.bookingId,
    metadata: {
      scheduleId: options.scheduleId ?? result.scheduleId,
      previousStatus: result.previousStatus,
      cancellationReason: options.cancellationReason,
    },
  });

  if (result.refunded) {
    auditLogFrom(auditCtx, {
      action: AuditAction.BOOKING_REFUNDED,
      entityType: AuditEntityType.BOOKING,
      entityId: result.bookingId,
      metadata: {
        scheduleId: options.scheduleId ?? result.scheduleId,
        amount: result.totalAmount,
      },
    });

    if (result.paymentId) {
      auditLogFrom(auditCtx, {
        action: AuditAction.PAYMENT_REFUNDED,
        entityType: AuditEntityType.PAYMENT,
        entityId: result.paymentId,
        metadata: {
          bookingId: result.bookingId,
          scheduleId: options.scheduleId ?? result.scheduleId,
        },
      });
    }
  }

  for (const seatId of result.seatIds) {
    auditLogFrom(auditCtx, {
      action: AuditAction.SEAT_RELEASED,
      entityType: AuditEntityType.SEAT,
      entityId: seatId,
      metadata: {
        bookingId: result.bookingId,
        scheduleId: options.scheduleId ?? result.scheduleId,
        reason: options.seatReleaseReason,
      },
    });
  }
}
