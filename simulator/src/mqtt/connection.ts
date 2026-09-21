import mqtt, { type IClientOptions, type MqttClient } from 'mqtt';
import type { Logger } from '../lib/logger';

const KEEPALIVE_SECONDS = 10;

// mqtt.js reconnects on its own; these handlers only make the connection state visible in the logs.
export const connectToBroker = (
  brokerUrl: string,
  clientId: string,
  will: IClientOptions['will'],
  logger: Logger,
): MqttClient => {
  const client = mqtt.connect(brokerUrl, {
    clientId,
    will,   // message that will be sent by broker if this client disconnects ungracefully
    keepalive: KEEPALIVE_SECONDS,
    reconnectPeriod: 2000,
    connectTimeout: 10_000,
  });

  client.on('connect', () => logger.info(`Connected to broker ${brokerUrl} as ${clientId}`));
  client.on('reconnect', () => logger.warn('Reconnecting to broker'));
  client.on('offline', () => logger.warn('Broker unreachable, client is offline'));
  client.on('error', (err) => logger.error('Broker connection error', { err }));

  return client;
};
