// src/features/buses/service.ts
import { prisma } from "../../config/db.js";
import { ApiError } from "../../core/utils/apiError.js";
import type { AuthUser } from "../../core/middleware/auth.middleware.js";
import {
  isOperator,
  requireOperatorFleetId,
} from "../../core/utils/operatorScope.js";
import type { BusType } from "@prisma/client";

type CreateBusInput = {
  registrationNo: string;
  name: string;
  capacity: number;
  type: BusType | string;
  amenities?: string[];
  operatorId?: number | null;
};

type UpdateBusInput = {
  name?: string;
  capacity?: number;
  type?: BusType | string;
  amenities?: string[];
  operatorId?: number | null;
};

function assertBusOwnership(bus: { operatorId: number | null }, caller: AuthUser) {
  if (!isOperator(caller)) {
    return;
  }

  const fleetId = requireOperatorFleetId(caller);

  if (bus.operatorId !== fleetId) {
    throw new ApiError(403, "You do not have permission to access this bus");
  }
}

export async function createBus(input: CreateBusInput, caller: AuthUser) {
  const existing = await prisma.bus.findUnique({
    where: { registrationNo: input.registrationNo },
  });

  if (existing) {
    throw new ApiError(409, "Bus with this registration number already exists");
  }

  const operatorId = isOperator(caller)
    ? requireOperatorFleetId(caller)
    : (input.operatorId ?? null);

  const bus = await prisma.bus.create({
    data: {
      registrationNo: input.registrationNo,
      name: input.name,
      capacity: input.capacity,
      type: input.type as BusType,
      amenities: input.amenities ? input.amenities.join(",") : null,
      operatorId,
    },
  });

  return {
    ...bus,
    amenities: bus.amenities ? bus.amenities.split(",") : [],
  };
}

export async function listBuses(caller: AuthUser) {
  const where = isOperator(caller)
    ? { operatorId: requireOperatorFleetId(caller) }
    : {};

  const buses = await prisma.bus.findMany({
    where,
    orderBy: { id: "asc" },
  });

  return buses.map((b) => ({
    ...b,
    amenities: b.amenities ? b.amenities.split(",") : [],
  }));
}

export async function getBusById(id: number, caller: AuthUser) {
  const bus = await prisma.bus.findUnique({
    where: { id },
  });

  if (!bus) {
    throw new ApiError(404, "Bus not found");
  }

  assertBusOwnership(bus, caller);

  return {
    ...bus,
    amenities: bus.amenities ? bus.amenities.split(",") : [],
  };
}

export async function updateBus(
  id: number,
  input: UpdateBusInput,
  caller: AuthUser,
) {
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

  const updated = await prisma.bus.update({
    where: { id },
    data: {
      name: input.name ?? bus.name,
      capacity: input.capacity ?? bus.capacity,
      type: (input.type as BusType) ?? bus.type,
      amenities:
        input.amenities !== undefined
          ? input.amenities.join(",")
          : bus.amenities,
      operatorId,
    },
  });

  return {
    ...updated,
    amenities: updated.amenities ? updated.amenities.split(",") : [],
  };
}

export async function deleteBus(id: number, caller: AuthUser) {
  const bus = await prisma.bus.findUnique({ where: { id } });
  if (!bus) {
    throw new ApiError(404, "Bus not found");
  }

  assertBusOwnership(bus, caller);

  await prisma.bus.delete({ where: { id } });

  return { message: "Bus deleted successfully" };
}
