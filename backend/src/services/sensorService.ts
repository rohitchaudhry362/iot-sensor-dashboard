import { prisma } from '../lib/prisma';

export interface SensorMetric {
  name: string;
  unit: string;
}

export interface SensorSummary {
  id: number;
  name: string;
  location: string;
  networkId: number;
  metrics: SensorMetric[];
}

const metricsBySensor = async (): Promise<Map<number, SensorMetric[]>> => {
  const rows = await prisma.$queryRaw<{ sensorId: number; name: string; unit: string }[]>`
    SELECT DISTINCT events.sensor_id AS "sensorId", metrics.name AS "name", metrics.unit AS "unit"
    FROM sensor_events events
    JOIN metrics ON metrics.id = events.metric_id
    ORDER BY events.sensor_id, metrics.name
  `;

  const bySensor = new Map<number, SensorMetric[]>();
  rows.forEach(({ sensorId, name, unit }) => {
    bySensor.set(sensorId, [...(bySensor.get(sensorId) ?? []), { name, unit }]);
  });
  return bySensor;
};

export const listSensors = async (): Promise<SensorSummary[]> => {
  const [sensors, metrics] = await Promise.all([
    prisma.sensor.findMany({
      select: { id: true, name: true, location: { select: { name: true, network: { select: { networkId: true } } } } },
      orderBy: { id: 'asc' },
    }),
    metricsBySensor(),
  ]);

  return sensors.map((sensor) => ({
    id: sensor.id,
    name: sensor.name,
    location: sensor.location.name,
    networkId: sensor.location.network.networkId,
    metrics: metrics.get(sensor.id) ?? [],
  }));
};

export interface LatestReading {
  sensorId: number;
  sensorName: string;
  // Null for a device that only signals an event, such as the door; the row is then the last detection.
  metricName: string | null;
  unit: string | null;
  value: number | null;
  occurredAt: Date;
}

export interface SensorReading {
  metricName: string;
  unit: string;
  value: number;
  occurredAt: Date;
}

export interface ReadingHistoryQuery {
  sensorId: number;
  from: Date;
  to: Date;
  metricName?: string;
}

export const findSensorReadings = async ({
  sensorId,
  from,
  to,
  metricName,
}: ReadingHistoryQuery): Promise<SensorReading[]> => {
  const rows = await prisma.sensorEvent.findMany({
    where: {
      sensorId,
      occurredAt: { gte: from, lt: to },
      metricId: { not: null },
      ...(metricName && { metric: { name: metricName } }),
    },
    select: { value: true, occurredAt: true, metric: { select: { name: true, unit: true } } },
    orderBy: { occurredAt: 'asc' },
  });

  return rows.flatMap((row) =>
    row.metric && row.value !== null
      ? [{ metricName: row.metric.name, unit: row.metric.unit, value: row.value, occurredAt: row.occurredAt }]
      : [],
  );
};

export const sensorExists = async (sensorId: number): Promise<boolean> =>
  (await prisma.sensor.count({ where: { id: sensorId } })) > 0;

export const findLatestReadings = async (): Promise<LatestReading[]> =>
  prisma.$queryRaw<LatestReading[]>`
    SELECT DISTINCT ON (events.sensor_id, events.metric_id)
      events.sensor_id   AS "sensorId",
      sensors.name       AS "sensorName",
      metrics.name       AS "metricName",
      metrics.unit       AS "unit",
      events.value       AS "value",
      events.occurred_at AS "occurredAt"
    FROM sensor_events events
    JOIN sensors ON sensors.id = events.sensor_id
    LEFT JOIN metrics ON metrics.id = events.metric_id
    ORDER BY events.sensor_id, events.metric_id, events.occurred_at DESC
  `;
