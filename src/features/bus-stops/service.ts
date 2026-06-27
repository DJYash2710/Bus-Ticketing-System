import { prisma } from "../../config/db.js";
import { ApiError } from "../../core/utils/apiError.js";

type CreateBusStopInput = {
  name: string;
  locality: string;
  cityId: number;
};

type UpdateBusStopInput = {
  name?: string;
  locality?: string;
  cityId?: number;
};

export function formatBusStopLabel(stop: { name: string; locality: string }) {
  return `${stop.name}, ${stop.locality}`;
}

export async function createBusStop(input: CreateBusStopInput) {
  const city = await prisma.city.findUnique({ where: { id: input.cityId } });
  if (!city) {
    throw new ApiError(400, "City not found");
  }

  return prisma.busStop.create({
    data: {
      name: input.name.trim(),
      locality: input.locality.trim(),
      cityId: input.cityId,
    },
    include: { city: true },
  });
}

export async function listBusStops(cityId?: number, search?: string) {
  const where: {
    cityId?: number;
    OR?: Array<{ name: { contains: string } } | { locality: { contains: string } }>;
  } = {};

  if (cityId) {
    where.cityId = cityId;
  }

  if (search?.trim()) {
    const term = search.trim();
    where.OR = [
      { name: { contains: term } },
      { locality: { contains: term } },
    ];
  }

  return prisma.busStop.findMany({
    where: Object.keys(where).length > 0 ? where : undefined,
    include: { city: true },
    orderBy: [{ city: { name: "asc" } }, { name: "asc" }],
  });
}

export async function getBusStopById(id: number) {
  const stop = await prisma.busStop.findUnique({
    where: { id },
    include: { city: true },
  });
  if (!stop) {
    throw new ApiError(404, "Bus stop not found");
  }
  return stop;
}

export async function updateBusStop(id: number, input: UpdateBusStopInput) {
  await getBusStopById(id);

  if (input.cityId) {
    const city = await prisma.city.findUnique({ where: { id: input.cityId } });
    if (!city) {
      throw new ApiError(400, "City not found");
    }
  }

  return prisma.busStop.update({
    where: { id },
    data: {
      ...(input.name !== undefined ? { name: input.name.trim() } : {}),
      ...(input.locality !== undefined ? { locality: input.locality.trim() } : {}),
      ...(input.cityId !== undefined ? { cityId: input.cityId } : {}),
    },
    include: { city: true },
  });
}

export async function deleteBusStop(id: number) {
  await getBusStopById(id);
  await prisma.busStop.delete({ where: { id } });
  return { message: "Bus stop deleted successfully" };
}
