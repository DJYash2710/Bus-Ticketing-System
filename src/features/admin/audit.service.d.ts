import type { Prisma } from "@prisma/client";
export type ListAuditLogsInput = {
    page?: number;
    limit?: number;
    action?: string;
    actorId?: number;
    entityType?: string;
    fromDate?: string;
    toDate?: string;
};
export declare function listAuditLogs(input: ListAuditLogsInput): Promise<{
    logs: {
        userAgent: string | null;
        id: number;
        action: string;
        entityType: string;
        actorId: number | null;
        createdAt: Date;
        actorRole: string | null;
        entityId: number | null;
        metadata: Prisma.JsonValue | null;
        ipAddress: string | null;
    }[];
    pagination: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
    };
}>;
export declare function getAuditLogById(id: number): Promise<{
    userAgent: string | null;
    id: number;
    action: string;
    entityType: string;
    actorId: number | null;
    createdAt: Date;
    actorRole: string | null;
    entityId: number | null;
    metadata: Prisma.JsonValue | null;
    ipAddress: string | null;
}>;
//# sourceMappingURL=audit.service.d.ts.map