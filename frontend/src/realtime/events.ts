// These mirror the payloads the backend emits (backend/src/realtime/events.ts). They are declared again here
// rather than shared, for the same reason the Joi schemas are: sharing types across the two packages would
// mean monorepo plumbing for a handful of interfaces.

export interface SensorUpdateEvent {
  networkId: number;
  sensorName: string;
  metricName: string;
  unit: string;
  value: number;
  occurredAt: string;
}

export interface SensorDetectedEvent {
  networkId: number;
  sensorName: string;
  occurredAt: string;
}

export interface ActivityUpdateEvent {
  networkId: number;
  time: string;
  activity: number;
}

export type NetworkStatus = 'online' | 'offline';

export interface NetworkStatusEvent {
  networkId: number;
  status: NetworkStatus;
  changedAt: string;
}
