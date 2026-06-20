import { prisma } from "../../config/db.js";

export async function getLoyaltySummary(userId: number) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      creditsBalance: true,
      referralCode: true,
    },
  });

  if (!user) return null;

  const [earned, redeemed] = await Promise.all([
    prisma.loyaltyEvent.aggregate({
      where: {
        userId,
        credits: { gt: 0 },
      },
      _sum: { credits: true },
    }),
    prisma.loyaltyEvent.aggregate({
      where: {
        userId,
        credits: { lt: 0 },
      },
      _sum: { credits: true },
    }),
  ]);

  return {
    creditsBalance: user.creditsBalance,
    referralCode: user.referralCode,
    lifetimeEarned: earned._sum.credits ?? 0,
    lifetimeRedeemed: Math.abs(redeemed._sum.credits ?? 0),
  };
}

export async function getLoyaltyHistory(userId: number) {
  return prisma.loyaltyEvent.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    include: {
      booking: {
        select: {
          id: true,
          totalAmount: true,
          status: true,
        },
      },
    },
  });
}
