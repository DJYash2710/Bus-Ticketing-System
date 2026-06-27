import { PaymentStatus } from "@prisma/client";
/** Simulates mock-provider refund completion (no external integration). */
export async function simulateMockRefund(tx, paymentId) {
    const result = await tx.payment.updateMany({
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
    return result.count > 0;
}
//# sourceMappingURL=refund.js.map