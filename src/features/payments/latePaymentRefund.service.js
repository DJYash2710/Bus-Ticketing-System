import { BookingStatus, PaymentStatus, } from '@prisma/client';
import { prisma } from '../../config/db.js';
import { logger } from '../../config/logger.js';
import { ApiError } from '../../core/utils/apiError.js';
import { AuditAction, AuditEntityType } from '../../core/audit/actions.js';
import { auditLogFrom } from '../../core/audit/auditLog.service.js';
import { systemAuditContext } from '../../core/audit/requestContext.js';
import { stripePaymentProvider } from './providers/stripe-payment.provider.js';
const REFUNDABLE_PAYMENT_STATUSES = [
    PaymentStatus.PENDING,
    PaymentStatus.FAILED,
    PaymentStatus.REFUND_PENDING,
];
export function isLatePaymentAfterHoldExpiry(payment) {
    if (payment.status === PaymentStatus.REFUNDED ||
        payment.status === PaymentStatus.SUCCESS) {
        return false;
    }
    const { booking } = payment;
    if (booking.status === BookingStatus.EXPIRED) {
        return true;
    }
    if (booking.holdExpiresAt && booking.holdExpiresAt < new Date()) {
        return true;
    }
    return false;
}
export function shouldAutoRefundAfterFinalizeError(err, payment) {
    if (!(err instanceof ApiError)) {
        return false;
    }
    if (err.statusCode === 410) {
        return isLatePaymentAfterHoldExpiry(payment);
    }
    if (err.statusCode === 409) {
        return isLatePaymentAfterHoldExpiry(payment);
    }
    if (err.statusCode === 400 && payment.status === PaymentStatus.FAILED) {
        return isLatePaymentAfterHoldExpiry(payment);
    }
    return false;
}
function isStripeAlreadyRefundedError(err) {
    if (!(err instanceof Error)) {
        return false;
    }
    const stripeErr = err;
    return (stripeErr.type === 'StripeInvalidRequestError' &&
        (stripeErr.code === 'charge_already_refunded' ||
            stripeErr.message.toLowerCase().includes('already been refunded')));
}
export async function refundLatePaymentAfterHoldExpiry(input) {
    const payment = await prisma.payment.findUnique({
        where: { id: input.paymentId },
        include: { booking: true },
    });
    if (!payment) {
        throw new ApiError(404, 'Payment not found');
    }
    if (payment.status === PaymentStatus.REFUNDED) {
        return {
            paymentId: payment.id,
            outcome: 'already_refunded',
        };
    }
    if (!isLatePaymentAfterHoldExpiry(payment)) {
        throw new ApiError(400, 'Automatic refund only applies to payments received after hold expiry');
    }
    let refundId;
    let refundRawResponse;
    try {
        const refund = await stripePaymentProvider.refundPayment({
            paymentIntentId: input.paymentIntentId,
            idempotencyKey: `refund-hold-expired-${payment.id}`,
            reason: input.reason,
        });
        refundId = refund.refundId;
        refundRawResponse = refund.rawResponse;
    }
    catch (err) {
        if (isStripeAlreadyRefundedError(err)) {
            logger.warn('Stripe payment already refunded; syncing local payment state', {
                category: 'payment',
                event: 'stripe_refund_already_refunded',
                paymentId: payment.id,
                paymentIntentId: input.paymentIntentId,
            });
        }
        else {
            await markRefundPendingForReconciliation(payment, input, err);
            return {
                paymentId: payment.id,
                outcome: 'refund_failed_manual_reconciliation',
            };
        }
    }
    const updated = await prisma.payment.updateMany({
        where: {
            id: payment.id,
            status: { in: REFUNDABLE_PAYMENT_STATUSES },
        },
        data: {
            status: PaymentStatus.REFUNDED,
            providerRef: input.paymentIntentId,
            refundedAt: new Date(),
            rawResponse: JSON.stringify({
                stripeEvent: input.stripeEventRaw,
                refund: refundRawResponse ?? null,
                reason: input.reason,
            }),
        },
    });
    if (updated.count === 0) {
        const current = await prisma.payment.findUnique({ where: { id: payment.id } });
        if (current?.status === PaymentStatus.REFUNDED) {
            return {
                paymentId: payment.id,
                outcome: 'already_refunded',
                refundId,
            };
        }
        throw new ApiError(409, 'Payment refund state could not be updated');
    }
    auditLogFrom(systemAuditContext, {
        action: AuditAction.PAYMENT_AUTO_REFUNDED_AFTER_HOLD_EXPIRY,
        entityType: AuditEntityType.PAYMENT,
        entityId: payment.id,
        metadata: {
            bookingId: payment.bookingId,
            paymentId: payment.id,
            paymentIntentId: input.paymentIntentId,
            refundId: refundId ?? null,
            reason: input.reason,
        },
    });
    return {
        paymentId: payment.id,
        outcome: 'auto_refunded',
        refundId,
    };
}
async function markRefundPendingForReconciliation(payment, input, err) {
    const message = err instanceof Error ? err.message : String(err);
    await prisma.payment.updateMany({
        where: {
            id: payment.id,
            status: { in: REFUNDABLE_PAYMENT_STATUSES },
        },
        data: {
            status: PaymentStatus.REFUND_PENDING,
            providerRef: input.paymentIntentId,
            rawResponse: JSON.stringify({
                stripeEvent: input.stripeEventRaw,
                refundError: message,
                reason: input.reason,
            }),
        },
    });
    logger.error('Automatic refund failed after hold expiry', {
        category: 'payment',
        event: 'stripe_auto_refund_failed',
        paymentId: payment.id,
        bookingId: payment.bookingId,
        paymentIntentId: input.paymentIntentId,
        error: message,
    });
    auditLogFrom(systemAuditContext, {
        action: AuditAction.PAYMENT_AUTO_REFUND_FAILED,
        entityType: AuditEntityType.PAYMENT,
        entityId: payment.id,
        metadata: {
            bookingId: payment.bookingId,
            paymentId: payment.id,
            paymentIntentId: input.paymentIntentId,
            reason: input.reason,
            error: message,
        },
    });
}
//# sourceMappingURL=latePaymentRefund.service.js.map