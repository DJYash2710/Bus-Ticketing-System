import {
  BookingStatus,
  ScheduleStatus,
  SeatStatus,
} from "@prisma/client";
import { prisma } from "../../config/db.js";
import { ApiError } from "../../core/utils/apiError.js";
import { AuditAction, AuditEntityType } from "../../core/audit/actions.js";
import { auditLogFrom } from "../../core/audit/auditLog.service.js";
import type { AuditContext } from "../../core/audit/requestContext.js";
import {
  cancelBookingInTx,
  logBookingCancellationAudits,
  type CancelBookingInTxResult,
} from "../bookings/cancelBookingCore.js";
import { CancellationReason } from "../bookings/constants.js";
import { notifyScheduleCancelled } from "../notifications/scheduleNotifications.js";

const scheduleInclude = {
  route: {
    include: {
      fromCity: true,
      toCity: true,
    },
  },
  bus: true,
  _count: {
    select: {
      seats: true,
      bookings: true,
    },
  },
} as const;

function formatSchedule<
  T extends {
    _count?: { seats: number; bookings: number };
  },
>(schedule: T) {
  const { _count, ...rest } = schedule;
  return {
    ...rest,
    bookingsCount: _count?.bookings ?? 0,
    seatsCount: _count?.seats ?? 0,
    bookedSeatsCount: _count?.bookings ?? 0,
  };
}

export type CancelScheduleSummary = {
  bookingsCancelled: number;
  seatsReleased: number;
  refundsProcessed: number;
  paymentsCancelled: number;
  seatsSwept: number;
};

export type CancelScheduleResult = {
  schedule: ReturnType<typeof formatSchedule>;
  alreadyCancelled: boolean;
  summary: CancelScheduleSummary;
};

export async function cancelScheduleCascade(
  scheduleId: number,
  audit: AuditContext,
): Promise<CancelScheduleResult> {
  const existing = await prisma.schedule.findUnique({
    where: { id: scheduleId },
    include: scheduleInclude,
  });

  if (!existing) {
    throw new ApiError(404, "Schedule not found");
  }

  if (existing.status === ScheduleStatus.CANCELLED) {
    return {
      schedule: formatSchedule(existing),
      alreadyCancelled: true,
      summary: {
        bookingsCancelled: 0,
        seatsReleased: 0,
        refundsProcessed: 0,
        paymentsCancelled: 0,
        seatsSwept: 0,
      },
    };
  }

  if (existing.status === ScheduleStatus.COMPLETED) {
    throw new ApiError(400, "Cannot cancel a completed schedule");
  }

  const txResult = await prisma.$transaction(
    async (tx) => {
      const scheduleUpdate = await tx.schedule.updateMany({
        where: {
          id: scheduleId,
          status: { not: ScheduleStatus.CANCELLED },
        },
        data: { status: ScheduleStatus.CANCELLED },
      });

      const scheduleTransitioned = scheduleUpdate.count > 0;

      if (!scheduleTransitioned) {
        const current = await tx.schedule.findUnique({
          where: { id: scheduleId },
          include: scheduleInclude,
        });
        return {
          scheduleTransitioned: false,
          bookingResults: [] as CancelBookingInTxResult[],
          seatsSwept: 0,
          schedule: current,
        };
      }

      const bookings = await tx.booking.findMany({
        where: {
          scheduleId,
          status: {
            in: [BookingStatus.PENDING, BookingStatus.CONFIRMED],
          },
        },
        include: {
          seats: true,
          payment: true,
        },
      });

      const bookingResults: CancelBookingInTxResult[] = [];

      for (const booking of bookings) {
        const result = await cancelBookingInTx(tx, booking, {
          reason: CancellationReason.SCHEDULE_CANCELLED,
          releaseAnyHeldOrBooked: true,
        });
        bookingResults.push(result);
      }

      const sweep = await tx.seat.updateMany({
        where: {
          scheduleId,
          status: { in: [SeatStatus.HELD, SeatStatus.BOOKED] },
        },
        data: {
          status: SeatStatus.AVAILABLE,
          heldUntil: null,
        },
      });

      const schedule = await tx.schedule.findUnique({
        where: { id: scheduleId },
        include: scheduleInclude,
      });

      return {
        scheduleTransitioned: true,
        bookingResults,
        seatsSwept: sweep.count,
        schedule,
      };
    },
    { timeout: 30_000 },
  );

  if (!txResult.scheduleTransitioned && txResult.schedule) {
    return {
      schedule: formatSchedule(txResult.schedule),
      alreadyCancelled: true,
      summary: {
        bookingsCancelled: 0,
        seatsReleased: 0,
        refundsProcessed: 0,
        paymentsCancelled: 0,
        seatsSwept: 0,
      },
    };
  }

  const changedBookings = txResult.bookingResults.filter((r) => r.changed);
  const summary: CancelScheduleSummary = {
    bookingsCancelled: changedBookings.length,
    seatsReleased: changedBookings.reduce((n, r) => n + r.seatIds.length, 0),
    refundsProcessed: changedBookings.filter((r) => r.refunded).length,
    paymentsCancelled: changedBookings.filter((r) => r.paymentCancelled).length,
    seatsSwept: txResult.seatsSwept,
  };

  if (txResult.scheduleTransitioned) {
    auditLogFrom(audit, {
      action: AuditAction.SCHEDULE_CANCELLED,
      entityType: AuditEntityType.SCHEDULE,
      entityId: scheduleId,
      metadata: {
        ...summary,
        affectedBookingIds: changedBookings.map((r) => r.bookingId),
      },
    });

    for (const result of changedBookings) {
      logBookingCancellationAudits(audit, result, {
        scheduleId,
        seatReleaseReason: "schedule_cancelled",
        cancellationReason: CancellationReason.SCHEDULE_CANCELLED,
      });
    }

    const affectedUserIds = [
      ...new Set(changedBookings.map((r) => r.userId)),
    ];

    void notifyScheduleCancelled({
      scheduleId,
      departureTime: existing.departureTime,
      affectedBookingIds: changedBookings.map((r) => r.bookingId),
      affectedUserIds,
    });
  }

  return {
    schedule: formatSchedule(txResult.schedule!),
    alreadyCancelled: false,
    summary,
  };
}
