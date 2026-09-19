import { createApp } from './app';
import { env } from './config/env';
import { logger } from './lib/logger';
import { prisma } from './lib/prisma';
import { startMqttSubscriber } from './mqtt/subscriber';

const app = createApp();
const server = app.listen(env.PORT, () => {
  logger.info(`Backend listening on port ${env.PORT} (${env.NODE_ENV})`);
});
const mqttSubscriber = startMqttSubscriber();

const closeHttpServer = (): Promise<void> =>
  new Promise((resolve, reject) => server.close((err) => (err ? reject(err) : resolve())));

// Stops taking new work first (MQTT messages, then HTTP requests), and closes the database last so writes in
// flight can finish.
const shutdown = async (signal: string): Promise<void> => {
  logger.info(`${signal} received, shutting down`);
  setTimeout(() => process.exit(1), 10_000).unref();
  try {
    await mqttSubscriber.stop();
    await closeHttpServer();
    await prisma.$disconnect();
    process.exit(0);
  } catch (err) {
    logger.error('Error during shutdown', { err });
    process.exit(1);
  }
};

process.on('SIGTERM', () => void shutdown('SIGTERM'));
process.on('SIGINT', () => void shutdown('SIGINT'));
process.on('unhandledRejection', (reason) => logger.error('Unhandled rejection', { reason }));
process.on('uncaughtException', (err) => {
  logger.error('Uncaught exception', { err });
  process.exit(1);
});
