import type { Logger } from '../lib/logger';
import { randomInRange } from '../lib/random';
import { msUntilNextSlot, SLOT_MS, slotStartOf } from '../schedule/quarterHour';
import { startRecurringTask } from '../schedule/recurring';

// Fires just after the boundary so the clock has certainly crossed it.
const FIRE_DELAY_MS = 100;

// Minutes of motion in one 15-minute bucket, as seen in the sample data (activity.json: minimum 0, maximum 14.83).
const MIN_ACTIVITY_MINUTES = 0;
const MAX_ACTIVITY_MINUTES = 14.83;

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

  return startRecurringTask({
    task: () => {
      const bucketStart = new Date(slotStartOf(Date.now()) - SLOT_MS).toISOString();
      const activity = randomInRange(MIN_ACTIVITY_MINUTES, MAX_ACTIVITY_MINUTES, 2);
      publish(topic, JSON.stringify({ time: bucketStart, activity }));
      logger.info(`Published activity bucket ${bucketStart} = ${activity} minutes of motion`);
    },
    nextDelayMs: () => msUntilNextSlot(Date.now()) + FIRE_DELAY_MS,
    runImmediately: true,
  });
};
