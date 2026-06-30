import type Stripe from 'stripe';
import { type CreateProviderPaymentInput, type CreateProviderPaymentResult, type PaymentProvider, type RefundPaymentInput, type RefundPaymentResult, type RetrieveProviderPaymentResult } from './payment-provider.types.js';
export declare class StripePaymentProvider implements PaymentProvider {
    readonly name: "STRIPE";
    createPayment(input: CreateProviderPaymentInput): Promise<CreateProviderPaymentResult>;
    retrievePayment(providerRef: string): Promise<RetrieveProviderPaymentResult>;
    getClientSecret(providerRef: string): Promise<string | null>;
    refundPayment(input: RefundPaymentInput): Promise<RefundPaymentResult>;
    constructWebhookEvent(payload: string | Buffer, signature: string): Stripe.Event;
}
export declare const stripePaymentProvider: StripePaymentProvider;
//# sourceMappingURL=stripe-payment.provider.d.ts.map