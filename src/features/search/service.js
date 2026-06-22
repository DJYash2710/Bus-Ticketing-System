import { SeatStatus, ScheduleStatus } from "@prisma/client";
import { prisma } from "../../config/db.js";
import { ApiError } from "../../core/utils/apiError.js";
import { expireStaleHolds } from "../bookings/holdExpiry.js";
export async function searchSchedules(input) {
    await expireStaleHolds();
    if (input.fromCityId === input.toCityId) {
        throw new ApiError(400, "Source and destination cities must be different");
    }
    const fromCity = await prisma.city.findUnique({
        where: { id: input.fromCityId },
    });
    const toCity = await prisma.city.findUnique({
        where: { id: input.toCityId },
    });
    if (!fromCity) {
        throw new ApiError(404, "Source city not found");
    }
    if (!toCity) {
        throw new ApiError(404, "Destination city not found");
    }
    const start = new Date(input.date);
    start.setHours(0, 0, 0, 0);
    const end = new Date(input.date);
    end.setHours(23, 59, 59, 999);
    const schedules = await prisma.schedule.findMany({
        where: {
            status: ScheduleStatus.ACTIVE,
            departureTime: {
                gte: start,
                lte: end,
            },
            route: {
                fromCityId: input.fromCityId,
                toCityId: input.toCityId,
            },
        },
        include: {
            route: {
                include: {
                    fromCity: true,
                    toCity: true,
                },
            },
            bus: true,
            seats: true,
        },
        orderBy: {
            departureTime: "asc",
        },
    });
    const results = schedules.map((schedule) => {
        const totalSeats = schedule.seats.length;
        const availableSeats = schedule.seats.filter((seat) => seat.status === SeatStatus.AVAILABLE).length;
        const heldSeats = schedule.seats.filter((seat) => seat.status === SeatStatus.HELD).length;
        const bookedSeats = schedule.seats.filter((seat) => seat.status === SeatStatus.BOOKED).length;
        return {
            scheduleId: schedule.id,
            departureTime: schedule.departureTime,
            arrivalTime: schedule.arrivalTime,
            basePrice: schedule.basePrice,
            status: schedule.status,
            route: {
                id: schedule.route.id,
                code: schedule.route.code,
                distanceKm: schedule.route.distanceKm,
                durationMin: schedule.route.durationMin,
                fromCity: schedule.route.fromCity,
                toCity: schedule.route.toCity,
            },
            bus: {
                id: schedule.bus.id,
                name: schedule.bus.name,
                registrationNo: schedule.bus.registrationNo,
                type: schedule.bus.type,
                capacity: schedule.bus.capacity,
                amenities: schedule.bus.amenities,
            },
            seatSummary: {
                totalSeats,
                availableSeats,
                heldSeats,
                bookedSeats,
            },
        };
    });
    return {
        search: {
            fromCity,
            toCity,
            date: input.date,
        },
        count: results.length,
        schedules: results,
    };
}
//# sourceMappingURL=service.js.map