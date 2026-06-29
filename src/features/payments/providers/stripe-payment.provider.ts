import type Stripe from 'stripe';
import { env } from '../../../config/env.js';
import { getStripeClient } from '../../../config/stripe.js';
import { ApiError } from '../../../core/utils/apiError.js';
import {
  PAYMENT_PROVIDERS,
  type CreateProviderPaymentInput,
  type CreateProviderPaymentResult,
  type PaymentProvider,
  type ProviderPaymentStatus,
  type RefundPaymentInput,
  type RefundPaymentResult,
  type RetrieveProviderPaymentResult,
} from './payment-provider.types.js';

const DEFAULT_CURRENCY = 'inr';

function compactStripeSnapshot(obj: {
  id: string;
  status: string;
  amount?: number | null;
  currency?: string | null;
}) {
  return JSON.stringify({
    id: obj.id,
    status: obj.status,
    amount: obj.amount,
    currency: obj.currency,
  });
}

function toMinorUnits(amount: number): number {
  return Math.round(amount * 100);
}

function mapPaymentIntentStatus(
  status: Stripe.PaymentIntent.Status,
): ProviderPaymentStatus {
  switch (status) {
    case 'succeeded':
      return 'succeeded';
    case 'canceled':
      return 'cancelled';
    case 'requires_payment_method':
    case 'requires_confirmation':
    case 'requires_action':
    case 'processing':
    case 'requires_capture':
      return 'pending';
    default:
      return 'failed';
  }
}

export class StripePaymentProvider implements PaymentProvider {
  readonly name = PAYMENT_PROVIDERS.STRIPE;

  async createPayment(
    input: CreateProviderPaymentInput,
  ): Promise<CreateProviderPaymentResult> {
    const stripe = getStripeClient();
    const currency = input.currency ?? DEFAULT_CURRENCY;

    const paymentIntent = await stripe.paymentIntents.create({
      amount: toMinorUnits(input.amount),
      currency,
      metadata: {
        bookingId: String(input.bookingId),
        paymentId: String(input.paymentId),
        ...input.metadata,
      },
    });

    return {
      providerRef: paymentIntent.id,
      clientSecret: paymentIntent.client_secret,
      rawResponse: compactStripeSnapshot(paymentIntent),
    };
  }

  async retrievePayment(
    providerRef: string,
  ): Promise<RetrieveProviderPaymentResult> {
    const stripe = getStripeClient();
    const paymentIntent = await stripe.paymentIntents.retrieve(providerRef);

    return {
      providerRef: paymentIntent.id,
      status: mapPaymentIntentStatus(paymentIntent.status),
      stripeStatus: paymentIntent.status,
      rawResponse: compactStripeSnapshot(paymentIntent),
    };
  }

  async getClientSecret(providerRef: string): Promise<string | null> {
    const stripe = getStripeClient();
    const paymentIntent = await stripe.paymentIntents.retrieve(providerRef);
    return paymentIntent.client_secret;
  }

  async refundPayment(input: RefundPaymentInput): Promise<RefundPaymentResult> {
    const stripe = getStripeClient();

    const refund = await stripe.refunds.create(
      {
        payment_intent: input.paymentIntentId,
        metadata: input.reason ? { reason: input.reason } : undefined,
      },
      {
        idempotencyKey: input.idempotencyKey,
      },
    );

    return {
      refundId: refund.id,
      rawResponse: compactStripeSnapshot(refund),
    };
  }

  constructWebhookEvent(
    payload: string | Buffer,
    signature: string,
  ): Stripe.Event {
    if (!env.stripe.webhookSecret) {
      throw new ApiError(500, 'STRIPE_WEBHOOK_SECRET is not configured');
    }

    const stripe = getStripeClient();
    return stripe.webhooks.constructEvent(
      payload,
      signature,
      env.stripe.webhookSecret,
    );
  }
}

export const stripePaymentProvider = new StripePaymentProvider();
