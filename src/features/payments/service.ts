import {
  PaymentStatus,
  BookingStatus,
  type Booking,
  type Payment,
} from "@prisma/client";
import { prisma } from "../../config/db.js";
import { env } from "../../config/env.js";
import { isStripeConfigured } from "../../config/stripe.js";
import { ApiError } from "../../core/utils/apiError.js";
import { expireBookingHold, expireStaleHolds } from "../bookings/holdExpiry.js";
import { AuditAction, AuditEntityType } from "../../core/audit/actions.js";
import { auditLogFrom } from "../../core/audit/auditLog.service.js";
import type { AuditContext } from "../../core/audit/requestContext.js";
import { systemAuditContext } from "../../core/audit/requestContext.js";
import { finalizeSuccessfulPayment } from "./finalizeSuccessfulPayment.js";
import {
  isLatePaymentAfterHoldExpiry,
  refundLatePaymentAfterHoldExpiry,
  shouldAutoRefundAfterFinalizeError,
} from "./latePaymentRefund.service.js";
import type {
  InitiatePaymentResult,
  StripeInitiatePaymentResult,
  StripePaymentState,
} from "./initiatePayment.types.js";
import { PAYMENT_PROVIDERS } from "./providers/payment-provider.types.js";
import { stripePaymentProvider } from "./providers/stripe-payment.provider.js";

async function loadPayableBooking(
  bookingId: number,
  userId: number,
): Promise<Booking> {
  const booking = await prisma.booking.findFirst({
    where: { id: bookingId, userId },
  });

  if (!booking) throw new ApiError(404, "Booking not found");

  if (booking.status === BookingStatus.EXPIRED) {
    throw new ApiError(410, "Seat hold has expired. Please book again.");
  }

  if (booking.status === BookingStatus.CANCELLED) {
    throw new ApiError(400, "Cannot pay for a cancelled booking");
  }

  if (booking.status !== BookingStatus.PENDING) {
    throw new ApiError(400, "Booking is not awaiting payment");
  }

  if (booking.holdExpiresAt && booking.holdExpiresAt < new Date()) {
    await expireBookingHold(booking.id);
    throw new ApiError(410, "Seat hold has expired. Please book again.");
  }

  if (booking.paymentStatus === PaymentStatus.SUCCESS) {
    throw new ApiError(400, "Booking is already paid");
  }

  return booking;
}

function toStripeInitiateResponse(
  payment: Payment,
  clientSecret: string | null,
  paymentState: StripePaymentState,
): StripeInitiatePaymentResult {
  if (!payment.providerRef) {
    throw new ApiError(500, "Stripe payment is missing providerRef");
  }

  return {
    paymentId: payment.id,
    clientSecret,
    paymentIntentId: payment.providerRef,
    bookingId: payment.bookingId,
    amount: Number(payment.amount),
    status: payment.status,
    provider: "STRIPE",
    paymentState,
  };
}

/** PI states where money may be in flight — never create a replacement intent. */
const STRIPE_PI_IN_FLIGHT = new Set([
  "succeeded",
  "processing",
  "requires_capture",
]);

/** PI states where the customer can still complete payment on the existing intent. */
const STRIPE_PI_PAYABLE = new Set([
  "requires_payment_method",
  "requires_confirmation",
  "requires_action",
]);

function isStripePiRefreshable(stripeStatus: string, mappedStatus: string): boolean {
  if (stripeStatus === "canceled") {
    return true;
  }

  return mappedStatus === "failed" || mappedStatus === "cancelled";
}

async function finalizeStripePaymentIfSucceeded(
  payment: Payment,
  providerRef: string,
  rawResponse: string,
  audit?: AuditContext,
): Promise<Payment> {
  if (payment.status === PaymentStatus.SUCCESS) {
    return payment;
  }

  return finalizeSuccessfulPayment({
    paymentId: payment.id,
    providerRef,
    rawResponse,
    audit: audit ?? systemAuditContext,
  });
}

