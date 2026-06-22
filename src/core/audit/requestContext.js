export function auditContextFromRequest(req, user) {
    const actor = user ?? req.user;
    return {
        actorId: actor?.id ?? null,
        actorRole: actor?.role ?? null,
        ipAddress: req.ip ?? null,
        userAgent: typeof req.headers["user-agent"] === "string"
            ? req.headers["user-agent"]
            : null,
    };
}
export function auditContextFromClient(actorId, actorRole, client) {
    return {
        actorId: actorId ?? null,
        actorRole: actorRole ?? null,
        ipAddress: client.ipAddress,
        userAgent: client.userAgent,
    };
}
export const systemAuditContext = {
    actorId: null,
    actorRole: "SYSTEM",
    ipAddress: null,
    userAgent: null,
};
//# sourceMappingURL=requestContext.js.map