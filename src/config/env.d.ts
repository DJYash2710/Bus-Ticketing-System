export declare const env: {
    nodeEnv: string;
    port: string;
    databaseUrl: string;
    jwtAccessSecret: string;
    jwtRefreshSecret: string;
    referralBonusCredits: number;
    loyaltyEarnRate: number;
    loyaltyPointValue: number;
    platformCommissionRate: number;
    redisUrl: string;
    trustProxy: boolean;
    rateLimit: {
        enabled: boolean;
        strict: {
            windowMs: number;
            max: number;
        };
        moderate: {
            windowMs: number;
            max: number;
        };
    };
};
//# sourceMappingURL=env.d.ts.map