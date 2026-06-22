import { PaymentStatus } from "@prisma/client";
/** Simulates mock-provider refund completion (no external integration). */
export async function simulateMockRefund(tx, paymentId) {
    await tx.payment.update({
        where: {
            id: paymentId,
            status: PaymentStatus.REFUND_PENDING,
        },
        data: {
            status: PaymentStatus.REFUNDED,
            refundedAt: new Date(),
            rawResponse: JSON.stringify({ note: "Mock refund processed" }),
        },
    });
}
//# sourceMappingURL=refund.js.map