async function handleInFlightStripePaymentIntent(
  payment: Payment,
  stripeStatus: string,
  providerRef: string,
  rawResponse: string,
  audit?: AuditContext,
): Promise<StripeInitiatePaymentResult> {
  if (stripeStatus === "succeeded") {
    const paymentWithBooking = await prisma.payment.findUnique({
      where: { id: payment.id },
      include: { booking: true },
    });

    if (!paymentWithBooking) {
      throw new ApiError(404, "Payment not found");
    }

    if (isLatePaymentAfterHoldExpiry(paymentWithBooking)) {
      await refundLatePaymentAfterHoldExpiry({
        paymentId: payment.id,
        paymentIntentId: providerRef,
        stripeEventRaw: rawResponse,
        reason: "hold_expired",
      });

      const refunded = await prisma.payment.findUnique({ where: { id: payment.id } });
      return toStripeInitiateResponse(
        refunded ?? payment,
        null,
        refunded?.status === PaymentStatus.REFUNDED ? "completed" : "processing",
      );
    }

    try {
      const finalized = await finalizeStripePaymentIfSucceeded(
        payment,
        providerRef,
        rawResponse,
        audit,
      );

      return toStripeInitiateResponse(finalized, null, "completed");
    } catch (err) {
      if (
        paymentWithBooking &&
        shouldAutoRefundAfterFinalizeError(err, paymentWithBooking)
      ) {
        await refundLatePaymentAfterHoldExpiry({
          paymentId: payment.id,
          paymentIntentId: providerRef,
          stripeEventRaw: rawResponse,
          reason: "hold_expired",
        });

        const refunded = await prisma.payment.findUnique({ where: { id: payment.id } });
        return toStripeInitiateResponse(
          refunded ?? payment,
          null,
          refunded?.status === PaymentStatus.REFUNDED ? "completed" : "processing",
        );
      }

      throw err;
    }
  }

  return toStripeInitiateResponse(payment, null, "processing");
}

async function reuseOrRefreshStripePayment(
  payment: Payment,
  audit?: AuditContext,
): Promise<StripeInitiatePaymentResult> {
  if (payment.status === PaymentStatus.SUCCESS) {
    return toStripeInitiateResponse(payment, null, "completed");
  }

  if (
    payment.status !== PaymentStatus.PENDING &&
    payment.status !== PaymentStatus.FAILED &&
    payment.status !== PaymentStatus.CANCELLED
  ) {
    throw new ApiError(400, "Payment is not awaiting initiation");
  }

  if (payment.providerRef) {
    const remote = await stripePaymentProvider.retrievePayment(payment.providerRef);

    if (STRIPE_PI_IN_FLIGHT.has(remote.stripeStatus)) {
      return handleInFlightStripePaymentIntent(
        payment,
        remote.stripeStatus,
        remote.providerRef,
        remote.rawResponse,
        audit,
      );
    }

    if (STRIPE_PI_PAYABLE.has(remote.stripeStatus)) {
      const clientSecret = await stripePaymentProvider.getClientSecret(
        payment.providerRef,
      );

      return toStripeInitiateResponse(payment, clientSecret, "ready");
    }

    if (!isStripePiRefreshable(remote.stripeStatus, remote.status)) {
      return toStripeInitiateResponse(payment, null, "processing");
    }
  }

  const refreshed = await attachStripePaymentIntent(payment, payment.bookingId);
  return toStripeInitiateResponse(
    refreshed.payment,
    refreshed.clientSecret,
    "ready",
  );
}

function logPaymentCreated(
  payment: Payment,
  bookingId: number,
  audit: AuditContext | undefined,
  userId: number,
): void {
  auditLogFrom(audit ?? { actorId: userId, actorRole: "USER" }, {
    action: AuditAction.PAYMENT_CREATED,
    entityType: AuditEntityType.PAYMENT,
    entityId: payment.id,
    metadata: {
      bookingId,
      amount: Number(payment.amount),
      provider: payment.provider,
    },
  });
}

