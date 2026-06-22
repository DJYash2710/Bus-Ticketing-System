type AuthLogMeta = {
    event: string;
    userId?: number;
    email?: string;
    ip?: string;
};
export declare function logAuthEvent(level: "info" | "warn", message: string, meta: AuthLogMeta): void;
export {};
//# sourceMappingURL=authLog.d.ts.map