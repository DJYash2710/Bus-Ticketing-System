import { PaymentStatus, type Prisma } from "@prisma/client";

/** Simulates mock-provider refund completion (no external integration). */
export async function simulateMockRefund(
  tx: Prisma.TransactionClient,
  paymentId: number,
): Promise<boolean> {
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