async function attachStripePaymentIntent(
  payment: Payment,
  bookingId: number,
): Promise<{ payment: Payment; clientSecret: string }> {
  const stripeResult = await stripePaymentProvider.createPayment({
    bookingId,
    paymentId: payment.id,
    amount: Number(payment.amount),
  });

  if (!stripeResult.clientSecret) {
    throw new ApiError(500, "Stripe did not return a client secret");
  }

  const updated = await prisma.payment.update({
    where: { id: payment.id },
    data: {
      provider: PAYMENT_PROVIDERS.STRIPE,
      providerRef: stripeResult.providerRef,
      rawResponse: stripeResult.rawResponse,
      status: PaymentStatus.PENDING,
    },
  });

  return {
    payment: updated,
    clientSecret: stripeResult.clientSecret,
  };
}

async function initiateMockPayment(
  booking: Booking,
  userId: number,
  audit?: AuditContext,
): Promise<Payment> {
  const existing = await prisma.payment.findUnique({ where: { bookingId: booking.id } });
  if (existing) {
    return existing;
  }

  const payment = await prisma.payment.create({
    data: {
      bookingId: booking.id,
      provider: PAYMENT_PROVIDERS.MOCK,
      amount: booking.totalAmount,
      status: PaymentStatus.PENDING,
    },
  });

  logPaymentCreated(payment, booking.id, audit, userId);
  return payment;
}

async function initiateStripePayment(
  booking: Booking,
  userId: number,
  audit?: AuditContext,
): Promise<StripeInitiatePaymentResult> {
  if (!isStripeConfigured()) {
    throw new ApiError(500, "STRIPE_SECRET_KEY is not configured");
  }

  const existing = await prisma.payment.findUnique({ where: { bookingId: booking.id } });

  if (existing) {
    if (existing.provider === PAYMENT_PROVIDERS.STRIPE) {
      return reuseOrRefreshStripePayment(existing, audit);
    }

    if (existing.provider === PAYMENT_PROVIDERS.MOCK && existing.status === PaymentStatus.PENDING) {
      if (existing.providerRef) {
        return reuseOrRefreshStripePayment(existing, audit);
      }

      const { payment: upgraded, clientSecret } = await attachStripePaymentIntent(
        existing,
        booking.id,
      );
      return toStripeInitiateResponse(upgraded, clientSecret, "ready");
    }

    if (existing.status === PaymentStatus.FAILED || existing.status === PaymentStatus.CANCELLED) {
      const reset = await prisma.payment.update({
        where: { id: existing.id },
        data: {
          provider: PAYMENT_PROVIDERS.STRIPE,
          providerRef: null,
          rawResponse: null,
          status: PaymentStatus.PENDING,
          paidAt: null,
        },
      });

      const { payment: linked, clientSecret } = await attachStripePaymentIntent(
        reset,
        booking.id,
      );
      logPaymentCreated(linked, booking.id, audit, userId);
      return toStripeInitiateResponse(linked, clientSecret, "ready");
    }

    return reuseOrRefreshStripePayment(existing, audit);
  }

  const payment = await prisma.payment.create({
    data: {
      bookingId: booking.id,
      provider: PAYMENT_PROVIDERS.STRIPE,
      amount: booking.totalAmount,
      status: PaymentStatus.PENDING,
    },
  });

  const { payment: linked, clientSecret } = await attachStripePaymentIntent(
    payment,
    booking.id,
  );
  logPaymentCreated(linked, booking.id, audit, userId);

  return toStripeInitiateResponse(linked, clientSecret, "ready");
}

export async function initiatePayment(
  bookingId: number,
  userId: number,
  audit?: AuditContext,
): Promise<InitiatePaymentResult> {
  await expireStaleHolds();

  const booking = await loadPayableBooking(bookingId, userId);

  if (env.paymentProvider === PAYMENT_PROVIDERS.STRIPE) {
    return initiateStripePayment(booking, userId, audit);
  }

  return initiateMockPayment(booking, userId, audit);
}

