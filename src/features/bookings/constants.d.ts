/** Duration a seat hold remains valid after booking creation (10 minutes). */
export declare const SEAT_HOLD_DURATION_MS: number;
export declare function calculateHoldExpiresAt(from?: Date): Date;
export declare const CancellationReason: {
    readonly USER_CANCELLED: "USER_CANCELLED";
    readonly SCHEDULE_CANCELLED: "SCHEDULE_CANCELLED";
};
export type CancellationReasonType = (typeof CancellationReason)[keyof typeof CancellationReason];
//# sourceMappingURL=constants.d.ts.map