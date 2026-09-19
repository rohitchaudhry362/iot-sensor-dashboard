import type { Prisma } from '@prisma/client';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { env } from '../config/env';
import { logger } from '../lib/logger';
import { prisma } from '../lib/prisma';
import { parseActivity, parseSensorEvent, type ActivityRow, type SensorEventRow } from './seedParsers';

const BATCH_SIZE = 5000;
const TRANSACTION_OPTIONS = { maxWait: 10_000, timeout: 120_000 };

const readJsonArray = async (fileName: string, key: string): Promise<unknown[]> => {
  const content = await readFile(path.join(env.DATA_DIR, fileName), 'utf8');
  const parsed = JSON.parse(content) as Record<string, unknown>;
  const rows = parsed[key];
  if (!Array.isArray(rows)) {
    throw new Error(`${fileName}: expected an array under "${key}"`);
  }
  return rows;
};

const inBatches = async <T>(rows: T[], insert: (batch: T[]) => Promise<unknown>): Promise<void> => {
  for (let i = 0; i < rows.length; i += BATCH_SIZE) {
    await insert(rows.slice(i, i + BATCH_SIZE));
  }
};

const seedNetworks = async (tx: Prisma.TransactionClient, dataNetworkIds: number[]): Promise<Map<number, number>> => {
  const ids = [...new Set(dataNetworkIds)];
  await tx.network.createMany({ data: ids.map((networkId) => ({ networkId })), skipDuplicates: true });
  return new Map((await tx.network.findMany()).map((n) => [n.networkId, n.id]));
};

const uniqueBy = <T>(rows: T[], keyOf: (row: T) => string): Map<string, T> => {
  const map = new Map<string, T>();
  rows.forEach((row) => map.set(keyOf(row), row));
  return map;
};

const seedSensorEvents = async (
  tx: Prisma.TransactionClient,
  events: SensorEventRow[],
  networkIds: Map<number, number>,
): Promise<void> => {
  const locations = uniqueBy(events, (e) => `${e.networkId}|${e.locationName}`);
  await tx.location.createMany({
    data: [...locations.values()].map((e) => ({
      networkId: networkIds.get(e.networkId) as number,
      name: e.locationName,
    })),
    skipDuplicates: true,
  });
  const locationIdByKey = new Map((await tx.location.findMany()).map((l) => [`${l.networkId}|${l.name}`, l.id]));

  const sensors = uniqueBy(events, (e) => e.thingName);
  events.forEach((e) => {
    const sensor = sensors.get(e.thingName);
    if (sensor?.locationName !== e.locationName || sensor.networkId !== e.networkId) {
      throw new Error(`Sensor ${e.thingName} appears in more than one location`);
    }
  });
  await tx.sensor.createMany({
    data: [...sensors.values()].map((e) => ({
      name: e.thingName,
      locationId: locationIdByKey.get(`${networkIds.get(e.networkId)}|${e.locationName}`) as number,
    })),
    skipDuplicates: true,
  });
  const sensorIdByName = new Map((await tx.sensor.findMany()).map((s) => [s.name, s.id]));

  const metrics = new Map<string, string>();
  events.forEach((e) => {
    if (!e.reading) return;
    const knownUnit = metrics.get(e.reading.name);
    if (knownUnit !== undefined && knownUnit !== e.reading.unit) {
      throw new Error(`Metric ${e.reading.name} has conflicting units: ${knownUnit} vs ${e.reading.unit}`);
    }
    metrics.set(e.reading.name, e.reading.unit);
  });
  await tx.metric.createMany({
    data: [...metrics].map(([name, unit]) => ({ name, unit })),
    skipDuplicates: true,
  });
  const metricIdByName = new Map((await tx.metric.findMany()).map((m) => [m.name, m.id]));

  const actionNames = [...new Set(events.map((e) => e.action))];
  await tx.action.createMany({ data: actionNames.map((name) => ({ name })), skipDuplicates: true });
  const actionIdByName = new Map((await tx.action.findMany()).map((a) => [a.name, a.id]));

  await inBatches(events, (batch) =>
    tx.sensorEvent.createMany({
      data: batch.map((e) => ({
        sensorId: sensorIdByName.get(e.thingName) as number,
        actionId: actionIdByName.get(e.action) as number,
        metricId: e.reading ? (metricIdByName.get(e.reading.name) as number) : null,
        value: e.reading?.value ?? null,
        occurredAt: e.occurredAt,
      })),
      skipDuplicates: true,
    }),
  );
  logger.info(
    `Seeded ${events.length} sensor events across ${sensors.size} sensors, ${locations.size} locations, ${metrics.size} metrics, ${actionNames.length} actions`,
  );
};

const seedActivities = async (
  tx: Prisma.TransactionClient,
  buckets: ActivityRow[],
  networkIds: Map<number, number>,
): Promise<void> => {
  await inBatches(buckets, (batch) =>
    tx.activity.createMany({
      data: batch.map((b) => ({
        networkId: networkIds.get(b.networkId) as number,
        time: b.time,
        activity: b.activity,
      })),
      skipDuplicates: true,
    }),
  );
  logger.info(`Seeded ${buckets.length} activity rows`);
};

const main = async (): Promise<void> => {
  const [eventCount, activityCount] = await Promise.all([prisma.sensorEvent.count(), prisma.activity.count()]);

  const events = eventCount === 0 ? (await readJsonArray('sensors.json', 'sensors')).map(parseSensorEvent) : [];
  const buckets = activityCount === 0 ? (await readJsonArray('activity.json', 'activity')).map(parseActivity) : [];

  if (events.length === 0 && buckets.length === 0) {
    logger.info('Database already seeded, skipping');
    return;
  }

  // One transaction: a failed seed rolls back completely instead of leaving partial data behind.
  await prisma.$transaction(async (tx) => {
    const networkIds = await seedNetworks(tx, [...events.map((e) => e.networkId), ...buckets.map((b) => b.networkId)]);
    if (events.length > 0) await seedSensorEvents(tx, events, networkIds);
    if (buckets.length > 0) await seedActivities(tx, buckets, networkIds);
  }, TRANSACTION_OPTIONS);
};

main()
  .catch((err: unknown) => {
    logger.error('Seeding failed', { err });
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
