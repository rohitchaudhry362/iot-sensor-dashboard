import { prisma } from '../lib/prisma';

export interface SensorRecord {
  id: number;
  // The id used in the data files and MQTT topics (networks.network_id), not the table's primary key.
  networkId: number;
}

export interface MetricRecord {
  id: number;
  unit: string;
}

// Remembers every name that was found, so the database is asked once per name instead of once per message.
// A name that was not found is not remembered, so a row added later is picked up without a restart. Nothing is ever
// removed from the cache: that is safe while sensors, actions and metrics are only added, never renamed or deleted.
const cacheFoundItems = <Item>(
  load: (name: string) => Promise<Item | null>,
): ((name: string) => Promise<Item | null>) => {
  const itemsByName = new Map<string, Item>();
  return async (name) => {
    const cachedItem = itemsByName.get(name);
    if (cachedItem) return cachedItem;
    const loadedItem = await load(name);
    if (loadedItem) itemsByName.set(name, loadedItem);
    return loadedItem;
  };
};

export const findSensorByName = cacheFoundItems<SensorRecord>(async (name) => {
  const sensor = await prisma.sensor.findUnique({
    where: { name },
    select: { id: true, location: { select: { network: { select: { networkId: true } } } } },
  });
  return sensor && { id: sensor.id, networkId: sensor.location.network.networkId };
});

export const findActionByName = cacheFoundItems<{ id: number }>((name) =>
  prisma.action.findUnique({ where: { name }, select: { id: true } }),
);

export const findMetricByName = cacheFoundItems<MetricRecord>((name) =>
  prisma.metric.findUnique({ where: { name }, select: { id: true, unit: true } }),
);

const findNetworkByIdString = cacheFoundItems<{ id: number }>((networkId) =>
  prisma.network.findUnique({ where: { networkId: Number(networkId) }, select: { id: true } }),
);

export const findNetworkByNetworkId = (networkId: number): Promise<{ id: number } | null> =>
  findNetworkByIdString(String(networkId));
