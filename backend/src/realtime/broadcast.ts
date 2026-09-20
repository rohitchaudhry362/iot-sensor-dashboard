import type { ActivityUpdateEvent, SensorDetectedEvent, SensorUpdateEvent } from './events';
import { getSocketServer } from './socketServer';

// Called after a message has been stored, never before: the browser is told about rows that exist.
// Each one is a no-op while the socket server is not running, so the ingest path does not depend on it.

export const broadcastSensorUpdate = (event: SensorUpdateEvent): void => {
  getSocketServer()?.emit('sensor:update', event);
};

export const broadcastSensorDetected = (event: SensorDetectedEvent): void => {
  getSocketServer()?.emit('sensor:detected', event);
};

export const broadcastActivityUpdate = (event: ActivityUpdateEvent): void => {
  getSocketServer()?.emit('activity:update', event);
};
