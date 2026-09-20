export interface User {
  userUuid: string;
  email: string;
  firstName: string;
  lastName: string;
  createdAt: string;
}

export interface AuthResponse {
  accessToken: string;
  user: User;
}

export interface SensorMetric {
  name: string;
  unit: string;
}

export interface Sensor {
  id: number;
  name: string;
  location: string;
  networkId: number;
  metrics: SensorMetric[];
}

export interface LatestReading {
  sensorId: number;
  sensorName: string;
  metricName: string | null;
  unit: string | null;
  value: number | null;
  occurredAt: string;
}

export interface SensorReading {
  metricName: string;
  unit: string;
  value: number;
  occurredAt: string;
}

export interface SensorReadingsResponse {
  from: string;
  to: string;
  readings: SensorReading[];
}

export interface ActivityBucket {
  networkId: number;
  time: string;
  activity: number;
}

export interface SensorsResponse {
  sensors: Sensor[];
}

export interface LatestReadingsResponse {
  readings: LatestReading[];
}

export interface ActivityResponse {
  from: string;
  to: string;
  buckets: ActivityBucket[];
}
