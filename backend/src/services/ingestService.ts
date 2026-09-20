import { prisma } from '../lib/prisma';
import { findActionByName, findMetricByName, findSensorByName } from './sensorLookups';

export interface ActivityReading {
  networkId: number;
  time: Date;
  activity: number;
}

export type IngestOutcome = 'stored' | 'duplicate' | 'unknown-network';

// networkId is the id used in the data files and MQTT topics (networks.network_id), not the table's primary key.
export const recordActivity = async ({ networkId, time, activity }: ActivityReading): Promise<IngestOutcome> => {
  const network = await prisma.network.findUnique({ where: { networkId }, select: { id: true } });
  if (!network) return 'unknown-network';

  // skipDuplicates turns a repeated or redelivered message into a no-op, thanks to the unique (network_id, time) index.
  const { count: storedRows } = await prisma.activity.createMany({
    data: [{ networkId: network.id, time, activity }],
    skipDuplicates: true,
  });
  return storedRows === 1 ? 'stored' : 'duplicate';
};

// One measurement from a device, for example temperature 24.4 in unit "C".
export interface Measurement {
  metricName: string;
  unit: string;
  value: number;
}

export interface SensorEventInput {
  networkId: number;
  sensorName: string;
  actionName: string;
  // Null for a device that only signals an event, such as a door.
  measurement: Measurement | null;
  occurredAt: Date;
}

export type SensorIngestOutcome =
  | 'stored'
  | 'duplicate'
  | 'unknown-sensor'
  | 'network-mismatch'
  | 'unknown-action'
  | 'unknown-metric'
  | 'unit-mismatch';

// Sensors, actions and metrics are reference data: a message can only refer to rows that already exist (created by
// the seed), it can never create them. networkId comes from the topic and must be the network the sensor belongs to.
export const recordSensorEvent = async ({
  networkId,
  sensorName,
  actionName,
  measurement,
  occurredAt,
}: SensorEventInput): Promise<SensorIngestOutcome> => {
  const sensor = await findSensorByName(sensorName);
  if (!sensor) return 'unknown-sensor';
  if (sensor.networkId !== networkId) return 'network-mismatch';

  const action = await findActionByName(actionName);
  if (!action) return 'unknown-action';

  const metric = measurement ? await findMetricByName(measurement.metricName) : null;
  if (measurement) {
    if (!metric) return 'unknown-metric';
    if (metric.unit !== measurement.unit) return 'unit-mismatch';
  }

  // skipDuplicates turns a repeated or redelivered message into a no-op, thanks to the unique
  // (sensor_id, metric_id, occurred_at) index.
  const { count: storedRows } = await prisma.sensorEvent.createMany({
    data: [
      {
        sensorId: sensor.id,
        actionId: action.id,
        metricId: metric?.id ?? null,
        value: measurement?.value ?? null,
        occurredAt,
      },
    ],
    skipDuplicates: true,
  });
  return storedRows === 1 ? 'stored' : 'duplicate';
};
