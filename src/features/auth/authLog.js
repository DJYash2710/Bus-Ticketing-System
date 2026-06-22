import { logger } from "../../config/logger.js";
export function logAuthEvent(level, message, meta) {
    logger.log(level, message, {
        category: "auth",
        ...meta,
        timestamp: new Date().toISOString(),
    });
}
//# sourceMappingURL=authLog.js.map