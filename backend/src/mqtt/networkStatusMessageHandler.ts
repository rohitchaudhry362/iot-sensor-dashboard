import { logger } from '../lib/logger';
import { broadcastNetworkStatus } from '../realtime/broadcast';
import { setNetworkStatus } from '../services/networkPresence';
import { findNetworkByNetworkId } from '../services/sensorLookups';
import { networkStatusMessageSchema } from '../validation/mqttSchemas';
import { parseMessageBody } from './messageBody';

export const handleNetworkStatusMessage = async (topic: string, networkId: number, payload: Buffer): Promise<void> => {
  const message = parseMessageBody(topic, payload, networkStatusMessageSchema);
  if (!message) return;

  const network = await findNetworkByNetworkId(networkId);
  if (!network) {
    logger.warn(`Dropped status for unknown network ${networkId}`);
    return;
  }

  // Silent when nothing changed: the status topic is retained, so its last message is redelivered on every
  // resubscribe, and treating that as news would announce a change that never happened.
  const presence = setNetworkStatus(networkId, message.status);
  if (!presence) return;

  // send status to browsers through socket.io
  broadcastNetworkStatus(presence);
  logger.info(`Network ${networkId} is ${presence.status}`);
};
