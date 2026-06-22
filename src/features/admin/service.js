import { BookingStatus, PaymentStatus, Prisma } from "@prisma/client";
import { prisma } from "../../config/db.js";
import { ApiError } from "../../core/utils/apiError.js";
const bookingInclude = {
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
    payment: true,
};
export async function listAdminBookings(input) {
    const where = {};
    if (input.status)
        where.status = input.status;
    if (input.paymentStatus)
        where.paymentStatus = input.paymentStatus;
    if (input.userId)
        where.userId = input.userId;
    if (input.fromDate || input.toDate) {
        where.bookedAt = {};
        if (input.fromDate) {
            where.bookedAt.gte = new Date(input.fromDate);
        }
        if (input.toDate) {
            const end = new Date(input.toDate);
            end.setHours(23, 59, 59, 999);
            where.bookedAt.lte = end;
        }
    }
    const skip = (input.page - 1) * input.limit;
    const [bookings, total] = await Promise.all([
        prisma.booking.findMany({
            where,
            include: bookingInclude,
            orderBy: { bookedAt: "desc" },
            skip,
            take: input.limit,
        }),
        prisma.booking.count({ where }),
    ]);
    return {
        bookings,
        pagination: {
            page: input.page,
            limit: input.limit,
            total,
            totalPages: Math.ceil(total / input.limit),
        },
    };
}
export async function getAdminBookingById(bookingId) {
    const booking = await prisma.booking.findUnique({
        where: { id: bookingId },
        include: bookingInclude,
    });
    if (!booking) {
        throw new ApiError(404, "Booking not found");
    }
    return booking;
}
export async function getReportsSummary(input) {
    const where = {};
    if (input.fromDate || input.toDate) {
        where.bookedAt = {};
        if (input.fromDate) {
            where.bookedAt.gte = new Date(input.fromDate);
        }
        if (input.toDate) {
            const end = new Date(input.toDate);
            end.setHours(23, 59, 59, 999);
            where.bookedAt.lte = end;
        }
    }
    if (input.busOperatorId) {
        where.schedule = {
            bus: {
                operatorId: input.busOperatorId,
            },
        };
    }
    const [totalBookings, confirmedBookings, cancelledBookings, paidBookings, pendingPayments, refundedPayments, revenueAgg, commissionAgg,] = await Promise.all([
        prisma.booking.count({ where }),
        prisma.booking.count({
            where: { ...where, status: BookingStatus.CONFIRMED },
        }),
        prisma.booking.count({
            where: { ...where, status: BookingStatus.CANCELLED },
        }),
        prisma.booking.count({
            where: { ...where, paymentStatus: PaymentStatus.SUCCESS },
        }),
        prisma.booking.count({
            where: { ...where, paymentStatus: PaymentStatus.PENDING },
        }),
        prisma.booking.count({
            where: { ...where, paymentStatus: PaymentStatus.REFUNDED },
        }),
        prisma.booking.aggregate({
            where: { ...where, paymentStatus: PaymentStatus.SUCCESS },
            _sum: { totalAmount: true },
        }),
        prisma.booking.aggregate({
            where: { ...where, paymentStatus: PaymentStatus.SUCCESS },
            _sum: { commissionAmount: true },
        }),
    ]);
    return {
        period: {
            fromDate: input.fromDate ?? null,
            toDate: input.toDate ?? null,
        },
        bookings: {
            total: totalBookings,
            confirmed: confirmedBookings,
            cancelled: cancelledBookings,
        },
        payments: {
            paid: paidBookings,
            pending: pendingPayments,
            refunded: refundedPayments,
        },
        revenue: {
            totalCollected: Number(revenueAgg._sum.totalAmount ?? 0),
            totalCommission: Number(commissionAgg._sum.commissionAmount ?? 0),
        },
    };
}
//# sourceMappingURL=service.js.map