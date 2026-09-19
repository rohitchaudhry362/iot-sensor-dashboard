import { logger } from '../lib/logger';
import { recordActivity } from '../services/ingestService';
import { activityMessageSchema } from '../validation/mqttSchemas';
import { parseMessageBody } from './messageBody';

// Turns one MQTT message into a stored activity row. Anything invalid or unknown is logged and dropped.
export const handleActivityMessage = async (topic: string, networkId: number, payload: Buffer): Promise<void> => {
  const message = parseMessageBody(topic, payload, activityMessageSchema);
  if (!message) return;

  const { time, activity } = message;
  const outcome = await recordActivity({ networkId, time, activity });
  const description = `network ${networkId}, bucket ${time.toISOString()} = ${activity} minutes of motion`;
  if (outcome === 'stored') logger.info(`Stored activity: ${description}`);
  else if (outcome === 'duplicate') logger.info(`Ignored duplicate activity: ${description}`);
  else logger.warn(`Dropped activity for unknown network ${networkId}`);
};
