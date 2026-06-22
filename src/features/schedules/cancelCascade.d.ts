import type { AuditContext } from "../../core/audit/requestContext.js";
declare function formatSchedule<T extends {
    _count?: {
        seats: number;
        bookings: number;
    };
}>(schedule: T): Omit<T, "_count"> & {
    bookingsCount: number;
    seatsCount: number;
    bookedSeatsCount: number;
};
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
export declare function cancelScheduleCascade(scheduleId: number, audit: AuditContext): Promise<CancelScheduleResult>;
export {};
//# sourceMappingURL=cancelCascade.d.ts.map