// src/features/buses/service.ts
import { prisma } from "../../config/db.js";
import { ApiError } from "../../core/utils/apiError.js";
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

export async function createBus(input: CreateBusInput) {
  // Ensure registrationNo is unique at app level before DB error
  const existing = await prisma.bus.findUnique({
    where: { registrationNo: input.registrationNo },
  });

  if (existing) {
    throw new ApiError(409, "Bus with this registration number already exists");
  }

  const bus = await prisma.bus.create({
    data: {
      registrationNo: input.registrationNo,
      name: input.name,
      capacity: input.capacity,
      type: input.type as BusType,
      amenities: input.amenities ? input.amenities.join(",") : null,
      operatorId: input.operatorId ?? null,
    },
  });

  return bus;
}

export async function listBuses() {
  const buses = await prisma.bus.findMany({
    orderBy: { id: "asc" },
  });

  return buses.map((b) => ({
    ...b,
    amenities: b.amenities ? b.amenities.split(",") : [],
  }));
}

export async function getBusById(id: number) {
  const bus = await prisma.bus.findUnique({
    where: { id },
  });

  if (!bus) {
    throw new ApiError(404, "Bus not found");
  }

  return {
    ...bus,
    amenities: bus.amenities ? bus.amenities.split(",") : [],
  };
}

export async function updateBus(id: number, input: UpdateBusInput) {
  const bus = await prisma.bus.findUnique({ where: { id } });
  if (!bus) {
    throw new ApiError(404, "Bus not found");
  }

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
      operatorId:
        input.operatorId !== undefined ? input.operatorId : bus.operatorId,
    },
  });

  return {
    ...updated,
    amenities: updated.amenities ? updated.amenities.split(",") : [],
  };
}

export async function deleteBus(id: number) {
  const bus = await prisma.bus.findUnique({ where: { id } });
  if (!bus) {
    throw new ApiError(404, "Bus not found");
  }

  await prisma.bus.delete({ where: { id } });

  return { message: "Bus deleted successfully" };
}
