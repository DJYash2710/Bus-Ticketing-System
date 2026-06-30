import { BookingStatus, PaymentStatus, SeatStatus, } from "@prisma/client";
import { prisma } from "../../config/db.js";
import { ApiError } from "../../core/utils/apiError.js";
import { calculateLoyaltyCreditsEarned } from "../../core/utils/pricing.js";
import { AuditAction, AuditEntityType } from "../../core/audit/actions.js";
import { auditLogFrom } from "../../core/audit/auditLog.service.js";
/**
 * Provider-agnostic booking confirmation after external payment succeeds.
 * Used by mock confirm and (future) Stripe webhooks.
 */
export async function finalizeSuccessfulPayment(input) {
    const payment = await prisma.payment.findUnique({
        where: { id: input.paymentId },
        include: {
            booking: {
                include: {
                    seats: true,
                },
            },
        },
    });
    if (!payment) {
        throw new ApiError(404, "Payment not found");
    }
    if (payment.status === PaymentStatus.SUCCESS) {
        return payment;
    }
    if (payment.status !== PaymentStatus.PENDING) {
        throw new ApiError(400, "Payment is not awaiting confirmation");
    }
    if (payment.booking.status === BookingStatus.EXPIRED) {
        throw new ApiError(410, "Seat hold has expired. Please book again.");
    }
    if (payment.booking.status !== BookingStatus.PENDING) {
        throw new ApiError(400, "Booking is not awaiting payment confirmation");
    }
    if (payment.booking.holdExpiresAt &&
        payment.booking.holdExpiresAt < new Date()) {
        throw new ApiError(410, "Seat hold has expired. Please book again.");
    }
    const seatIds = payment.booking.seats.map((item) => item.seatId);
    const result = await prisma.$transaction(async (tx) => {
        const pendingBooking = await tx.booking.findFirst({
            where: {
                id: payment.bookingId,
                status: BookingStatus.PENDING,
                holdExpiresAt: { gte: new Date() },
            },
        });
        if (!pendingBooking) {
            throw new ApiError(410, "Seat hold has expired. Please book again.");
        }
        const updatedSeats = await tx.seat.updateMany({
            where: {
                id: { in: seatIds },
                status: SeatStatus.HELD,
            },
            data: {
                status: SeatStatus.BOOKED,
                heldUntil: null,
            },
        });
        if (updatedSeats.count !== seatIds.length) {
            throw new ApiError(409, "Seats are no longer held for this booking. Please book again.");
        }
        const updatedPayment = await tx.payment.update({
            where: { id: input.paymentId },
            data: {
                status: PaymentStatus.SUCCESS,
                providerRef: input.providerRef,
                paidAt: new Date(),
                rawResponse: input.rawResponse,
            },
        });
        const booking = await tx.booking.update({
            where: { id: payment.bookingId },
            data: {
                status: BookingStatus.CONFIRMED,
                paymentStatus: PaymentStatus.SUCCESS,
            },
        });
        const creditsEarned = calculateLoyaltyCreditsEarned(Number(booking.baseAmount));
        if (creditsEarned > 0) {
            const existingEarn = await tx.loyaltyEvent.findFirst({
                where: {
                    bookingId: booking.id,
                    type: "EARN_BOOKING",
                },
            });
            if (!existingEarn) {
                await tx.loyaltyEvent.create({
                    data: {
                        userId: booking.userId,
                        bookingId: booking.id,
                        type: "EARN_BOOKING",
                        credits: creditsEarned,
                        description: `Earned ${creditsEarned} credits on booking #${booking.id}`,
                    },
                });
                await tx.user.update({
                    where: { id: booking.userId },
                    data: {
                        creditsBalance: { increment: creditsEarned },
                    },
                });
            }
        }
        return { updatedPayment, creditsEarned };
    });
    writeFinalizeAuditLogs({
        audit: input.audit,
        payment: result.updatedPayment,
        bookingId: payment.bookingId,
        scheduleId: payment.booking.scheduleId,
        seatIds: payment.booking.seats.map((item) => item.seatId),
        bookingUserId: payment.booking.userId,
        creditsEarned: result.creditsEarned,
    });
    return result.updatedPayment;
}
function writeFinalizeAuditLogs(input) {
    auditLogFrom(input.audit, {
        action: AuditAction.PAYMENT_SUCCESS,
        entityType: AuditEntityType.PAYMENT,
        entityId: input.payment.id,
        metadata: {
            bookingId: input.bookingId,
            amount: Number(input.payment.amount),
        },
    });
    auditLogFrom(input.audit, {
        action: AuditAction.BOOKING_CONFIRMED,
        entityType: AuditEntityType.BOOKING,
        entityId: input.bookingId,
        metadata: {
            paymentId: input.payment.id,
            amount: Number(input.payment.amount),
        },
    });
    for (const seatId of input.seatIds) {
        auditLogFrom(input.audit, {
            action: AuditAction.SEAT_BOOKED,
            entityType: AuditEntityType.SEAT,
            entityId: seatId,
            metadata: {
                bookingId: input.bookingId,
                scheduleId: input.scheduleId,
            },
        });
    }
    if (input.creditsEarned > 0) {
        auditLogFrom(input.audit, {
            action: AuditAction.CREDITS_EARNED,
            entityType: AuditEntityType.LOYALTY,
            entityId: input.bookingUserId,
            metadata: {
                bookingId: input.bookingId,
                credits: input.creditsEarned,
            },
        });
    }
}
//# sourceMappingURL=finalizeSuccessfulPayment.js.map