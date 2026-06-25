import type Stripe from 'stripe';
import { PaymentStatus } from '@prisma/client';
import { prisma } from '../../config/db.js';
import { logger } from '../../config/logger.js';
import { ApiError } from '../../core/utils/apiError.js';
import { AuditAction, AuditEntityType } from '../../core/audit/actions.js';
import { auditLogFrom } from '../../core/audit/auditLog.service.js';
import { systemAuditContext } from '../../core/audit/requestContext.js';
import { finalizeSuccessfulPayment } from './finalizeSuccessfulPayment.js';
import { stripePaymentProvider } from './providers/stripe-payment.provider.js';

const HANDLED_EVENT_TYPES = new Set([
  'payment_intent.succeeded',
  'payment_intent.payment_failed',
  'payment_intent.canceled',
]);

export type StripeWebhookResult = {
  received: true;
  type: string;
  handled: boolean;
  paymentId?: number;
  outcome?: string;
};

export async function processStripeWebhookEvent(
  payload: Buffer,
  signature: string,
): Promise<StripeWebhookResult> {
  let event: Stripe.Event;

  try {
    event = stripePaymentProvider.constructWebhookEvent(payload, signature);
  } catch {
    throw new ApiError(400, 'Invalid Stripe webhook signature');
  }

  if (!HANDLED_EVENT_TYPES.has(event.type)) {
    return {
      received: true,
      type: event.type,
      handled: false,
      outcome: 'ignored_unhandled_event_type',
    };
  }

  const paymentIntent = event.data.object as Stripe.PaymentIntent;

  switch (event.type) {
    case 'payment_intent.succeeded':
      return handlePaymentIntentSucceeded(event, paymentIntent);
    case 'payment_intent.payment_failed':
      return handlePaymentIntentFailed(event, paymentIntent);
    case 'payment_intent.canceled':
      return handlePaymentIntentCanceled(event, paymentIntent);
    default:
      return {
        received: true,
        type: event.type,
        handled: false,
        outcome: 'ignored_unhandled_event_type',
      };
  }
}

async function handlePaymentIntentSucceeded(
  event: Stripe.Event,
  paymentIntent: Stripe.PaymentIntent,
): Promise<StripeWebhookResult> {
  const payment = await resolvePaymentForIntent(paymentIntent);

  if (!payment) {
    logger.warn('Stripe webhook: payment not found for succeeded intent', {
      category: 'payment',
      event: 'stripe_webhook_payment_not_found',
      paymentIntentId: paymentIntent.id,
      metadata: paymentIntent.metadata,
    });

    return {
      received: true,
      type: event.type,
      handled: false,
      outcome: 'payment_not_found',
    };
  }

  const metadataBookingId = paymentIntent.metadata?.bookingId;
  if (
    metadataBookingId &&
    Number(metadataBookingId) !== payment.bookingId
  ) {
    logger.warn('Stripe webhook: metadata bookingId mismatch', {
      category: 'payment',
      event: 'stripe_webhook_metadata_mismatch',
      paymentId: payment.id,
      paymentIntentId: paymentIntent.id,
      metadataBookingId,
      actualBookingId: payment.bookingId,
    });
  }

  if (payment.status === PaymentStatus.SUCCESS) {
    return {
      received: true,
      type: event.type,
      handled: true,
      paymentId: payment.id,
      outcome: 'already_finalized',
    };
  }

  try {
    await finalizeSuccessfulPayment({
      paymentId: payment.id,
      providerRef: paymentIntent.id,
      rawResponse: JSON.stringify(event),
      audit: systemAuditContext,
    });
  } catch (err) {
    if (err instanceof ApiError && (err.statusCode === 410 || err.statusCode === 409)) {
      logger.error('Stripe webhook: payment succeeded but booking could not be finalized', {
        category: 'payment',
        event: 'stripe_webhook_finalize_blocked',
        paymentId: payment.id,
        bookingId: payment.bookingId,
        paymentIntentId: paymentIntent.id,
        statusCode: err.statusCode,
        message: err.message,
      });

      return {
        received: true,
        type: event.type,
        handled: false,
        paymentId: payment.id,
        outcome: err.statusCode === 410 ? 'hold_expired' : 'seats_unavailable',
      };
    }

    throw err;
  }

  return {
    received: true,
    type: event.type,
    handled: true,
    paymentId: payment.id,
    outcome: 'finalized',
  };
}

