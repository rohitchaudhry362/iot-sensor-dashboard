import mqtt, { type MqttClient } from 'mqtt';
import type { Logger } from '../lib/logger';

// mqtt.js reconnects on its own; these handlers only make the connection state visible in the logs.
export const connectToBroker = (brokerUrl: string, clientId: string, logger: Logger): MqttClient => {
  const client = mqtt.connect(brokerUrl, { clientId, reconnectPeriod: 2000, connectTimeout: 10_000 });

  client.on('connect', () => logger.info(`Connected to broker ${brokerUrl} as ${clientId}`));
  client.on('reconnect', () => logger.warn('Reconnecting to broker'));
  client.on('offline', () => logger.warn('Broker unreachable, client is offline'));
  client.on('error', (err) => logger.error('Broker connection error', { err }));

  return client;
};
