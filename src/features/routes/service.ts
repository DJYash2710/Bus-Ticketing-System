// src/features/routes/service.ts
import { prisma } from "../../config/db.js";
import { ApiError } from "../../core/utils/apiError.js";
import { Prisma } from "@prisma/client";

type CreateRouteInput = {
  code: string;
  fromCityId: number;
  toCityId: number;
  distanceKm?: number;
  durationMin?: number;
};

type UpdateRouteInput = {
  distanceKm?: number;
  durationMin?: number;
};

export async function createRoute(input: CreateRouteInput) {
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

  return prisma.route.create({
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
}

export async function listRoutes(fromCityId?: number, toCityId?: number) {
  const where: Prisma.RouteWhereInput = {};
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

export async function getRouteById(id: number) {
  const route = await prisma.route.findUnique({
    where: { id },
    include: { fromCity: true, toCity: true },
  });

  if (!route) {
    throw new ApiError(404, "Route not found");
  }
  return route;
}

export async function updateRoute(id: number, input: UpdateRouteInput) {
  const route = await prisma.route.findUnique({ where: { id } });
  if (!route) {
    throw new ApiError(404, "Route not found");
  }

  const nextDurationMin =
    input.durationMin !== undefined ? input.durationMin : route.durationMin;

  return prisma.route.update({
    where: { id },
    data: {
      distanceKm: input.distanceKm ?? route.distanceKm,
      durationMin: nextDurationMin,
      estimatedDurationMinutes:
        input.durationMin !== undefined
          ? (input.durationMin ?? null)
          : (route.estimatedDurationMinutes ?? route.durationMin),
    },
    include: { fromCity: true, toCity: true },
  });
}

export async function deleteRoute(id: number) {
  const route = await prisma.route.findUnique({ where: { id } });
  if (!route) {
    throw new ApiError(404, "Route not found");
  }

  // Later maybe prevent delete if schedules exist
  await prisma.route.delete({ where: { id } });

  return { message: "Route deleted successfully" };
}
