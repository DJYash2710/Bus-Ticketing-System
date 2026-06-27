export declare function getLoyaltySummary(userId: number): Promise<{
    creditsBalance: number;
    referralCode: string | null;
    lifetimeEarned: number;
    lifetimeRedeemed: number;
} | null>;
export declare function getLoyaltyHistory(userId: number): Promise<({
    booking: {
        status: import(".prisma/client").$Enums.BookingStatus;
        id: number;
        totalAmount: import("@prisma/client/runtime/library").Decimal;
    } | null;
} & {
    id: number;
    type: import(".prisma/client").$Enums.LoyaltyEventType;
    description: string | null;
    createdAt: Date;
    userId: number;
    bookingId: number | null;
    credits: number;
})[]>;
//# sourceMappingURL=service.d.ts.map