import { logger } from "../../config/logger.js";
/** Placeholder for future email/SMS/push notifications. */
export async function notifyScheduleCancelled(payload) {
    logger.info("notifyScheduleCancelled (stub)", {
        category: "notification",
        scheduleId: payload.scheduleId,
        affectedBookings: payload.affectedBookingIds.length,
        affectedUsers: payload.affectedUserIds.length,
    });
}
//# sourceMappingURL=scheduleNotifications.js.map