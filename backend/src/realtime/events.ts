// Timestamps are ISO strings because JSON has no date type; the browser turns them back into dates.
// Every event carries its network id so it is self-describing, even though the room already scopes it.

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

// A type alias rather than an interface: Socket.io requires an index signature here, which TypeScript infers for
// object literal types but not for interfaces. Naming the events makes a typo in an emit a compile error.
export type ServerToClientEvents = {
  'sensor:update': (event: SensorUpdateEvent) => void;
  'sensor:detected': (event: SensorDetectedEvent) => void;
  'activity:update': (event: ActivityUpdateEvent) => void;
};
