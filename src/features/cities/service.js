// src/features/cities/service.ts
import { prisma } from "../../config/db.js";
import { ApiError } from "../../core/utils/apiError.js";
export async function createCity(input) {
    const existing = await prisma.city.findFirst({
        where: {
            name: input.name,
            state: input.state || null,
            country: input.country || null,
        },
    });
    if (existing) {
        throw new ApiError(409, "City with same name/state/country already exists");
    }
    return prisma.city.create({
        data: {
            name: input.name,
            state: input.state || null,
            country: input.country || "India",
        },
    });
}
export async function listCities(search) {
    const where = search
        ? {
            name: { contains: search, mode: "insensitive" },
        }
        : null;
    return prisma.city.findMany({
        ...(where ? { where } : {}),
        orderBy: { name: "asc" },
    });
}
export async function getCityById(id) {
    const city = await prisma.city.findUnique({ where: { id } });
    if (!city) {
        throw new ApiError(404, "City not found");
    }
    return city;
}
export async function updateCity(id, input) {
    const city = await prisma.city.findUnique({ where: { id } });
    if (!city) {
        throw new ApiError(404, "City not found");
    }
    return prisma.city.update({
        where: { id },
        data: {
            name: input.name ?? city.name,
            state: input.state ?? city.state,
            country: input.country ?? city.country,
        },
    });
}
export async function deleteCity(id) {
    const city = await prisma.city.findUnique({ where: { id } });
    if (!city) {
        throw new ApiError(404, "City not found");
    }
    // Later you may want to prevent delete if routes use this city
    await prisma.city.delete({ where: { id } });
    return { message: "City deleted successfully" };
}
//# sourceMappingURL=service.js.map