async function handlePaymentIntentFailed(
  event: Stripe.Event,
  paymentIntent: Stripe.PaymentIntent,
): Promise<StripeWebhookResult> {
  const payment = await resolvePaymentForIntent(paymentIntent);

  if (!payment) {
    logger.warn('Stripe webhook: payment not found for failed intent', {
      category: 'payment',
      event: 'stripe_webhook_payment_not_found',
      paymentIntentId: paymentIntent.id,
      metadata: paymentIntent.metadata,
    });

    return {
      received: true,
      type: event.type,
      handled: false,
      outcome: 'payment_not_found',
    };
  }

  if (payment.status !== PaymentStatus.PENDING) {
    return {
      received: true,
      type: event.type,
      handled: true,
      paymentId: payment.id,
      outcome: 'already_terminal',
    };
  }

  const updated = await prisma.payment.updateMany({
    where: {
      id: payment.id,
      status: PaymentStatus.PENDING,
    },
    data: {
      status: PaymentStatus.FAILED,
      providerRef: paymentIntent.id,
      rawResponse: JSON.stringify(event),
    },
  });

  if (updated.count === 0) {
    return {
      received: true,
      type: event.type,
      handled: true,
      paymentId: payment.id,
      outcome: 'already_terminal',
    };
  }

  auditLogFrom(systemAuditContext, {
    action: AuditAction.PAYMENT_FAILED,
    entityType: AuditEntityType.PAYMENT,
    entityId: payment.id,
    metadata: {
      bookingId: payment.bookingId,
      paymentIntentId: paymentIntent.id,
      reason: 'payment_intent_failed',
    },
  });

  return {
    received: true,
    type: event.type,
    handled: true,
    paymentId: payment.id,
    outcome: 'marked_failed',
  };
}

async function handlePaymentIntentCanceled(
  event: Stripe.Event,
  paymentIntent: Stripe.PaymentIntent,
): Promise<StripeWebhookResult> {
  const payment = await resolvePaymentForIntent(paymentIntent);

  if (!payment) {
    logger.warn('Stripe webhook: payment not found for canceled intent', {
      category: 'payment',
      event: 'stripe_webhook_payment_not_found',
      paymentIntentId: paymentIntent.id,
      metadata: paymentIntent.metadata,
    });

    return {
      received: true,
      type: event.type,
      handled: false,
      outcome: 'payment_not_found',
    };
  }

  if (payment.status !== PaymentStatus.PENDING) {
    return {
      received: true,
      type: event.type,
      handled: true,
      paymentId: payment.id,
      outcome: 'already_terminal',
    };
  }

  const updated = await prisma.payment.updateMany({
    where: {
      id: payment.id,
      status: PaymentStatus.PENDING,
    },
    data: {
      status: PaymentStatus.CANCELLED,
      providerRef: paymentIntent.id,
      rawResponse: JSON.stringify(event),
    },
  });

  if (updated.count === 0) {
    return {
      received: true,
      type: event.type,
      handled: true,
      paymentId: payment.id,
      outcome: 'already_terminal',
    };
  }

  auditLogFrom(systemAuditContext, {
    action: AuditAction.PAYMENT_FAILED,
    entityType: AuditEntityType.PAYMENT,
    entityId: payment.id,
    metadata: {
      bookingId: payment.bookingId,
      paymentIntentId: paymentIntent.id,
      reason: 'payment_intent_canceled',
    },
  });

  return {
    received: true,
    type: event.type,
    handled: true,
    paymentId: payment.id,
    outcome: 'marked_cancelled',
  };
}

async function resolvePaymentForIntent(paymentIntent: Stripe.PaymentIntent) {
  const paymentIdRaw = paymentIntent.metadata?.paymentId;
  const paymentId = paymentIdRaw ? Number(paymentIdRaw) : NaN;

  if (Number.isFinite(paymentId)) {
    const byId = await prisma.payment.findUnique({
      where: { id: paymentId },
      include: { booking: true },
    });

    if (byId) {
      return byId;
    }
  }

  return prisma.payment.findFirst({
    where: { providerRef: paymentIntent.id },
    include: { booking: true },
  });
}