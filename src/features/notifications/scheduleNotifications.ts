import { logger } from "../../config/logger.js";

export type ScheduleCancelledNotificationPayload = {
  scheduleId: number;
  departureTime: Date;
  affectedBookingIds: number[];
  affectedUserIds: number[];
};

/** Placeholder for future email/SMS/push notifications. */
export async function notifyScheduleCancelled(
  payload: ScheduleCancelledNotificationPayload,
): Promise<void> {
  logger.info("notifyScheduleCancelled (stub)", {
    category: "notification",
    scheduleId: payload.scheduleId,
    affectedBookings: payload.affectedBookingIds.length,
    affectedUsers: payload.affectedUserIds.length,
  });
}
