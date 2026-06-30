export type StripeWebhookResult = {
    received: true;
    type: string;
    handled: boolean;
    paymentId?: number;
    outcome?: string;
};
export declare function processStripeWebhookEvent(payload: Buffer, signature: string): Promise<StripeWebhookResult>;
//# sourceMappingURL=stripeWebhook.service.d.ts.map