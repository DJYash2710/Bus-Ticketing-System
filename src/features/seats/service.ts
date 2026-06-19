import { SeatStatus } from "@prisma/client";
import { prisma } from "../../config/db.js";
import { ApiError } from "../../core/utils/apiError.js";

type ListSeatsFilters = {
  scheduleId: number;
  status?: SeatStatus;
};

type UpdateSeatStatusInput = {
  status: SeatStatus;
};

export async function listSeatsBySchedule(filters: ListSeatsFilters) {
  const schedule = await prisma.schedule.findUnique({
    where: { id: filters.scheduleId },
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

  if (!schedule) {
    throw new ApiError(404, "Schedule not found");
  }

  const whereClause: any = {
    scheduleId: filters.scheduleId,
  };

  if (filters.status) {
    whereClause.status = filters.status;
  }

  const seats = await prisma.seat.findMany({
    where: whereClause,
    orderBy: [{ row: "asc" }, { col: "asc" }, { seatNumber: "asc" }],
  });

  const summary = {
    total: seats.length,
    available: seats.filter((s) => s.status === SeatStatus.AVAILABLE).length,
    held: seats.filter((s) => s.status === SeatStatus.HELD).length,
    booked: seats.filter((s) => s.status === SeatStatus.BOOKED).length,
  };

  return {
    schedule: {
      id: schedule.id,
      departureTime: schedule.departureTime,
      arrivalTime: schedule.arrivalTime,
      basePrice: schedule.basePrice,
      status: schedule.status,
      route: {
        id: schedule.route.id,
        code: schedule.route.code,
        fromCity: schedule.route.fromCity,
        toCity: schedule.route.toCity,
      },
      bus: schedule.bus,
    },
    summary,
    seats,
  };
}

export async function getSeatById(id: number) {
  const seat = await prisma.seat.findUnique({
    where: { id },
    include: {
      schedule: {
        include: {
          route: {
            include: {
              fromCity: true,
              toCity: true,
            },
          },
          bus: true,
        },
      },
      bookingSeats: {
        include: {
          booking: true,
        },
      },
    },
  });

  if (!seat) {
    throw new ApiError(404, "Seat not found");
  }

  return seat;
}

export async function updateSeatStatus(
  id: number,
  input: UpdateSeatStatusInput,
) {
  const seat = await prisma.seat.findUnique({
    where: { id },
    include: {
      bookingSeats: true,
    },
  });

  if (!seat) {
    throw new ApiError(404, "Seat not found");
  }

  if (seat.bookingSeats.length > 0 && input.status === SeatStatus.AVAILABLE) {
    throw new ApiError(
      400,
      "Cannot mark a booked seat as AVAILABLE manually when booking records exist",
    );
  }

  const updatedSeat = await prisma.seat.update({
    where: { id },
    data: {
      status: input.status,
    },
    include: {
      schedule: {
        include: {
          route: {
            include: {
              fromCity: true,
              toCity: true,
            },
          },
          bus: true,
        },
      },
    },
  });

  return updatedSeat;
}
