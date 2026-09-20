import { prisma } from '../lib/prisma';

export interface SensorSummary {
  id: number;
  name: string;
  location: string;
  networkId: number;
}

export const listSensors = async (): Promise<SensorSummary[]> => {
  const sensors = await prisma.sensor.findMany({
    select: { id: true, name: true, location: { select: { name: true, network: { select: { networkId: true } } } } },
    orderBy: { id: 'asc' },
  });
  return sensors.map((sensor) => ({
    id: sensor.id,
    name: sensor.name,
    location: sensor.location.name,
    networkId: sensor.location.network.networkId,
  }));
};

export interface LatestReading {
  sensorId: number;
  sensorName: string;
  // Null for a device that only signals an event, such as the door; the row is then the last detection.
  metric: string | null;
  unit: string | null;
  value: number | null;
  occurredAt: Date;
}

export const findLatestReadings = async (): Promise<LatestReading[]> =>
  prisma.$queryRaw<LatestReading[]>`
    SELECT DISTINCT ON (events.sensor_id, events.metric_id)
      events.sensor_id   AS "sensorId",
      sensors.name       AS "sensorName",
      metrics.name       AS "metric",
      metrics.unit       AS "unit",
      events.value       AS "value",
      events.occurred_at AS "occurredAt"
    FROM sensor_events events
    JOIN sensors ON sensors.id = events.sensor_id
    LEFT JOIN metrics ON metrics.id = events.metric_id
    ORDER BY events.sensor_id, events.metric_id, events.occurred_at DESC
  `;
