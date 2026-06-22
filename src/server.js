// src/server.ts
import { app } from "./app.js";
import { env } from "./config/env.js";
import { logger } from "./config/logger.js";
import { startHoldExpiryJob } from "./features/bookings/holdExpiry.js";
const port = Number(env.port);
app.listen(port, "0.0.0.0", () => {
    startHoldExpiryJob();
    logger.info(`Server running on http://localhost:${port}`);
});
//# sourceMappingURL=server.js.map