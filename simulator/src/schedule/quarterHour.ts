// Activity is aggregated into 15-minute buckets that start on :00, :15, :30 and :45 (UTC).
export const SLOT_MS = 15 * 60 * 1000;

export const slotStartOf = (timestampMs: number): number => timestampMs - (timestampMs % SLOT_MS);

export const msUntilNextSlot = (timestampMs: number): number => SLOT_MS - (timestampMs % SLOT_MS);
