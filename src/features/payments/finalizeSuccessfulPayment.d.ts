import { type Payment } from "@prisma/client";
import type { AuditContext } from "../../core/audit/requestContext.js";
export type FinalizeSuccessfulPaymentInput = {
    paymentId: number;
    providerRef: string;
    rawResponse: string;
    audit: AuditContext;
};
/**
 * Provider-agnostic booking confirmation after external payment succeeds.
 * Used by mock confirm and (future) Stripe webhooks.
 */
export declare function finalizeSuccessfulPayment(input: FinalizeSuccessfulPaymentInput): Promise<Payment>;
//# sourceMappingURL=finalizeSuccessfulPayment.d.ts.map