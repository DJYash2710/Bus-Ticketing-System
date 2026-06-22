import { SeatStatus } from "@prisma/client";
import { prisma } from "../../config/db.js";
import { ApiError } from "../../core/utils/apiError.js";
import { isOperator, requireOperatorFleetId, } from "../../core/utils/operatorScope.js";
import { expireStaleHolds } from "../bookings/holdExpiry.js";
import { AuditAction, AuditEntityType } from "../../core/audit/actions.js";
import { auditLogFrom } from "../../core/audit/auditLog.service.js";
export async function listSeatsBySchedule(filters) {
    await expireStaleHolds();
    const schedule = await prisma.schedule.findUnique({
        where: { id: filters.scheduleId },
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
    const whereClause = {
        scheduleId: filters.scheduleId,
    };
    if (filters.status) {
        whereClause.status = filters.status;
    }
    const seats = await prisma.seat.findMany({
        where: whereClause,
        orderBy: [{ row: "asc" }, { col: "asc" }, { seatNumber: "asc" }],
    });
    const summary = {
        total: seats.length,
        available: seats.filter((s) => s.status === SeatStatus.AVAILABLE).length,
        held: seats.filter((s) => s.status === SeatStatus.HELD).length,
        booked: seats.filter((s) => s.status === SeatStatus.BOOKED).length,
    };
    return {
        schedule: {
            id: schedule.id,
            departureTime: schedule.departureTime,
            arrivalTime: schedule.arrivalTime,
            basePrice: schedule.basePrice,
            status: schedule.status,
            route: {
                id: schedule.route.id,
                code: schedule.route.code,
                fromCity: schedule.route.fromCity,
                toCity: schedule.route.toCity,
            },
            bus: schedule.bus,
        },
        summary,
        seats,
    };
}
export async function getSeatById(id) {
    const seat = await prisma.seat.findUnique({
        where: { id },
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
            bookingSeats: {
                include: {
                    booking: true,
                },
            },
        },
    });
    if (!seat) {
        throw new ApiError(404, "Seat not found");
    }
    return seat;
}
export async function updateSeatStatus(id, input, caller, audit) {
    const seat = await prisma.seat.findUnique({
        where: { id },
        include: {
            bookingSeats: true,
            schedule: {
                include: {
                    bus: true,
                },
            },
        },
    });
    if (!seat) {
        throw new ApiError(404, "Seat not found");
    }
    if (isOperator(caller)) {
        const fleetId = requireOperatorFleetId(caller);
        if (seat.schedule.bus.operatorId !== fleetId) {
            throw new ApiError(403, "You do not have permission to update this seat");
        }
    }
    if (seat.bookingSeats.length > 0 && input.status === SeatStatus.AVAILABLE) {
        throw new ApiError(400, "Cannot mark a booked seat as AVAILABLE manually when booking records exist");
    }
    const updatedSeat = await prisma.seat.update({
        where: { id },
        data: {
            status: input.status,
            ...(input.status === SeatStatus.HELD
                ? {}
                : { heldUntil: null }),
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
        },
    });
    auditLogFrom(audit ?? { actorId: caller.id, actorRole: caller.role }, {
        action: AuditAction.SEAT_STATUS_CHANGED,
        entityType: AuditEntityType.SEAT,
        entityId: id,
        metadata: {
            scheduleId: seat.scheduleId,
            seatNumber: seat.seatNumber,
            previousStatus: seat.status,
            newStatus: input.status,
        },
    });
    return updatedSeat;
}
//# sourceMappingURL=service.js.map