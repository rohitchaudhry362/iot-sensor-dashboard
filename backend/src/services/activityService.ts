import { prisma } from '../lib/prisma';
import type { ActivityRangeQuery } from '../validation/activitySchemas';

export interface ActivityBucket {
  networkId: number;
  time: Date;
  activity: number;
}

export const findActivityBuckets = async ({ from, to }: ActivityRangeQuery): Promise<ActivityBucket[]> => {
  const buckets = await prisma.activity.findMany({
    where: { time: { gte: from, lt: to } },
    select: { time: true, activity: true, network: { select: { networkId: true } } },
    orderBy: { time: 'asc' },
  });
  return buckets.map((bucket) => ({
    networkId: bucket.network.networkId,
    time: bucket.time,
    activity: bucket.activity,
  }));
};
