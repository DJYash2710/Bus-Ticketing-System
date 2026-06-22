import { BookingStatus, PaymentStatus, SeatStatus, } from "@prisma/client";
import { prisma } from "../../config/db.js";
import { logger } from "../../config/logger.js";
import { reverseBookingIncentives } from "./bookingSideEffects.js";
import { AuditAction, AuditEntityType } from "../../core/audit/actions.js";
import { auditLogFrom } from "../../core/audit/auditLog.service.js";
import { systemAuditContext } from "../../core/audit/requestContext.js";
export async function expireBookingHold(bookingId) {
    const result = await prisma.$transaction(async (tx) => {
        const booking = await tx.booking.findFirst({
            where: {
                id: bookingId,
                status: BookingStatus.PENDING,
            },
            include: { seats: true },
        });
        if (!booking) {
            return false;
        }
        const now = new Date();
        if (booking.holdExpiresAt && booking.holdExpiresAt > now) {
            return false;
        }
        const expired = await tx.booking.updateMany({
            where: {
                id: bookingId,
                status: BookingStatus.PENDING,
            },
            data: {
                status: BookingStatus.EXPIRED,
                expiredAt: now,
                paymentStatus: PaymentStatus.FAILED,
            },
        });
        if (expired.count === 0) {
            return false;
        }
        const seatIds = booking.seats.map((item) => item.seatId);
        if (seatIds.length > 0) {
            await tx.seat.updateMany({
                where: {
                    id: { in: seatIds },
                    status: SeatStatus.HELD,
                },
                data: {
                    status: SeatStatus.AVAILABLE,
                    heldUntil: null,
                },
            });
        }
        await tx.payment.updateMany({
            where: {
                bookingId,
                status: PaymentStatus.PENDING,
            },
            data: { status: PaymentStatus.FAILED },
        });
        await reverseBookingIncentives(tx, booking.id, booking.userId);
        return {
            expired: true,
            bookingId: booking.id,
            userId: booking.userId,
            seatIds,
            scheduleId: booking.scheduleId,
        };
    });
    if (result && typeof result === "object" && result.expired) {
        auditLogFrom(systemAuditContext, {
            action: AuditAction.BOOKING_EXPIRED,
            entityType: AuditEntityType.BOOKING,
            entityId: result.bookingId,
            metadata: {
                scheduleId: result.scheduleId,
                userId: result.userId,
            },
        });
        for (const seatId of result.seatIds) {
            auditLogFrom(systemAuditContext, {
                action: AuditAction.SEAT_RELEASED,
                entityType: AuditEntityType.SEAT,
                entityId: seatId,
                metadata: {
                    bookingId: result.bookingId,
                    reason: "hold_expired",
                },
            });
        }
        auditLogFrom(systemAuditContext, {
            action: AuditAction.PAYMENT_FAILED,
            entityType: AuditEntityType.PAYMENT,
            entityId: result.bookingId,
            metadata: {
                bookingId: result.bookingId,
                reason: "hold_expired",
            },
        });
        return true;
    }
    return false;
}
export async function expireStaleHolds() {
    const now = new Date();
    const staleBookings = await prisma.booking.findMany({
        where: {
            status: BookingStatus.PENDING,
            holdExpiresAt: { lt: now },
        },
        select: { id: true },
        orderBy: { holdExpiresAt: "asc" },
        take: 100,
    });
    let expiredCount = 0;
    for (const booking of staleBookings) {
        const didExpire = await expireBookingHold(booking.id);
        if (didExpire) {
            expiredCount += 1;
        }
    }
    if (expiredCount > 0) {
        logger.info("Expired stale seat holds", {
            category: "booking",
            event: "hold_expired",
            count: expiredCount,
        });
    }
    return expiredCount;
}
const HOLD_EXPIRY_POLL_MS = 60_000;
let holdExpiryTimer = null;
export function startHoldExpiryJob() {
    if (holdExpiryTimer) {
        return;
    }
    void expireStaleHolds();
    holdExpiryTimer = setInterval(() => {
        void expireStaleHolds();
    }, HOLD_EXPIRY_POLL_MS);
    logger.info("Seat hold expiry job started", {
        category: "booking",
        pollIntervalMs: HOLD_EXPIRY_POLL_MS,
    });
}
export function stopHoldExpiryJob() {
    if (holdExpiryTimer) {
        clearInterval(holdExpiryTimer);
        holdExpiryTimer = null;
    }
}
//# sourceMappingURL=holdExpiry.js.map