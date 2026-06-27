import type { Payment } from '@prisma/client';

export type StripePaymentState = 'ready' | 'processing' | 'completed';

export type StripeInitiatePaymentResult = {
  paymentId: number;
  clientSecret: string | null;
  paymentIntentId: string;
  bookingId: number;
  amount: number;
  status: string;
  provider: 'STRIPE';
  /** ready = pay now; processing = in flight, do not create a new PI; completed = confirmed */
  paymentState: StripePaymentState;
};

export type InitiatePaymentResult = Payment | StripeInitiatePaymentResult;

export function isStripeInitiateResult(
  result: InitiatePaymentResult,
): result is StripeInitiatePaymentResult {
  return (
    typeof result === 'object' &&
    result !== null &&
    'paymentIntentId' in result &&
    'clientSecret' in result
  );
}
