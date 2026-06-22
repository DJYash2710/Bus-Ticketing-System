export type ScheduleCancelledNotificationPayload = {
    scheduleId: number;
    departureTime: Date;
    affectedBookingIds: number[];
    affectedUserIds: number[];
};
/** Placeholder for future email/SMS/push notifications. */
export declare function notifyScheduleCancelled(payload: ScheduleCancelledNotificationPayload): Promise<void>;
//# sourceMappingURL=scheduleNotifications.d.ts.map