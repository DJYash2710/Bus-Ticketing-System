// src/server.ts
import { app } from './app.js';
import { env } from './config/env.js';
import { logger } from './config/logger.js';

const port = Number(env.port);

app.listen(port, () => {
  logger.info(`Server running on http://localhost:${port}`);
});