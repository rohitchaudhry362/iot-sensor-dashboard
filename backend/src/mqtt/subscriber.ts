import mqtt from 'mqtt';
import { env } from '../config/env';
import { logger } from '../lib/logger';
import { handleActivityMessage } from './activityMessageHandler';
import { ACTIVITY_TOPIC_FILTER } from './topics';

export interface MqttSubscriber {
  stop: () => Promise<void>;
}

// clean: false asks the broker to keep this client's session, so messages published while the backend is down are
// queued and delivered when it reconnects. The stored rows are idempotent, so a redelivered message does no harm.
export const startMqttSubscriber = (): MqttSubscriber => {
  const client = mqtt.connect(env.MQTT_URL, {
    clientId: env.MQTT_CLIENT_ID,
    clean: false,
    reconnectPeriod: 2000,
    connectTimeout: 10_000,
    resubscribe: false,
  });

  client.on('connect', (connectionAcknowledgement) => {
    logger.info(`Connected to MQTT broker ${env.MQTT_URL} as ${env.MQTT_CLIENT_ID}`, {
      sessionPresent: connectionAcknowledgement.sessionPresent,
    });
    client.subscribe(ACTIVITY_TOPIC_FILTER, { qos: 1 }, (err) => {
      if (err) logger.error(`Subscribing to ${ACTIVITY_TOPIC_FILTER} failed`, { err });
      else logger.info(`Subscribed to ${ACTIVITY_TOPIC_FILTER}`);
    });
  });
  client.on('reconnect', () => logger.warn('Reconnecting to MQTT broker'));
  client.on('offline', () => logger.warn('MQTT broker unreachable, client is offline'));
  client.on('error', (err) => logger.error('MQTT connection error', { err }));

  client.on('message', (topic, payload) => {
    handleActivityMessage(topic, payload).catch((err: unknown) =>
      logger.error(`Failed to process message on ${topic}`, { err }),
    );
  });

  return {
    stop: () => new Promise<void>((resolve) => client.end(false, {}, () => resolve())),
  };
};
