import { env } from '../../../config/env.js';
import { getStripeClient } from '../../../config/stripe.js';
import { ApiError } from '../../../core/utils/apiError.js';
import { PAYMENT_PROVIDERS, } from './payment-provider.types.js';
const DEFAULT_CURRENCY = 'inr';
function toMinorUnits(amount) {
    return Math.round(amount * 100);
}
function mapPaymentIntentStatus(status) {
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
export class StripePaymentProvider {
    name = PAYMENT_PROVIDERS.STRIPE;
    async createPayment(input) {
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
            rawResponse: JSON.stringify(paymentIntent),
        };
    }
    async retrievePayment(providerRef) {
        const stripe = getStripeClient();
        const paymentIntent = await stripe.paymentIntents.retrieve(providerRef);
        return {
            providerRef: paymentIntent.id,
            status: mapPaymentIntentStatus(paymentIntent.status),
            rawResponse: JSON.stringify(paymentIntent),
        };
    }
    constructWebhookEvent(payload, signature) {
        if (!env.stripe.webhookSecret) {
            throw new ApiError(500, 'STRIPE_WEBHOOK_SECRET is not configured');
        }
        const stripe = getStripeClient();
        return stripe.webhooks.constructEvent(payload, signature, env.stripe.webhookSecret);
    }
}
export const stripePaymentProvider = new StripePaymentProvider();
//# sourceMappingURL=stripe-payment.provider.js.map