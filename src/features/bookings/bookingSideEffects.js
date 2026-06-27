import { LoyaltyEventType } from "@prisma/client";
export async function reverseBookingIncentives(tx, bookingId, userId) {
    const redemption = await tx.couponRedemption.findFirst({
        where: { bookingId },
    });
    if (redemption) {
        await tx.couponRedemption.delete({ where: { id: redemption.id } });
        await tx.coupon.update({
            where: { id: redemption.couponId },
            data: { usedCount: { decrement: 1 } },
        });
    }
    const redeemEvent = await tx.loyaltyEvent.findFirst({
        where: { bookingId, type: LoyaltyEventType.REDEEM_BOOKING },
    });
    if (redeemEvent && redeemEvent.credits < 0) {
        const existingRestoration = await tx.loyaltyEvent.findFirst({
            where: {
                bookingId,
                type: LoyaltyEventType.ADJUSTMENT,
                credits: { gt: 0 },
            },
        });
        if (!existingRestoration) {
            const creditsToRestore = Math.abs(redeemEvent.credits);
            await tx.user.update({
                where: { id: userId },
                data: { creditsBalance: { increment: creditsToRestore } },
            });
            await tx.loyaltyEvent.create({
                data: {
                    userId,
                    bookingId,
                    type: LoyaltyEventType.ADJUSTMENT,
                    credits: creditsToRestore,
                    description: `Restored ${creditsToRestore} credits after booking #${bookingId} release`,
                },
            });
        }
    }
}
//# sourceMappingURL=bookingSideEffects.js.map