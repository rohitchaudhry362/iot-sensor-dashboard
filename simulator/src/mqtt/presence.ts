import type { IClientOptions, MqttClient } from 'mqtt';
import type { Logger } from '../lib/logger';

export type NetworkStatus = 'online' | 'offline';

// Presence is published for the network rather than per sensor, because MQTT allows one will per connection and
// this process holds a single connection for every device it plays. A real deployment gives each device its own
// connection and therefore its own will, on its own sensor topic.
export const networkStatusTopic = (networkId: number): string => `network/${networkId}/status`;

const statusMessage = (status: NetworkStatus): string => JSON.stringify({ status });

// Retained, so a backend that subscribes later is told the current state at once instead of waiting for the next
// change. QoS 1 because a dropped presence message leaves the dashboard showing the opposite of the truth.
const RETAINED_AT_LEAST_ONCE = { qos: 1, retain: true } as const;

type LastWill = NonNullable<IClientOptions['will']>;

// Handed to the broker at connect time and published by it if this client disappears without saying goodbye.
export const offlineWill = (networkId: number): LastWill => ({
  topic: networkStatusTopic(networkId),
  payload: statusMessage('offline'),
  ...RETAINED_AT_LEAST_ONCE,
});

export const publishNetworkStatus = (
  client: MqttClient,
  networkId: number,
  status: NetworkStatus,
  logger: Logger,
): void => {
  const topic = networkStatusTopic(networkId);
  client.publish(topic, statusMessage(status), { ...RETAINED_AT_LEAST_ONCE }, (err) => {
    if (err) logger.error(`Publishing ${status} to ${topic} failed`, { err });
    else logger.info(`Published ${status} to ${topic}`);
  });
};
