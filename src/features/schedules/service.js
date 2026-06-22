// src/features/schedules/service.ts
import { prisma } from "../../config/db.js";
import { ApiError } from "../../core/utils/apiError.js";
import { isOperator, requireOperatorFleetId, } from "../../core/utils/operatorScope.js";
import { ScheduleStatus, SeatStatus } from "@prisma/client";
function assertBusOwnership(bus, caller) {
    if (!isOperator(caller)) {
        return;
    }
    const fleetId = requireOperatorFleetId(caller);
    if (bus.operatorId !== fleetId) {
        throw new ApiError(403, "You do not have permission to access this schedule");
    }
}
function generateSeats(capacity) {
    const cols = ["A", "B", "C", "D"];
    const seats = [];
    for (let r = 0; seats.length < capacity; r++) {
        for (let c = 0; c < 4 && seats.length < capacity; c++) {
            seats.push({
                seatNumber: `${r + 1}${cols[c]}`,
                row: r,
                col: c,
                deck: "LOWER",
                status: SeatStatus.AVAILABLE,
            });
        }
    }
    return seats;
}
export async function createSchedule(input, caller) {
    const route = await prisma.route.findUnique({
        where: { id: input.routeId },
    });
    if (!route) {
        throw new ApiError(404, "Route not found");
    }
    const bus = await prisma.bus.findUnique({
        where: { id: input.busId },
    });
    if (!bus) {
        throw new ApiError(404, "Bus not found");
    }
    assertBusOwnership(bus, caller);
    const departure = new Date(input.departureTime);
    const arrival = input.arrivalTime ? new Date(input.arrivalTime) : null;
    if (arrival && arrival <= departure) {
        throw new ApiError(400, "arrivalTime must be after departureTime");
    }
    const existing = await prisma.schedule.findFirst({
        where: {
            busId: input.busId,
            departureTime: departure,
        },
    });
    if (existing) {
        throw new ApiError(409, "This bus already has a schedule at the same departure time");
    }
    const schedule = await prisma.$transaction(async (tx) => {
        const createdSchedule = await tx.schedule.create({
            data: {
                routeId: input.routeId,
                busId: input.busId,
                departureTime: departure,
                arrivalTime: arrival,
                basePrice: input.basePrice,
                status: input.status ?? ScheduleStatus.ACTIVE,
            },
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
        const seatDefs = generateSeats(bus.capacity);
        await tx.seat.createMany({
            data: seatDefs.map((seat) => ({
                scheduleId: createdSchedule.id,
                seatNumber: seat.seatNumber,
                row: seat.row,
                col: seat.col,
                deck: seat.deck,
                status: seat.status,
            })),
        });
        return createdSchedule;
    });
    return schedule;
}
export async function listSchedules(filters, caller) {
    const where = {
        routeId: filters.routeId || undefined,
        busId: filters.busId || undefined,
        status: filters.status || undefined,
    };
    if (filters.date) {
        const start = new Date(filters.date);
        start.setHours(0, 0, 0, 0);
        const end = new Date(filters.date);
        end.setHours(23, 59, 59, 999);
        where.departureTime = {
            gte: start,
            lte: end,
        };
    }
    if (isOperator(caller)) {
        where.bus = {
            operatorId: requireOperatorFleetId(caller),
        };
    }
    return prisma.schedule.findMany({
        where,
        include: {
            route: {
                include: {
                    fromCity: true,
                    toCity: true,
                },
            },
            bus: true,
            _count: {
                select: {
                    seats: true,
                    bookings: true,
                },
            },
        },
        orderBy: {
            departureTime: "asc",
        },
    });
}
export async function getScheduleById(id, caller) {
    const schedule = await prisma.schedule.findUnique({
        where: { id },
        include: {
            route: {
                include: {
                    fromCity: true,
                    toCity: true,
                },
            },
            bus: true,
            seats: {
                orderBy: [{ row: "asc" }, { col: "asc" }],
            },
            bookings: true,
        },
    });
    if (!schedule) {
        throw new ApiError(404, "Schedule not found");
    }
    assertBusOwnership(schedule.bus, caller);
    return schedule;
}
export async function updateSchedule(id, input, caller) {
    const schedule = await prisma.schedule.findUnique({
        where: { id },
        include: { bus: true },
    });
    if (!schedule) {
        throw new ApiError(404, "Schedule not found");
    }
    assertBusOwnership(schedule.bus, caller);
    const departure = input.departureTime
        ? new Date(input.departureTime)
        : schedule.departureTime;
    const arrival = input.arrivalTime !== undefined
        ? input.arrivalTime
            ? new Date(input.arrivalTime)
            : null
        : schedule.arrivalTime;
    if (arrival && arrival <= departure) {
        throw new ApiError(400, "arrivalTime must be after departureTime");
    }
    return prisma.schedule.update({
        where: { id },
        data: {
            departureTime: departure,
            arrivalTime: arrival,
            basePrice: input.basePrice ?? schedule.basePrice,
            status: input.status ?? schedule.status,
        },
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
}
export async function deleteSchedule(id, caller) {
    const schedule = await prisma.schedule.findUnique({
        where: { id },
        include: {
            bus: true,
            bookings: true,
        },
    });
    if (!schedule) {
        throw new ApiError(404, "Schedule not found");
    }
    assertBusOwnership(schedule.bus, caller);
    if (schedule.bookings.length > 0) {
        throw new ApiError(400, "Cannot delete schedule with existing bookings");
    }
    await prisma.$transaction(async (tx) => {
        await tx.seat.deleteMany({
            where: { scheduleId: id },
        });
        await tx.schedule.delete({
            where: { id },
        });
    });
    return { message: "Schedule deleted successfully" };
}
//# sourceMappingURL=service.js.map