// src/features/buses/service.ts
import { BusBodyType, BusLayoutType, } from "@prisma/client";
import { prisma } from "../../config/db.js";
import { ApiError } from "../../core/utils/apiError.js";
import { isOperator, requireOperatorFleetId, } from "../../core/utils/operatorScope.js";
import { AuditAction, AuditEntityType } from "../../core/audit/actions.js";
import { auditLogFrom } from "../../core/audit/auditLog.service.js";
import { createInitialLayoutForBus } from "../bus-layout/service.js";
import { defaultLayoutTypeForBody } from "../../lib/bus-layout/templates.js";
function parseBusFields(input) {
    if (input.bodyType) {
        const bodyType = input.bodyType;
        return {
            bodyType,
            hasAc: input.hasAc ?? false,
            layoutType: input.layoutType ??
                defaultLayoutTypeForBody(bodyType),
        };
    }
    switch (input.type) {
        case "SLEEPER":
            return {
                bodyType: BusBodyType.SLEEPER,
                hasAc: false,
                layoutType: BusLayoutType.SLEEPER_1_1,
            };
        case "SEMI_SLEEPER":
            return {
                bodyType: BusBodyType.SEMI_SLEEPER,
                hasAc: false,
                layoutType: BusLayoutType.SEATER_2_1,
            };
        case "AC":
            return {
                bodyType: BusBodyType.SEATER,
                hasAc: true,
                layoutType: BusLayoutType.SEATER_2_2,
            };
        case "NON_AC":
            return {
                bodyType: BusBodyType.SEATER,
                hasAc: false,
                layoutType: BusLayoutType.SEATER_2_2,
            };
        case "SEATER":
        default:
            return {
                bodyType: BusBodyType.SEATER,
                hasAc: false,
                layoutType: BusLayoutType.SEATER_2_2,
            };
    }
}
function formatBus(bus) {
    return {
        ...bus,
        amenities: bus.amenities ? bus.amenities.split(",") : [],
    };
}
function assertBusOwnership(bus, caller) {
    if (!isOperator(caller)) {
        return;
    }
    const fleetId = requireOperatorFleetId(caller);
    if (bus.operatorId !== fleetId) {
        throw new ApiError(403, "You do not have permission to access this bus");
    }
}
export async function createBus(input, caller, audit) {
    const existing = await prisma.bus.findUnique({
        where: { registrationNo: input.registrationNo },
    });
    if (existing) {
        throw new ApiError(409, "Bus with this registration number already exists");
    }
    const operatorId = isOperator(caller)
        ? requireOperatorFleetId(caller)
        : (input.operatorId ?? null);
    const fields = parseBusFields(input);
    const created = await prisma.bus.create({
        data: {
            registrationNo: input.registrationNo,
            name: input.name,
            capacity: input.capacity,
            bodyType: fields.bodyType,
            layoutType: fields.layoutType,
            hasAc: fields.hasAc,
            amenities: input.amenities ? input.amenities.join(",") : null,
            operatorId,
        },
    });
    await createInitialLayoutForBus(created.id, fields.layoutType, input.capacity, caller.id, fields.bodyType);
    const bus = await prisma.bus.findUniqueOrThrow({ where: { id: created.id } });
    auditLogFrom(audit ?? { actorId: caller.id, actorRole: caller.role }, {
        action: AuditAction.BUS_CREATED,
        entityType: AuditEntityType.BUS,
        entityId: bus.id,
        metadata: {
            registrationNo: bus.registrationNo,
            name: bus.name,
            capacity: bus.capacity,
        },
    });
    return formatBus(bus);
}
export async function listBuses(caller) {
    const where = isOperator(caller)
        ? { operatorId: requireOperatorFleetId(caller) }
        : {};
    const buses = await prisma.bus.findMany({
        where,
        orderBy: { id: "asc" },
    });
    return buses.map(formatBus);
}
export async function getBusById(id, caller) {
    const bus = await prisma.bus.findUnique({
        where: { id },
    });
    if (!bus) {
        throw new ApiError(404, "Bus not found");
    }
    assertBusOwnership(bus, caller);
    return formatBus(bus);
}
export async function updateBus(id, input, caller, audit) {
    const bus = await prisma.bus.findUnique({ where: { id } });
    if (!bus) {
        throw new ApiError(404, "Bus not found");
    }
    assertBusOwnership(bus, caller);
    const operatorId = isOperator(caller)
        ? bus.operatorId
        : input.operatorId !== undefined
            ? input.operatorId
            : bus.operatorId;
    const parsed = input.bodyType || input.type
        ? parseBusFields({
            bodyType: input.bodyType ?? bus.bodyType,
            layoutType: input.layoutType ?? bus.layoutType,
            hasAc: input.hasAc ?? bus.hasAc,
            ...(input.type ? { type: input.type } : {}),
        })
        : null;
    const updated = await prisma.bus.update({
        where: { id },
        data: {
            name: input.name ?? bus.name,
            capacity: input.capacity ?? bus.capacity,
            bodyType: parsed?.bodyType ?? bus.bodyType,
            layoutType: parsed?.layoutType ?? bus.layoutType,
            hasAc: parsed?.hasAc ?? bus.hasAc,
            amenities: input.amenities !== undefined
                ? input.amenities.join(",")
                : bus.amenities,
            operatorId,
        },
    });
    auditLogFrom(audit ?? { actorId: caller.id, actorRole: caller.role }, {
        action: AuditAction.BUS_UPDATED,
        entityType: AuditEntityType.BUS,
        entityId: updated.id,
        metadata: {
            registrationNo: updated.registrationNo,
            name: updated.name,
            capacity: updated.capacity,
        },
    });
    return formatBus(updated);
}
export async function deleteBus(id, caller, audit) {
    const bus = await prisma.bus.findUnique({ where: { id } });
    if (!bus) {
        throw new ApiError(404, "Bus not found");
    }
    assertBusOwnership(bus, caller);
    await prisma.bus.delete({ where: { id } });
    auditLogFrom(audit ?? { actorId: caller.id, actorRole: caller.role }, {
        action: AuditAction.BUS_DELETED,
        entityType: AuditEntityType.BUS,
        entityId: id,
        metadata: {
            registrationNo: bus.registrationNo,
            name: bus.name,
        },
    });
    return { message: "Bus deleted successfully" };
}
//# sourceMappingURL=service.js.map