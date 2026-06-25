// src/config/stripe.ts
import Stripe from 'stripe';
import { env } from './env.js';
import { ApiError } from '../core/utils/apiError.js';
const globalForStripe = globalThis;
function createStripeClient() {
    if (!env.stripe.secretKey) {
        throw new ApiError(500, 'STRIPE_SECRET_KEY is not configured');
    }
    return new Stripe(env.stripe.secretKey);
}
/** Lazily initialized Stripe SDK client (singleton). */
export function getStripeClient() {
    const client = globalForStripe.stripe ?? createStripeClient();
    if (process.env.NODE_ENV !== 'production') {
        globalForStripe.stripe = client;
    }
    return client;
}
export function isStripeConfigured() {
    return env.stripe.secretKey.length > 0;
}
//# sourceMappingURL=stripe.js.map