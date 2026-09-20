import type { Prisma } from '@prisma/client';
import { logger } from '../lib/logger';

const MINUTE_MS = 60 * 1000;
const QUARTER_HOUR_MS = 15 * MINUTE_MS;
const BATCH_SIZE = 5000;

// A device that only signals events fires irregularly; this is the spread the simulator uses.
const MIN_DETECTION_GAP_MS = 1 * MINUTE_MS;
const MAX_DETECTION_GAP_MS = 30 * MINUTE_MS;

// Every range below is read back from the rows that were just seeded, so there are no constants here to keep
// in step with the data files or with the simulator's own copies of them.
interface ValueRange {
  min: number;
  max: number;
  decimals: number;
}

const randomInRange = ({ min, max, decimals }: ValueRange): number =>
  Number((min + Math.random() * (max - min)).toFixed(decimals));

const randomDetectionGapMs = (): number =>
  Math.round(MIN_DETECTION_GAP_MS + Math.random() * (MAX_DETECTION_GAP_MS - MIN_DETECTION_GAP_MS));

const insertInBatches = async <Row>(rows: Row[], insert: (batch: Row[]) => Promise<unknown>): Promise<void> => {
  for (let start = 0; start < rows.length; start += BATCH_SIZE) {
    await insert(rows.slice(start, start + BATCH_SIZE));
  }
};

const backfillActivity = async (tx: Prisma.TransactionClient, now: Date): Promise<number> => {
  const newest = await tx.activity.findFirst({ orderBy: { time: 'desc' }, select: { time: true, networkId: true } });
  if (!newest) return 0;

  const [range] = await tx.$queryRaw<ValueRange[]>`
    SELECT min(activity) AS "min", max(activity) AS "max", max(scale(activity::numeric))::int AS "decimals"
    FROM activities`;

  // The bucket covering this moment has not finished yet, so the newest one worth writing is the one before it.
  const lastCompleteBucket = Math.floor(now.getTime() / QUARTER_HOUR_MS) * QUARTER_HOUR_MS - QUARTER_HOUR_MS;

  const buckets: Prisma.ActivityCreateManyInput[] = [];
  for (let time = newest.time.getTime() + QUARTER_HOUR_MS; time <= lastCompleteBucket; time += QUARTER_HOUR_MS) {
    buckets.push({ networkId: newest.networkId, time: new Date(time), activity: randomInRange(range) });
  }

  await insertInBatches(buckets, (batch) => tx.activity.createMany({ data: batch, skipDuplicates: true }));
  return buckets.length;
};

interface SensorSeries {
  sensorId: number;
  actionId: number;
  // Null for a device that only signals events; that series carries no value.
  metricId: number | null;
  lastOccurredAt: Date;
}

const backfillSensorEvents = async (tx: Prisma.TransactionClient, now: Date): Promise<number> => {
  // One row per sensor per metric: where each series left off, and which action it reports.
  const series = await tx.$queryRaw<SensorSeries[]>`
    SELECT DISTINCT ON (sensor_id, metric_id)
      sensor_id  AS "sensorId",
      action_id  AS "actionId",
      metric_id  AS "metricId",
      occurred_at AS "lastOccurredAt"
    FROM sensor_events
    ORDER BY sensor_id, metric_id, occurred_at DESC
  `;
  if (series.length === 0) return 0;

  const ranges = await tx.$queryRaw<(ValueRange & { metricId: number })[]>`
    SELECT metric_id AS "metricId", min(value) AS "min", max(value) AS "max",
           max(scale(value::numeric))::int AS "decimals"
    FROM sensor_events
    WHERE metric_id IS NOT NULL
    GROUP BY metric_id
  `;
  const rangeByMetric = new Map(ranges.map((range) => [range.metricId, range]));

  const events: Prisma.SensorEventCreateManyInput[] = [];
  series.forEach(({ sensorId, actionId, metricId, lastOccurredAt }) => {
    if (metricId === null) {
      let time = lastOccurredAt.getTime() + randomDetectionGapMs();
      while (time <= now.getTime()) {
        events.push({ sensorId, actionId, metricId: null, value: null, occurredAt: new Date(time) });
        time += randomDetectionGapMs();
      }
      return;
    }

    const range = rangeByMetric.get(metricId);
    if (!range) return;
    // Continuing from the last timestamp keeps this series' offset within the quarter hour, so a reading lands
    // where the next one was due rather than snapping to a boundary the device never used.
    for (let time = lastOccurredAt.getTime() + QUARTER_HOUR_MS; time <= now.getTime(); time += QUARTER_HOUR_MS) {
      events.push({ sensorId, actionId, metricId, value: randomInRange(range), occurredAt: new Date(time) });
    }
  });

  await insertInBatches(events, (batch) => tx.sensorEvent.createMany({ data: batch, skipDuplicates: true }));
  return events.length;
};

// The sample files stop months before the app is ever run, which would leave a dashboard with nothing recent
// to show until the simulator had been publishing for a while. This fills the gap between the newest seeded
// row and now, so a fresh clone has continuous history immediately.
//
// The values are uniform random inside the range each series already covers. That is a deliberate
// simplification, and it is visible: the backfilled stretch has no day/night rhythm, so a chart spanning the
// join shows a step where the real history ends.
//
// Writes are idempotent (`skipDuplicates` on the unique keys), so running the seed again only tops up.
export const backfillToNow = async (tx: Prisma.TransactionClient, now: Date): Promise<void> => {
  const buckets = await backfillActivity(tx, now);
  const events = await backfillSensorEvents(tx, now);

  if (buckets === 0 && events === 0) {
    logger.info('History is already up to date, nothing to backfill');
    return;
  }
  logger.info(`Backfilled ${buckets} activity buckets and ${events} sensor events up to ${now.toISOString()}`);
};
