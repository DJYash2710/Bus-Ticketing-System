// src/features/routes/service.ts
import { prisma } from "../../config/db.js";
import { ApiError } from "../../core/utils/apiError.js";
import { Prisma } from "@prisma/client";
import { AuditAction, AuditEntityType } from "../../core/audit/actions.js";
import { auditLogFrom } from "../../core/audit/auditLog.service.js";
export async function createRoute(input, audit) {
    if (input.fromCityId === input.toCityId) {
        throw new ApiError(400, "fromCityId and toCityId cannot be the same");
    }
    // Ensure cities exist
    const [fromCity, toCity] = await Promise.all([
        prisma.city.findUnique({ where: { id: input.fromCityId } }),
        prisma.city.findUnique({ where: { id: input.toCityId } }),
    ]);
    if (!fromCity || !toCity) {
        throw new ApiError(400, "Invalid fromCityId or toCityId");
    }
    const existing = await prisma.route.findFirst({
        where: {
            fromCityId: input.fromCityId,
            toCityId: input.toCityId,
        },
    });
    if (existing) {
        throw new ApiError(409, "Route between these cities already exists");
    }
    const route = await prisma.route.create({
        data: {
            code: input.code,
            fromCityId: input.fromCityId,
            toCityId: input.toCityId,
            distanceKm: input.distanceKm ?? null,
            durationMin: input.durationMin ?? null,
            estimatedDurationMinutes: input.durationMin ?? null,
        },
        include: {
            fromCity: true,
            toCity: true,
        },
    });
    auditLogFrom(audit ?? {}, {
        action: AuditAction.ROUTE_CREATED,
        entityType: AuditEntityType.ROUTE,
        entityId: route.id,
        metadata: {
            code: route.code,
            fromCityId: route.fromCityId,
            toCityId: route.toCityId,
        },
    });
    return route;
}
export async function listRoutes(fromCityId, toCityId) {
    const where = {};
    if (fromCityId) {
        where.fromCityId = fromCityId;
    }
    if (toCityId) {
        where.toCityId = toCityId;
    }
    return prisma.route.findMany({
        where,
        include: {
            fromCity: true,
            toCity: true,
        },
        orderBy: [{ fromCity: { name: "asc" } }, { toCity: { name: "asc" } }],
    });
}
export async function getRouteById(id) {
    const route = await prisma.route.findUnique({
        where: { id },
        include: { fromCity: true, toCity: true },
    });
    if (!route) {
        throw new ApiError(404, "Route not found");
    }
    return route;
}
export async function updateRoute(id, input, audit) {
    const route = await prisma.route.findUnique({ where: { id } });
    if (!route) {
        throw new ApiError(404, "Route not found");
    }
    const nextDurationMin = input.durationMin !== undefined ? input.durationMin : route.durationMin;
    const updated = await prisma.route.update({
        where: { id },
        data: {
            distanceKm: input.distanceKm ?? route.distanceKm,
            durationMin: nextDurationMin,
            estimatedDurationMinutes: input.durationMin !== undefined
                ? (input.durationMin ?? null)
                : (route.estimatedDurationMinutes ?? route.durationMin),
        },
        include: { fromCity: true, toCity: true },
    });
    auditLogFrom(audit ?? {}, {
        action: AuditAction.ROUTE_UPDATED,
        entityType: AuditEntityType.ROUTE,
        entityId: updated.id,
        metadata: {
            code: updated.code,
            distanceKm: updated.distanceKm,
            durationMin: updated.durationMin,
        },
    });
    return updated;
}
export async function deleteRoute(id, audit) {
    const route = await prisma.route.findUnique({ where: { id } });
    if (!route) {
        throw new ApiError(404, "Route not found");
    }
    await prisma.route.delete({ where: { id } });
    auditLogFrom(audit ?? {}, {
        action: AuditAction.ROUTE_DELETED,
        entityType: AuditEntityType.ROUTE,
        entityId: id,
        metadata: { code: route.code },
    });
    return { message: "Route deleted successfully" };
}
//# sourceMappingURL=service.js.map