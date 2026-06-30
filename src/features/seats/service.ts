import { LayoutElementType, SeatStatus } from "@prisma/client";
import { prisma } from "../../config/db.js";
import { ApiError } from "../../core/utils/apiError.js";
import type { AuthUser } from "../../core/middleware/auth.middleware.js";
import {
  isOperator,
  requireOperatorFleetId,
} from "../../core/utils/operatorScope.js";
import { expireStaleHolds } from "../bookings/holdExpiry.js";
import { AuditAction, AuditEntityType } from "../../core/audit/actions.js";
import { auditLogFrom } from "../../core/audit/auditLog.service.js";
import type { AuditContext } from "../../core/audit/requestContext.js";

type ListSeatsFilters = {
  scheduleId: number;
  status?: SeatStatus;
};

type UpdateSeatStatusInput = {
  status: SeatStatus;
};

export async function listSeatsBySchedule(filters: ListSeatsFilters) {
  await expireStaleHolds();

  const schedule = await prisma.schedule.findUnique({
    where: { id: filters.scheduleId },
    include: {
      route: {
        include: {
          fromCity: true,
          toCity: true,
        },
      },
      bus: {
        include: {
          currentLayout: {
            include: {
              elements: {
                where: { type: { not: LayoutElementType.SEAT } },
                orderBy: [{ row: "asc" }, { col: "asc" }],
              },
            },
          },
        },
      },
      busLayout: {
        include: {
          elements: {
            where: { type: { not: LayoutElementType.SEAT } },
            orderBy: [{ row: "asc" }, { col: "asc" }],
          },
        },
      },
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

  const snapshotLayout = schedule.busLayout;
  const fallbackLayout = schedule.bus.currentLayout;
  const layoutRecord = snapshotLayout ?? fallbackLayout;

  const layout = layoutRecord
    ? {
        seatsLeft: layoutRecord.seatsLeft,
        seatsRight: layoutRecord.seatsRight,
        layoutType: layoutRecord.layoutType,
        version: layoutRecord.version,
        fromSnapshot: !!snapshotLayout,
        hasUpperDeck: layoutRecord.hasUpperDeck,
        capElements: layoutRecord.elements.map((el) => ({
          type: el.type,
          deck: el.deck,
          row: el.row,
          col: el.col,
          label: el.label,
        })),
      }
    : null;

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
    layout,
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
  caller: AuthUser,
  audit?: AuditContext,
) {
  const seat = await prisma.seat.findUnique({
    where: { id },
    include: {
      bookingSeats: true,
      schedule: {
        include: {
          bus: true,
        },
      },
    },
  });

  if (!seat) {
    throw new ApiError(404, "Seat not found");
  }

  if (isOperator(caller)) {
    const fleetId = requireOperatorFleetId(caller);
    if (seat.schedule.bus.operatorId !== fleetId) {
      throw new ApiError(
        403,
        "You do not have permission to update this seat",
      );
    }

    if (
      seat.status === SeatStatus.BOOKED ||
      seat.bookingSeats.length > 0
    ) {
      throw new ApiError(
        403,
        "Operators cannot change the status of a booked seat",
      );
    }

    if (input.status === SeatStatus.BOOKED) {
      throw new ApiError(
        403,
        "Operators cannot manually mark seats as booked",
      );
    }
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
      ...(input.status === SeatStatus.HELD
        ? {}
        : { heldUntil: null }),
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

  auditLogFrom(audit ?? { actorId: caller.id, actorRole: caller.role }, {
    action: AuditAction.SEAT_STATUS_CHANGED,
    entityType: AuditEntityType.SEAT,
    entityId: id,
    metadata: {
      scheduleId: seat.scheduleId,
      seatNumber: seat.seatNumber,
      previousStatus: seat.status,
      newStatus: input.status,
    },
  });

  return updatedSeat;
}
