import { env } from './config/env';
import { app } from './app';
import { logger } from './utils/logger';

/**
 * Application entry point.
 * Loads environment variables and starts the HTTP server.
 */

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  logger.info(`Server started on port ${env.PORT}`);
});
