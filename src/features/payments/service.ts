import { PaymentStatus, BookingStatus } from "@prisma/client";
import { prisma } from "../../config/db.js";
import { ApiError } from "../../core/utils/apiError.js";
import { expireBookingHold, expireStaleHolds } from "../bookings/holdExpiry.js";
import { AuditAction, AuditEntityType } from "../../core/audit/actions.js";
import { auditLogFrom } from "../../core/audit/auditLog.service.js";
import type { AuditContext } from "../../core/audit/requestContext.js";
import { finalizeSuccessfulPayment } from "./finalizeSuccessfulPayment.js";

export async function initiatePayment(
  bookingId: number,
  userId: number,
  audit?: AuditContext,
) {
  await expireStaleHolds();

  const booking = await prisma.booking.findFirst({
    where: { id: bookingId, userId },
  });

  if (!booking) throw new ApiError(404, "Booking not found");

  if (booking.status === BookingStatus.EXPIRED) {
    throw new ApiError(410, "Seat hold has expired. Please book again.");
  }

  if (booking.status === BookingStatus.CANCELLED) {
    throw new ApiError(400, "Cannot pay for a cancelled booking");
  }

  if (booking.status !== BookingStatus.PENDING) {
    throw new ApiError(400, "Booking is not awaiting payment");
  }

  if (booking.holdExpiresAt && booking.holdExpiresAt < new Date()) {
    await expireBookingHold(booking.id);
    throw new ApiError(410, "Seat hold has expired. Please book again.");
  }

  if (booking.paymentStatus === PaymentStatus.SUCCESS) {
    throw new ApiError(400, "Booking is already paid");
  }

  const existing = await prisma.payment.findUnique({ where: { bookingId } });
  if (existing) {
    return existing;
  }

  const payment = await prisma.payment.create({
    data: {
      bookingId,
      provider: "MOCK",
      amount: booking.totalAmount,
      status: PaymentStatus.PENDING,
    },
  });

  auditLogFrom(audit ?? { actorId: userId, actorRole: "USER" }, {
    action: AuditAction.PAYMENT_CREATED,
    entityType: AuditEntityType.PAYMENT,
    entityId: payment.id,
    metadata: {
      bookingId,
      amount: Number(payment.amount),
      provider: payment.provider,
    },
  });

  return payment;
}

export async function confirmPayment(
  paymentId: number,
  userId: number,
  audit?: AuditContext,
) {
  await expireStaleHolds();

  const payment = await prisma.payment.findUnique({
    where: { id: paymentId },
    include: {
      booking: {
        include: {
          seats: true,
        },
      },
    },
  });

  if (!payment) throw new ApiError(404, "Payment not found");
  if (payment.booking.userId !== userId) throw new ApiError(403, "Forbidden");

  if (payment.status === PaymentStatus.SUCCESS) {
    throw new ApiError(400, "Payment already confirmed");
  }

  if (payment.booking.status === BookingStatus.EXPIRED) {
    throw new ApiError(410, "Seat hold has expired. Please book again.");
  }

  if (payment.booking.status !== BookingStatus.PENDING) {
    throw new ApiError(400, "Booking is not awaiting payment confirmation");
  }

  if (
    payment.booking.holdExpiresAt &&
    payment.booking.holdExpiresAt < new Date()
  ) {
    await expireBookingHold(payment.booking.id);
    throw new ApiError(410, "Seat hold has expired. Please book again.");
  }

  const auditCtx = audit ?? { actorId: userId, actorRole: "USER" };

  return finalizeSuccessfulPayment({
    paymentId,
    providerRef: `MOCK-TXN-${Date.now()}`,
    rawResponse: JSON.stringify({ note: "Mock payment confirmed" }),
    audit: auditCtx,
  });
}

export async function getPaymentByBookingId(bookingId: number, userId: number) {
  const booking = await prisma.booking.findFirst({
    where: { id: bookingId, userId },
  });

  if (!booking) throw new ApiError(404, "Booking not found");

  const payment = await prisma.payment.findUnique({
    where: { bookingId },
  });

  if (!payment) throw new ApiError(404, "No payment found for this booking");

  return payment;
}
