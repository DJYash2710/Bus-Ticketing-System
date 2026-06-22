import { PaymentStatus, BookingStatus, SeatStatus } from "@prisma/client";
import { prisma } from "../../config/db.js";
import { ApiError } from "../../core/utils/apiError.js";
import { calculateLoyaltyCreditsEarned } from "../../core/utils/pricing.js";
import { expireBookingHold, expireStaleHolds } from "../bookings/holdExpiry.js";
import { AuditAction, AuditEntityType } from "../../core/audit/actions.js";
import { auditLogFrom } from "../../core/audit/auditLog.service.js";
export async function initiatePayment(bookingId, userId, audit) {
    await expireStaleHolds();
    const booking = await prisma.booking.findFirst({
        where: { id: bookingId, userId },
    });
    if (!booking)
        throw new ApiError(404, "Booking not found");
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
export async function confirmPayment(paymentId, userId, audit) {
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
    if (!payment)
        throw new ApiError(404, "Payment not found");
    if (payment.booking.userId !== userId)
        throw new ApiError(403, "Forbidden");
    if (payment.status === PaymentStatus.SUCCESS) {
        throw new ApiError(400, "Payment already confirmed");
    }
    if (payment.booking.status === BookingStatus.EXPIRED) {
        throw new ApiError(410, "Seat hold has expired. Please book again.");
    }
    if (payment.booking.status !== BookingStatus.PENDING) {
        throw new ApiError(400, "Booking is not awaiting payment confirmation");
    }
    if (payment.booking.holdExpiresAt &&
        payment.booking.holdExpiresAt < new Date()) {
        await expireBookingHold(payment.booking.id);
        throw new ApiError(410, "Seat hold has expired. Please book again.");
    }
    const seatIds = payment.booking.seats.map((item) => item.seatId);
    const auditCtx = audit ?? { actorId: userId, actorRole: "USER" };
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
            where: { id: paymentId },
            data: {
                status: PaymentStatus.SUCCESS,
                providerRef: `MOCK-TXN-${Date.now()}`,
                paidAt: new Date(),
                rawResponse: JSON.stringify({ note: "Mock payment confirmed" }),
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
        return { updatedPayment, booking, creditsEarned };
    });
    auditLogFrom(auditCtx, {
        action: AuditAction.PAYMENT_SUCCESS,
        entityType: AuditEntityType.PAYMENT,
        entityId: result.updatedPayment.id,
        metadata: {
            bookingId: payment.bookingId,
            amount: Number(result.updatedPayment.amount),
        },
    });
    auditLogFrom(auditCtx, {
        action: AuditAction.BOOKING_CONFIRMED,
        entityType: AuditEntityType.BOOKING,
        entityId: payment.bookingId,
        metadata: {
            paymentId: result.updatedPayment.id,
            amount: Number(result.updatedPayment.amount),
        },
    });
    for (const seatLink of payment.booking.seats) {
        auditLogFrom(auditCtx, {
            action: AuditAction.SEAT_BOOKED,
            entityType: AuditEntityType.SEAT,
            entityId: seatLink.seatId,
            metadata: {
                bookingId: payment.bookingId,
                scheduleId: payment.booking.scheduleId,
            },
        });
    }
    if (result.creditsEarned > 0) {
        auditLogFrom(auditCtx, {
            action: AuditAction.CREDITS_EARNED,
            entityType: AuditEntityType.LOYALTY,
            entityId: userId,
            metadata: {
                bookingId: payment.bookingId,
                credits: result.creditsEarned,
            },
        });
    }
    return result.updatedPayment;
}
export async function getPaymentByBookingId(bookingId, userId) {
    const booking = await prisma.booking.findFirst({
        where: { id: bookingId, userId },
    });
    if (!booking)
        throw new ApiError(404, "Booking not found");
    const payment = await prisma.payment.findUnique({
        where: { bookingId },
    });
    if (!payment)
        throw new ApiError(404, "No payment found for this booking");
    return payment;
}
//# sourceMappingURL=service.js.map