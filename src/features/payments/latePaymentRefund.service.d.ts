import { type Booking, type Payment } from '@prisma/client';
export type PaymentWithBooking = Payment & {
    booking: Booking;
};
export type LatePaymentRefundInput = {
    paymentId: number;
    paymentIntentId: string;
    stripeEventRaw: string;
    reason: string;
};
export type LatePaymentRefundResult = {
    paymentId: number;
    outcome: 'auto_refunded' | 'already_refunded' | 'refund_failed_manual_reconciliation';
    refundId?: string;
};
export declare function isLatePaymentAfterHoldExpiry(payment: PaymentWithBooking): boolean;
export declare function shouldAutoRefundAfterFinalizeError(err: unknown, payment: PaymentWithBooking): boolean;
export declare function refundLatePaymentAfterHoldExpiry(input: LatePaymentRefundInput): Promise<LatePaymentRefundResult>;
//# sourceMappingURL=latePaymentRefund.service.d.ts.map