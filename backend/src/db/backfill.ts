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

// A stretch with no rows in it, between two that exist. `until` is exclusive: the row at that instant is
// already there.
interface Hole {
  fromMs: number;
  untilMs: number;
}

// Every quarter hour strictly inside the hole.
const quarterHoursIn = ({ fromMs, untilMs }: Hole): number[] => {
  const times: number[] = [];
  for (let time = fromMs + QUARTER_HOUR_MS; time < untilMs; time += QUARTER_HOUR_MS) times.push(time);
  return times;
};

const backfillActivity = async (tx: Prisma.TransactionClient, now: Date): Promise<number> => {
  const [range] = await tx.$queryRaw<ValueRange[]>`
    SELECT min(activity) AS "min", max(activity) AS "max", max(scale(activity::numeric))::int AS "decimals"
    FROM activities`;
  if (range.min === null) return 0;

  // Holes in the middle of the series, not only the one at the end. A run of the simulator can push the
  // newest row past an earlier outage, and looking only at the newest row would then report nothing to do
  // while a month sat missing in between.
  const holes = await tx.$queryRaw<{ networkId: number; fromMs: Date; untilMs: Date }[]>`
    SELECT network_id AS "networkId", "time" AS "fromMs", next_time AS "untilMs"
    FROM (
      SELECT network_id, "time", lead("time") OVER (PARTITION BY network_id ORDER BY "time") AS next_time
      FROM activities
    ) windowed
    WHERE next_time - "time" > interval '15 minutes'`;

  // The bucket covering this moment has not finished yet, so the newest one worth writing is the one before it.
  const lastCompleteBucket = Math.floor(now.getTime() / QUARTER_HOUR_MS) * QUARTER_HOUR_MS - QUARTER_HOUR_MS;
  const newestPerNetwork = await tx.$queryRaw<{ networkId: number; newest: Date }[]>`
    SELECT network_id AS "networkId", max("time") AS "newest" FROM activities GROUP BY network_id`;

  const buckets: Prisma.ActivityCreateManyInput[] = [];
  const add = (networkId: number, times: number[]): void => {
    times.forEach((time) => buckets.push({ networkId, time: new Date(time), activity: randomInRange(range) }));
  };
  holes.forEach(({ networkId, fromMs, untilMs }) =>
    add(networkId, quarterHoursIn({ fromMs: fromMs.getTime(), untilMs: untilMs.getTime() })),
  );
  newestPerNetwork.forEach(({ networkId, newest }) =>
    // +1 so the end of the series is treated like any other hole: fill strictly between newest and the edge.
    add(networkId, quarterHoursIn({ fromMs: newest.getTime(), untilMs: lastCompleteBucket + 1 })),
  );

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

  // Holes inside each measuring series, found the same way as for activity. The threshold is two missed
  // readings rather than one, so ordinary jitter in the sample data is not mistaken for an outage.
  // Detection-only series are left out on purpose: a door that did not move leaves a gap by definition, and
  // filling it would be inventing events to paper over silence that was real.
  const holes = await tx.$queryRaw<{ sensorId: number; metricId: number; fromMs: Date; untilMs: Date }[]>`
    SELECT sensor_id AS "sensorId", metric_id AS "metricId", occurred_at AS "fromMs", next_at AS "untilMs"
    FROM (
      SELECT sensor_id, metric_id, occurred_at,
             lead(occurred_at) OVER (PARTITION BY sensor_id, metric_id ORDER BY occurred_at) AS next_at
      FROM sensor_events
      WHERE metric_id IS NOT NULL
    ) windowed
    WHERE next_at - occurred_at > interval '30 minutes'`;

  const events: Prisma.SensorEventCreateManyInput[] = [];
  const actionForSeries = new Map(series.map((one) => [`${one.sensorId}|${String(one.metricId)}`, one.actionId]));

  holes.forEach(({ sensorId, metricId, fromMs, untilMs }) => {
    const range = rangeByMetric.get(metricId);
    const actionId = actionForSeries.get(`${sensorId}|${String(metricId)}`);
    if (!range || actionId === undefined) return;
    quarterHoursIn({ fromMs: fromMs.getTime(), untilMs: untilMs.getTime() }).forEach((time) => {
      events.push({ sensorId, actionId, metricId, value: randomInRange(range), occurredAt: new Date(time) });
    });
  });

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