export async function confirmPayment(
  paymentId: number,
  userId: number,
  audit?: AuditContext,
) {
  await expireStaleHolds();

  const payment = await prisma.payment.findUnique({
    where: { id: paymentId },
    include: {
      booking: {
        include: {
          seats: true,
        },
      },
    },
  });

  if (!payment) throw new ApiError(404, "Payment not found");
  if (payment.booking.userId !== userId) throw new ApiError(403, "Forbidden");

  if (payment.provider === PAYMENT_PROVIDERS.STRIPE) {
    throw new ApiError(
      400,
      "Stripe payments are completed via the payment gateway. Do not confirm manually.",
    );
  }

  if (payment.status === PaymentStatus.SUCCESS) {
    throw new ApiError(400, "Payment already confirmed");
  }

  if (payment.booking.status === BookingStatus.EXPIRED) {
    throw new ApiError(410, "Seat hold has expired. Please book again.");
  }

  if (payment.booking.status !== BookingStatus.PENDING) {
    throw new ApiError(400, "Booking is not awaiting payment confirmation");
  }

  if (
    payment.booking.holdExpiresAt &&
    payment.booking.holdExpiresAt < new Date()
  ) {
    await expireBookingHold(payment.booking.id);
    throw new ApiError(410, "Seat hold has expired. Please book again.");
  }

  const auditCtx = audit ?? { actorId: userId, actorRole: "USER" };

  return finalizeSuccessfulPayment({
    paymentId,
    providerRef: `MOCK-TXN-${Date.now()}`,
    rawResponse: JSON.stringify({ note: "Mock payment confirmed" }),
    audit: auditCtx,
  });
}

export async function getPaymentByBookingId(bookingId: number, userId: number) {
  const booking = await prisma.booking.findFirst({
    where: { id: bookingId, userId },
  });

  if (!booking) throw new ApiError(404, "Booking not found");

  let payment = await prisma.payment.findUnique({
    where: { bookingId },
  });

  if (!payment) throw new ApiError(404, "No payment found for this booking");

  return syncPendingStripePayment(payment);
}

/** When webhook delivery is delayed, reconcile a succeeded PI from Stripe directly. */
async function syncPendingStripePayment(payment: Payment): Promise<Payment> {
  if (
    env.paymentProvider !== PAYMENT_PROVIDERS.STRIPE ||
    payment.provider !== PAYMENT_PROVIDERS.STRIPE ||
    payment.status !== PaymentStatus.PENDING ||
    !payment.providerRef ||
    !isStripeConfigured()
  ) {
    return payment;
  }

  const paymentWithBooking = await prisma.payment.findUnique({
    where: { id: payment.id },
    include: { booking: true },
  });

  if (!paymentWithBooking) {
    return payment;
  }

  const remote = await stripePaymentProvider.retrievePayment(payment.providerRef);

  if (!STRIPE_PI_IN_FLIGHT.has(remote.stripeStatus)) {
    return payment;
  }

  if (remote.stripeStatus === "succeeded") {
    if (isLatePaymentAfterHoldExpiry(paymentWithBooking)) {
      await refundLatePaymentAfterHoldExpiry({
        paymentId: payment.id,
        paymentIntentId: remote.providerRef,
        stripeEventRaw: remote.rawResponse,
        reason: "hold_expired",
      });
    } else {
      try {
        await finalizeStripePaymentIfSucceeded(
          payment,
          remote.providerRef,
          remote.rawResponse,
        );
      } catch (err) {
        if (shouldAutoRefundAfterFinalizeError(err, paymentWithBooking)) {
          await refundLatePaymentAfterHoldExpiry({
            paymentId: payment.id,
            paymentIntentId: remote.providerRef,
            stripeEventRaw: remote.rawResponse,
            reason: "hold_expired",
          });
        }
      }
    }
  }

  return (
    (await prisma.payment.findUnique({ where: { id: payment.id } })) ?? payment
  );
}
