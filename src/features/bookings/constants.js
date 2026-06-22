/** Duration a seat hold remains valid after booking creation (10 minutes). */
export const SEAT_HOLD_DURATION_MS = 10 * 60 * 1000;
export function calculateHoldExpiresAt(from = new Date()) {
    return new Date(from.getTime() + SEAT_HOLD_DURATION_MS);
}
export const CancellationReason = {
    USER_CANCELLED: "USER_CANCELLED",
    SCHEDULE_CANCELLED: "SCHEDULE_CANCELLED",
};
//# sourceMappingURL=constants.js.map