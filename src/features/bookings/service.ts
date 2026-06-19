import { BookingStatus, ScheduleStatus, SeatStatus } from "@prisma/client";
import { prisma } from "../../config/db.js";
import { ApiError } from "../../core/utils/apiError.js";

type CreateBookingInput = {
  userId: number;
  scheduleId: number;
  seatNumbers: string[];
  boardingPoint: string;
  droppingPoint: string;
};

type BookingSeatWithSeat = {
  seatId: number;
  seat: {
    id: number;
    seatNumber: string;
    status: SeatStatus;
  };
};

export async function createBooking(input: CreateBookingInput) {
  const uniqueSeatNumbers = [
    ...new Set(input.seatNumbers.map((seat) => seat.trim().toUpperCase())),
  ];

  if (uniqueSeatNumbers.length === 0) {
    throw new ApiError(400, "At least one seat number is required");
  }

  const schedule = await prisma.schedule.findUnique({
    where: { id: input.scheduleId },
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

  if (schedule.status !== ScheduleStatus.ACTIVE) {
    throw new ApiError(400, "Schedule is not active");
  }

  const seats = await prisma.seat.findMany({
    where: {
      scheduleId: input.scheduleId,
      seatNumber: {
        in: uniqueSeatNumbers,
      },
    },
  });

  if (seats.length !== uniqueSeatNumbers.length) {
    throw new ApiError(
      404,
      "One or more selected seats were not found for this schedule",
    );
  }

  const unavailableSeats = seats.filter(
    (seat) => seat.status !== SeatStatus.AVAILABLE,
  );

  if (unavailableSeats.length > 0) {
    throw new ApiError(
      409,
      `Selected seats are not available: ${unavailableSeats
        .map((seat) => seat.seatNumber)
        .join(", ")}`,
    );
  }

  const baseAmount = Number(schedule.basePrice) * seats.length;
  const taxAmount = 0;
  const discountAmount = 0;
  const commissionRate = 0.05;
  const commissionAmount = baseAmount * commissionRate;
  const totalAmount = baseAmount + taxAmount - discountAmount;

  const booking = await prisma.$transaction(async (tx) => {
    const updatedSeats = await tx.seat.updateMany({
      where: {
        id: {
          in: seats.map((seat) => seat.id),
        },
        status: SeatStatus.AVAILABLE,
      },
      data: {
        status: SeatStatus.BOOKED,
      },
    });

    if (updatedSeats.count !== seats.length) {
      throw new ApiError(
        409,
        "Some seats were just booked by another user. Please try again.",
      );
    }

    const createdBooking = await tx.booking.create({
      data: {
        userId: input.userId,
        scheduleId: input.scheduleId,
        baseAmount,
        taxAmount,
        discountAmount,
        commissionRate,
        commissionAmount,
        totalAmount,
        status: BookingStatus.CONFIRMED,
        paymentStatus: "PENDING",
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
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    await tx.bookingSeat.createMany({
      data: seats.map((seat) => ({
        bookingId: createdBooking.id,
        seatId: seat.id,
      })),
    });

    return tx.booking.findUnique({
      where: { id: createdBooking.id },
      include: {
        seats: {
          include: {
            seat: true,
          },
        },
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
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });
  });

  return booking;
}

export async function getBookingById(bookingId: number, userId: number) {
  const booking = await prisma.booking.findFirst({
    where: {
      id: bookingId,
      userId,
    },
    include: {
      seats: {
        include: {
          seat: true,
        },
      },
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
      user: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
    },
  });

  if (!booking) {
    throw new ApiError(404, "Booking not found");
  }

  return booking;
}

export async function getMyBookings(userId: number) {
  return prisma.booking.findMany({
    where: { userId },
    include: {
      seats: {
        include: {
          seat: true,
        },
      },
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
    orderBy: {
      createdAt: "desc",
    },
  });
}

export async function cancelBooking(bookingId: number, userId: number) {
  const booking = await prisma.booking.findFirst({
    where: {
      id: bookingId,
      userId,
    },
    include: {
      seats: true,
    },
  });

  if (!booking) {
    throw new ApiError(404, "Booking not found");
  }

  if (booking.status === BookingStatus.CANCELLED) {
    throw new ApiError(400, "Booking is already cancelled");
  }

  const result = await prisma.$transaction(async (tx) => {
    await tx.booking.update({
      where: { id: booking.id },
      data: {
        status: BookingStatus.CANCELLED,
        cancelledAt: new Date(),
      },
    });

    await tx.seat.updateMany({
      where: {
        id: {
          in: booking.seats.map((item) => item.seatId),
        },
      },
      data: {
        status: SeatStatus.AVAILABLE,
      },
    });

    return tx.booking.findUnique({
      where: { id: booking.id },
      include: {
        seats: {
          include: {
            seat: true,
          },
        },
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
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });
  });

  return result;
}
