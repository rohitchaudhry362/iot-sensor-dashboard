import { env } from './config/env';
import { logger } from './lib/logger';
import { connectToBroker } from './mqtt/connection';
import { startActivityPublisher } from './publishers/activityPublisher';

// A fixed id means a second simulator started by accident replaces the first instead of duplicating messages.
const CLIENT_ID = 'homepulse-simulator';

const main = (): void => {
  const client = connectToBroker(env.MQTT_URL, CLIENT_ID, logger);
  let stopActivityPublisher: (() => void) | undefined;

  // Start publishing on the first connection only; mqtt.js keeps reconnecting by itself afterwards.
  client.once('connect', () => {
    stopActivityPublisher = startActivityPublisher({
      networkId: env.NETWORK_ID,
      publish: (topic, message) =>
        client.publish(topic, message, { qos: 1 }, (err) => {
          if (err) logger.error(`Publishing to ${topic} failed`, { err });
        }),
      logger,
    });
  });

  const shutdown = (signal: string): void => {
    logger.info(`${signal} received, shutting down`);
    stopActivityPublisher?.();
    client.end(false, {}, () => process.exit(0));
    setTimeout(() => process.exit(1), 5000).unref();
  };

  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('SIGINT', () => shutdown('SIGINT'));
};

process.on('unhandledRejection', (reason) => logger.error('Unhandled rejection', { reason }));
process.on('uncaughtException', (err) => {
  logger.error('Uncaught exception', { err });
  process.exit(1);
});

main();
