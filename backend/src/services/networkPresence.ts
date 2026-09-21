export type NetworkStatus = 'online' | 'offline';

export interface NetworkPresence {
  networkId: number;
  status: NetworkStatus;
  changedAt: string;
}

const presenceByNetworkId = new Map<number, NetworkPresence>();

// Returns the new presence when the status actually changed, and null when the message repeated what was already
// known. Retained messages are redelivered every time the subscriber resubscribes, so repeats are routine; without
// this check a reconnect would announce a change that never happened.
export const setNetworkStatus = (networkId: number, status: NetworkStatus): NetworkPresence | null => {
  if (presenceByNetworkId.get(networkId)?.status === status) return null;

  const presence: NetworkPresence = { networkId, status, changedAt: new Date().toISOString() };
  presenceByNetworkId.set(networkId, presence);
  return presence;
};

export const listNetworkPresence = (): NetworkPresence[] => [...presenceByNetworkId.values()];
