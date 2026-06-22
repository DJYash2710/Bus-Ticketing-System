// src/features/schedules/service.ts
import { v4 as uuidv4 } from "uuid";
import { prisma } from "../../config/db.js";
import { ApiError } from "../../core/utils/apiError.js";
import { isOperator, requireOperatorFleetId, } from "../../core/utils/operatorScope.js";
import { ScheduleStatus, SeatStatus } from "@prisma/client";
import { ROUTE_DURATION_REQUIRED_MSG } from "./validators.js";
import { AuditAction, AuditEntityType } from "../../core/audit/actions.js";
import { auditLogFrom } from "../../core/audit/auditLog.service.js";
import { cancelScheduleCascade } from "./cancelCascade.js";
const scheduleInclude = {
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
};
function assertBusOwnership(bus, caller) {
    if (!isOperator(caller))
        return;
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
function formatSchedule(schedule, bookedSeatsCount) {
    const { _count, ...rest } = schedule;
    return {
        ...rest,
        bookingsCount: _count?.bookings ?? 0,
        seatsCount: _count?.seats ?? 0,
        bookedSeatsCount: bookedSeatsCount ?? _count?.bookings ?? 0,
    };
}
function scheduleEndTime(departure, arrival) {
    if (arrival)
        return arrival;
    return new Date(departure.getTime() + 60 * 60 * 1000);
}
function requireRouteDuration(route) {
    if (route.estimatedDurationMinutes == null) {
        throw new ApiError(400, ROUTE_DURATION_REQUIRED_MSG);
    }
    return route.estimatedDurationMinutes;
}
function computeArrivalTime(departure, durationMinutes) {
    return new Date(departure.getTime() + durationMinutes * 60 * 1000);
}
function rangesOverlap(startA, endA, startB, endB) {
    return startA < endB && startB < endA;
}
async function findConflictingSchedule(busId, departure, arrival, excludeIds) {
    const end = scheduleEndTime(departure, arrival);
    const candidates = await prisma.schedule.findMany({
        where: {
            busId,
            id: { notIn: excludeIds },
            status: { not: ScheduleStatus.CANCELLED },
        },
        include: scheduleInclude,
    });
    for (const candidate of candidates) {
        const candidateEnd = scheduleEndTime(candidate.departureTime, candidate.arrivalTime);
        if (rangesOverlap(departure, end, candidate.departureTime, candidateEnd)) {
            return formatSchedule(candidate);
        }
    }
    return null;
}
function generateOccurrenceDates(start, recurrence) {
    const endLimit = new Date(recurrence.endDate);
    const oneYearOut = new Date(start);
    oneYearOut.setFullYear(oneYearOut.getFullYear() + 1);
    const cap = endLimit < oneYearOut ? endLimit : oneYearOut;
    const durationMs = start.getTime() -
        new Date(start.getFullYear(), start.getMonth(), start.getDate(), start.getHours(), start.getMinutes(), start.getSeconds()).getTime();
    const dates = [];
    const { frequency } = recurrence;
    if (frequency === "DAILY") {
        const cursor = new Date(start);
        while (cursor <= cap) {
            dates.push(new Date(cursor));
            cursor.setDate(cursor.getDate() + 1);
        }
        return dates;
    }
    if (frequency === "WEEKLY") {
        const days = recurrence.daysOfWeek && recurrence.daysOfWeek.length > 0
            ? [...recurrence.daysOfWeek].sort((a, b) => a - b)
            : [start.getDay()];
        const cursor = new Date(start);
        cursor.setHours(start.getHours(), start.getMinutes(), start.getSeconds(), 0);
        cursor.setDate(cursor.getDate() - cursor.getDay());
        while (cursor <= cap) {
            for (const dow of days) {
                const occurrence = new Date(cursor);
                occurrence.setDate(cursor.getDate() + dow);
                occurrence.setHours(start.getHours(), start.getMinutes(), start.getSeconds(), 0);
                if (occurrence >= start && occurrence <= cap) {
                    dates.push(new Date(occurrence));
                }
            }
            cursor.setDate(cursor.getDate() + 7);
        }
        return dates.sort((a, b) => a.getTime() - b.getTime());
    }
    // MONTHLY — same day-of-month as start
    const cursor = new Date(start);
    while (cursor <= cap) {
        dates.push(new Date(cursor));
        const day = cursor.getDate();
        cursor.setMonth(cursor.getMonth() + 1);
        if (cursor.getDate() !== day) {
            cursor.setDate(0);
        }
    }
    void durationMs;
    return dates;
}
async function createScheduleWithSeats(tx, data) {
    const created = await tx.schedule.create({
        data: {
            routeId: data.routeId,
            busId: data.busId,
            departureTime: data.departureTime,
            arrivalTime: data.arrivalTime,
            basePrice: data.basePrice,
            status: data.status,
            color: data.color,
            recurrenceGroupId: data.recurrenceGroupId,
        },
        include: scheduleInclude,
    });
    const seatDefs = generateSeats(data.busCapacity);
    await tx.seat.createMany({
        data: seatDefs.map((seat) => ({
            scheduleId: created.id,
            seatNumber: seat.seatNumber,
            row: seat.row,
            col: seat.col,
            deck: seat.deck,
            status: seat.status,
        })),
    });
    return formatSchedule(created);
}
export async function createSchedule(input, caller, audit) {
    const route = await prisma.route.findUnique({
        where: { id: input.routeId },
    });
    if (!route)
        throw new ApiError(404, "Route not found");
    const bus = await prisma.bus.findUnique({ where: { id: input.busId } });
    if (!bus)
        throw new ApiError(404, "Bus not found");
    assertBusOwnership(bus, caller);
    const durationMinutes = requireRouteDuration(route);
    const departure = new Date(input.departureTime);
    const arrival = computeArrivalTime(departure, durationMinutes);
    const color = input.color ?? "#4F46E5";
    const status = input.status ?? ScheduleStatus.ACTIVE;
    const durationMs = durationMinutes * 60 * 1000;
    if (!input.recurrence) {
        const conflict = await findConflictingSchedule(input.busId, departure, arrival, []);
        if (conflict) {
            throw new ApiError(409, "Schedule conflicts with an existing trip", {
                conflictingSchedule: conflict,
            });
        }
        const schedule = await prisma.$transaction(async (tx) => createScheduleWithSeats(tx, {
            routeId: input.routeId,
            busId: input.busId,
            departureTime: departure,
            arrivalTime: arrival,
            basePrice: input.basePrice,
            status,
            color,
            recurrenceGroupId: null,
            busCapacity: bus.capacity,
        }));
        const singleResult = {
            schedule,
            schedules: [schedule],
            recurrenceGroupId: null,
            count: 1,
        };
        auditLogFrom(audit ?? { actorId: caller.id, actorRole: caller.role }, {
            action: AuditAction.SCHEDULE_CREATED,
            entityType: AuditEntityType.SCHEDULE,
            entityId: schedule.id,
            metadata: {
                routeId: input.routeId,
                busId: input.busId,
                departureTime: schedule.departureTime,
            },
        });
        return singleResult;
    }
    const recurrenceGroupId = uuidv4();
    const occurrenceDates = generateOccurrenceDates(departure, input.recurrence);
    if (occurrenceDates.length === 0) {
        throw new ApiError(400, "Recurrence produced no occurrences");
    }
    for (const occDep of occurrenceDates) {
        const occArr = new Date(occDep.getTime() + durationMs);
        const conflict = await findConflictingSchedule(input.busId, occDep, occArr, []);
        if (conflict) {
            throw new ApiError(409, `Schedule conflicts on ${occDep.toISOString()}`, { conflictingSchedule: conflict });
        }
    }
    const schedules = await prisma.$transaction(async (tx) => {
        const created = [];
        for (const occDep of occurrenceDates) {
            const occArr = new Date(occDep.getTime() + durationMs);
            const row = await createScheduleWithSeats(tx, {
                routeId: input.routeId,
                busId: input.busId,
                departureTime: occDep,
                arrivalTime: occArr,
                basePrice: input.basePrice,
                status,
                color,
                recurrenceGroupId,
                busCapacity: bus.capacity,
            });
            created.push(row);
        }
        return created;
    });
    const recurrenceResult = {
        schedule: schedules[0],
        schedules,
        recurrenceGroupId,
        count: schedules.length,
    };
    const auditCtx = audit ?? { actorId: caller.id, actorRole: caller.role };
    for (const row of schedules) {
        auditLogFrom(auditCtx, {
            action: AuditAction.SCHEDULE_CREATED,
            entityType: AuditEntityType.SCHEDULE,
            entityId: row.id,
            metadata: {
                routeId: input.routeId,
                busId: input.busId,
                departureTime: row.departureTime,
                recurrenceGroupId,
            },
        });
    }
    return recurrenceResult;
}
export async function listSchedules(filters, caller) {
    const where = {};
    if (filters.routeId)
        where.routeId = filters.routeId;
    if (filters.busId)
        where.busId = filters.busId;
    if (filters.status)
        where.status = filters.status;
    if (filters.from || filters.to) {
        where.departureTime = {};
        if (filters.from) {
            const start = new Date(filters.from);
            start.setHours(0, 0, 0, 0);
            where.departureTime.gte = start;
        }
        if (filters.to) {
            const end = new Date(filters.to);
            end.setHours(23, 59, 59, 999);
            where.departureTime.lte = end;
        }
    }
    else if (filters.date) {
        const start = new Date(filters.date);
        start.setHours(0, 0, 0, 0);
        const end = new Date(filters.date);
        end.setHours(23, 59, 59, 999);
        where.departureTime = { gte: start, lte: end };
    }
    if (isOperator(caller)) {
        where.bus = { operatorId: requireOperatorFleetId(caller) };
    }
    const schedules = await prisma.schedule.findMany({
        where,
        include: scheduleInclude,
        orderBy: { departureTime: "asc" },
    });
    const ids = schedules.map((s) => s.id);
    const bookedBySchedule = ids.length > 0
        ? await prisma.seat.groupBy({
            by: ["scheduleId"],
            where: {
                scheduleId: { in: ids },
                status: SeatStatus.BOOKED,
            },
            _count: { _all: true },
        })
        : [];
    const bookedMap = new Map(bookedBySchedule.map((row) => [row.scheduleId, row._count._all]));
    return schedules.map((s) => formatSchedule(s, bookedMap.get(s.id) ?? 0));
}
export async function getScheduleById(id, caller) {
    const schedule = await prisma.schedule.findUnique({
        where: { id },
        include: {
            ...scheduleInclude,
            seats: { orderBy: [{ row: "asc" }, { col: "asc" }] },
        },
    });
    if (!schedule)
        throw new ApiError(404, "Schedule not found");
    assertBusOwnership(schedule.bus, caller);
    const { _count, ...rest } = schedule;
    return {
        ...rest,
        bookingsCount: _count?.bookings ?? 0,
        seatsCount: _count?.seats ?? 0,
    };
}
async function resolveTargetSchedules(schedule, scope) {
    if (!schedule.recurrenceGroupId || scope === "this") {
        return [schedule.id];
    }
    if (scope === "all") {
        const rows = await prisma.schedule.findMany({
            where: {
                recurrenceGroupId: schedule.recurrenceGroupId,
                isRecurrenceException: false,
            },
            select: { id: true },
        });
        const ids = rows.map((r) => r.id);
        if (!ids.includes(schedule.id))
            ids.push(schedule.id);
        return ids;
    }
    // following
    const rows = await prisma.schedule.findMany({
        where: {
            recurrenceGroupId: schedule.recurrenceGroupId,
            departureTime: { gte: schedule.departureTime },
            isRecurrenceException: false,
        },
        select: { id: true },
    });
    const ids = rows.map((r) => r.id);
    if (!ids.includes(schedule.id))
        ids.push(schedule.id);
    return ids;
}
export async function updateSchedule(id, input, caller, audit) {
    const schedule = await prisma.schedule.findUnique({
        where: { id },
        include: {
            bus: true,
            route: true,
            _count: { select: { bookings: true } },
        },
    });
    if (!schedule)
        throw new ApiError(404, "Schedule not found");
    assertBusOwnership(schedule.bus, caller);
    const durationMinutes = requireRouteDuration(schedule.route);
    const scope = input.scope ?? "this";
    const targetIds = await resolveTargetSchedules(schedule, scope);
    const timeChanging = input.departureTime !== undefined;
    const newDeparture = input.departureTime
        ? new Date(input.departureTime)
        : schedule.departureTime;
    const newArrival = input.departureTime !== undefined
        ? computeArrivalTime(newDeparture, durationMinutes)
        : schedule.arrivalTime;
    if (newArrival && newArrival <= newDeparture) {
        throw new ApiError(400, "arrivalTime must be after departureTime");
    }
    const depDeltaMs = input.departureTime !== undefined
        ? newDeparture.getTime() - schedule.departureTime.getTime()
        : 0;
    const targets = await prisma.schedule.findMany({
        where: { id: { in: targetIds } },
        include: { bus: true },
    });
    if (timeChanging) {
        for (const target of targets) {
            const tDep = target.id === schedule.id && input.departureTime !== undefined
                ? newDeparture
                : input.departureTime !== undefined
                    ? new Date(target.departureTime.getTime() + depDeltaMs)
                    : target.departureTime;
            const tArr = input.departureTime !== undefined
                ? computeArrivalTime(tDep, durationMinutes)
                : target.arrivalTime;
            const conflict = await findConflictingSchedule(target.busId, tDep, tArr, targetIds);
            if (conflict) {
                throw new ApiError(409, "Schedule conflicts with an existing trip", {
                    conflictingSchedule: conflict,
                });
            }
        }
    }
    if (input.status === ScheduleStatus.CANCELLED) {
        const auditCtx = audit ?? { actorId: caller.id, actorRole: caller.role };
        let lastResult = await cancelScheduleCascade(id, auditCtx);
        for (const targetId of targetIds) {
            if (targetId === id)
                continue;
            lastResult = await cancelScheduleCascade(targetId, auditCtx);
        }
        const updated = await prisma.schedule.findUnique({
            where: { id },
            include: scheduleInclude,
        });
        return {
            schedule: formatSchedule(updated),
            affectedCount: targetIds.length,
            cancellation: lastResult.summary,
            alreadyCancelled: lastResult.alreadyCancelled,
        };
    }
    const updateData = {};
    if (input.basePrice !== undefined)
        updateData.basePrice = input.basePrice;
    if (input.status !== undefined)
        updateData.status = input.status;
    if (input.color !== undefined)
        updateData.color = input.color;
    let affectedCount = 0;
    await prisma.$transaction(async (tx) => {
        for (const target of targets) {
            const data = { ...updateData };
            if (timeChanging) {
                if (target.id === schedule.id && input.departureTime !== undefined) {
                    data.departureTime = newDeparture;
                }
                else if (input.departureTime !== undefined) {
                    data.departureTime = new Date(target.departureTime.getTime() + depDeltaMs);
                }
                if (input.departureTime !== undefined) {
                    const tDep = data.departureTime ?? target.departureTime;
                    data.arrivalTime = computeArrivalTime(tDep, durationMinutes);
                }
            }
            if (scope === "this" &&
                target.id === schedule.id &&
                schedule.recurrenceGroupId) {
                data.isRecurrenceException = true;
            }
            await tx.schedule.update({ where: { id: target.id }, data });
            affectedCount++;
        }
    });
    const updated = await prisma.schedule.findUnique({
        where: { id },
        include: scheduleInclude,
    });
    const auditCtx = audit ?? { actorId: caller.id, actorRole: caller.role };
    const action = input.status === ScheduleStatus.CANCELLED
        ? AuditAction.SCHEDULE_CANCELLED
        : AuditAction.SCHEDULE_UPDATED;
    auditLogFrom(auditCtx, {
        action,
        entityType: AuditEntityType.SCHEDULE,
        entityId: id,
        metadata: {
            scope,
            affectedCount,
            status: input.status ?? schedule.status,
        },
    });
    return {
        schedule: formatSchedule(updated),
        affectedCount,
    };
}
export async function deleteSchedule(id, caller, scope = "this") {
    const schedule = await prisma.schedule.findUnique({
        where: { id },
        include: {
            bus: true,
            bookings: true,
            _count: { select: { bookings: true } },
        },
    });
    if (!schedule)
        throw new ApiError(404, "Schedule not found");
    assertBusOwnership(schedule.bus, caller);
    const targetIds = await resolveTargetSchedules(schedule, scope);
    const targets = await prisma.schedule.findMany({
        where: { id: { in: targetIds } },
        include: { _count: { select: { bookings: true } } },
    });
    const withBookings = targets.filter((t) => t._count.bookings > 0);
    if (withBookings.length > 0) {
        throw new ApiError(400, `Cannot delete schedule(s) with existing bookings (${withBookings.length} affected)`);
    }
    await prisma.$transaction(async (tx) => {
        await tx.seat.deleteMany({ where: { scheduleId: { in: targetIds } } });
        await tx.schedule.deleteMany({ where: { id: { in: targetIds } } });
    });
    return {
        message: "Schedule deleted successfully",
        affectedCount: targetIds.length,
    };
}
//# sourceMappingURL=service.js.map