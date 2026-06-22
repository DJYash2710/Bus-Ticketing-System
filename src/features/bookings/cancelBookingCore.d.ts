import { BookingStatus, type Booking, type BookingSeat, type Payment, type Prisma } from "@prisma/client";
import { type CancellationReasonType } from "./constants.js";
import type { AuditContext } from "../../core/audit/requestContext.js";
export type BookingForCancellation = Booking & {
    seats: BookingSeat[];
    payment: Payment | null;
};
export type CancelBookingInTxOptions = {
    reason: CancellationReasonType;
    /** When true, release seats in HELD or BOOKED state (schedule cascade). */
    releaseAnyHeldOrBooked?: boolean;
};
export type CancelBookingInTxResult = {
    changed: boolean;
    bookingId: number;
    scheduleId: number;
    userId: number;
    previousStatus: BookingStatus;
    seatIds: number[];
    paymentId: number | null;
    refunded: boolean;
    paymentCancelled: boolean;
    totalAmount: number;
};
export declare function cancelBookingInTx(tx: Prisma.TransactionClient, booking: BookingForCancellation, options: CancelBookingInTxOptions): Promise<CancelBookingInTxResult>;
export declare function logBookingCancellationAudits(auditCtx: AuditContext, result: CancelBookingInTxResult, options: {
    scheduleId?: number;
    seatReleaseReason: string;
    cancellationReason: CancellationReasonType;
}): void;
//# sourceMappingURL=cancelBookingCore.d.ts.map