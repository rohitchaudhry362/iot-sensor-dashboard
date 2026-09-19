import { prisma } from '../lib/prisma';

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
