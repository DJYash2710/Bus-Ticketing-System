export declare function readRecentLogs(lines?: number): Promise<{
    file: string;
    linesRequested: number;
    linesReturned: number;
    logs: any[];
    message?: never;
} | {
    file: string;
    linesRequested: number;
    linesReturned: number;
    logs: never[];
    message: string;
}>;
//# sourceMappingURL=logs.service.d.ts.map