import { createApp } from './app/index.js';
import { env } from './shared/config/env.js';
import { logger } from './shared/config/logger.js';
import { closePool, healthcheck } from './shared/db/index.js';
import { startOutboxWorker, stopOutboxWorker } from './shared/events/outbox.service.js';
import { startReservationSweeper, stopReservationSweeper } from './shared/events/reservationSweeper.js';

let server;

async function shutdown(signal) {
  logger.info('Shutting down server', { signal });

  stopOutboxWorker();
  stopReservationSweeper();

  if (server) {
    await new Promise((resolve, reject) => {
      server.close((error) => {
        if (error) {
          reject(error);
          return;
        }
        resolve();
      });
    });
  }

  await closePool();
  process.exit(0);
}

async function bootstrap() {
  await healthcheck();
  const app = createApp();
  server = app.listen(env.PORT, () => {
    logger.info('API server started', { port: env.PORT, env: env.NODE_ENV });
  });

  startOutboxWorker();
  startReservationSweeper();
}

bootstrap().catch(async (error) => {
  logger.error('Server bootstrap failed', { error: error.message });
  await closePool();
  process.exit(1);
});

process.on('SIGINT', () => {
  shutdown('SIGINT').catch((error) => {
    logger.error('Graceful shutdown failed', { error: error.message });
    process.exit(1);
  });
});

process.on('SIGTERM', () => {
  shutdown('SIGTERM').catch((error) => {
    logger.error('Graceful shutdown failed', { error: error.message });
    process.exit(1);
  });
});
