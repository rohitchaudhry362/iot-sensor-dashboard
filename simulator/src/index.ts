import { env } from './config/env';
import { logger } from './lib/logger';
import { connectToBroker } from './mqtt/connection';
import { offlineWill, publishNetworkStatus } from './mqtt/presence';
import { startActivityPublisher } from './publishers/activityPublisher';
import { startSensorPublisher } from './publishers/sensorPublisher';

// A fixed id means a second simulator started by accident replaces the first instead of duplicating messages.
const CLIENT_ID = 'homepulse-simulator';

const main = (): void => {
  const client = connectToBroker(env.MQTT_URL, CLIENT_ID, offlineWill(env.NETWORK_ID), logger);
  let stopPublishers: (() => void) | undefined;

  // On every connection, not just the first: an ungraceful drop leaves the broker's retained message saying
  // offline, and only a fresh publish puts it back.
  client.on('connect', () => publishNetworkStatus(client, env.NETWORK_ID, 'online', logger));

  // Start publishing on the first connection only; mqtt.js keeps reconnecting by itself afterwards.
  client.once('connect', () => {
    const publisherOptions = {
      networkId: env.NETWORK_ID,
      publish: (topic: string, message: string): void => {
        client.publish(topic, message, { qos: 1 }, (err) => {
          if (err) logger.error(`Publishing to ${topic} failed`, { err });
        });
      },
      logger,
    };
    const stopActivityPublisher = startActivityPublisher(publisherOptions);
    const stopSensorPublisher = startSensorPublisher(publisherOptions);
    stopPublishers = () => {
      stopActivityPublisher();
      stopSensorPublisher();
    };
  });

  const shutdown = (signal: string): void => {
    logger.info(`${signal} received, shutting down`);
    stopPublishers?.();
    // A graceful disconnect tells the broker to discard the will, so saying goodbye is this process's own job.
    // Without this, stopping the simulator cleanly would leave it showing as online for ever.
    publishNetworkStatus(client, env.NETWORK_ID, 'offline', logger);
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
