import type { Logger } from '../lib/logger';
import { msUntilNextSlot, SLOT_MS, slotStartOf } from '../schedule/quarterHour';

// Fires just after the boundary so the clock has certainly crossed it.
const FIRE_DELAY_MS = 100;

// Minutes of motion in one 15-minute bucket, as seen in the sample data (activity.json: minimum 0, maximum 14.83).
const MIN_ACTIVITY_MINUTES = 0;
const MAX_ACTIVITY_MINUTES = 14.83;

// A random value in that range, rounded to two decimals like the sample data.
const randomActivityMinutes = (): number =>
  Math.round((MIN_ACTIVITY_MINUTES + Math.random() * (MAX_ACTIVITY_MINUTES - MIN_ACTIVITY_MINUTES)) * 100) / 100;

export interface ActivityPublisherOptions {
  networkId: number;
  publish: (topic: string, message: string) => void;
  logger: Logger;
}

// The network reports how many minutes had motion in each 15-minute bucket. A bucket is only known once it
// has ended, so at every real quarter-hour this publishes the bucket that just finished, stamped with its start
// time. The value is random within the range of the sample data. One bucket is also published immediately, so a
// subscriber does not wait up to 15 minutes for the first message.
export const startActivityPublisher = ({ networkId, publish, logger }: ActivityPublisherOptions): (() => void) => {
  const topic = `network/${networkId}/activity`;
  let nextPublishTimer: NodeJS.Timeout | undefined;

  const publishFinishedBucket = (): void => {
    const bucketStart = new Date(slotStartOf(Date.now()) - SLOT_MS).toISOString();
    const activity = randomActivityMinutes();
    publish(topic, JSON.stringify({ time: bucketStart, activity }));
    logger.info(`Published activity bucket ${bucketStart} = ${activity} minutes of motion`);
  };

  const scheduleNextPublish = (): void => {
    nextPublishTimer = setTimeout(
      () => {
        publishFinishedBucket();
        scheduleNextPublish();
      },
      msUntilNextSlot(Date.now()) + FIRE_DELAY_MS,
    );
  };

  publishFinishedBucket();
  scheduleNextPublish();

  return () => clearTimeout(nextPublishTimer);
};
