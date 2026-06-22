import { BookingStatus, PaymentStatus, ScheduleStatus, SeatStatus, } from "@prisma/client";
import { prisma } from "../../config/db.js";
import { env } from "../../config/env.js";
import { ApiError } from "../../core/utils/apiError.js";
import { calculateCreditsDiscount, } from "../../core/utils/pricing.js";
import { resolveCouponForBooking } from "../coupons/service.js";
export async function createBooking(input) {
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
        throw new ApiError(404, "One or more selected seats were not found for this schedule");
    }
    const unavailableSeats = seats.filter((seat) => seat.status !== SeatStatus.AVAILABLE);
    if (unavailableSeats.length > 0) {
        throw new ApiError(409, `Selected seats are not available: ${unavailableSeats
            .map((seat) => seat.seatNumber)
            .join(", ")}`);
    }
    const baseAmount = Number(schedule.basePrice) * seats.length;
    const taxAmount = 0;
    let couponDiscount = 0;
    let creditsDiscount = 0;
    let couponId;
    const creditsToRedeem = input.creditsToRedeem ?? 0;
    if (input.couponCode) {
        const couponResult = await resolveCouponForBooking(input.couponCode, input.userId, baseAmount);
        couponDiscount = couponResult.discountAmount;
        couponId = couponResult.coupon.id;
    }
    if (creditsToRedeem > 0) {
        const user = await prisma.user.findUnique({ where: { id: input.userId } });
        if (!user)
            throw new ApiError(404, "User not found");
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
    const booking = await prisma.$transaction(async (tx) => {
        const updatedSeats = await tx.seat.updateMany({
            where: {
                id: {
                    in: seats.map((seat) => seat.id),
                },
                status: SeatStatus.AVAILABLE,
            },
            data: {
                status: SeatStatus.BOOKED,
            },
        });
        if (updatedSeats.count !== seats.length) {
            throw new ApiError(409, "Some seats were just booked by another user. Please try again.");
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
                status: BookingStatus.CONFIRMED,
                paymentStatus: "PENDING",
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
    return booking;
}
export async function getBookingById(bookingId, userId) {
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
export async function getMyBookings(userId) {
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
export async function cancelBooking(bookingId, userId) {
    const booking = await prisma.booking.findFirst({
        where: {
            id: bookingId,
            userId,
        },
        include: {
            seats: true,
        },
    });
    if (!booking) {
        throw new ApiError(404, "Booking not found");
    }
    if (booking.status === BookingStatus.CANCELLED) {
        throw new ApiError(400, "Booking is already cancelled");
    }
    const result = await prisma.$transaction(async (tx) => {
        const bookingUpdate = {
            status: BookingStatus.CANCELLED,
            cancelledAt: new Date(),
        };
        if (booking.paymentStatus === PaymentStatus.SUCCESS) {
            bookingUpdate.paymentStatus = PaymentStatus.REFUNDED;
            await tx.payment.updateMany({
                where: { bookingId: booking.id, status: PaymentStatus.SUCCESS },
                data: {
                    status: PaymentStatus.REFUNDED,
                    refundedAt: new Date(),
                },
            });
            const earnEvent = await tx.loyaltyEvent.findFirst({
                where: { bookingId: booking.id, type: "EARN_BOOKING" },
            });
            if (earnEvent && earnEvent.credits > 0) {
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
        const redeemEvent = await tx.loyaltyEvent.findFirst({
            where: { bookingId: booking.id, type: "REDEEM_BOOKING" },
        });
        if (redeemEvent && redeemEvent.credits < 0) {
            const creditsToRestore = Math.abs(redeemEvent.credits);
            await tx.user.update({
                where: { id: booking.userId },
                data: { creditsBalance: { increment: creditsToRestore } },
            });
            await tx.loyaltyEvent.create({
                data: {
                    userId: booking.userId,
                    bookingId: booking.id,
                    type: "ADJUSTMENT",
                    credits: creditsToRestore,
                    description: `Restored ${creditsToRestore} credits after booking #${booking.id} cancellation`,
                },
            });
        }
        await tx.booking.update({
            where: { id: booking.id },
            data: bookingUpdate,
        });
        await tx.seat.updateMany({
            where: {
                id: {
                    in: booking.seats.map((item) => item.seatId),
                },
            },
            data: {
                status: SeatStatus.AVAILABLE,
            },
        });
        return tx.booking.findUnique({
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
    });
    return result;
}
export async function getOperatorBookings(busOperatorId) {
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
//# sourceMappingURL=service.js.map