import { logger } from '../lib/logger';
import { recordActivity } from '../services/ingestService';
import { activityMessageSchema } from '../validation/mqttSchemas';
import { parseActivityTopic } from './topics';

// Turns one MQTT message into a stored activity row. MQTT payloads come from devices, so they are untrusted input:
// anything that is not valid is logged and dropped, never thrown, so one bad message cannot stop the subscriber.
export const handleActivityMessage = async (topic: string, payload: Buffer): Promise<void> => {
  const networkId = parseActivityTopic(topic);
  if (networkId === null) {
    logger.warn(`Ignored message on unexpected topic ${topic}`);
    return;
  }

  let parsedPayload: unknown;
  try {
    parsedPayload = JSON.parse(payload.toString('utf8'));
  } catch {
    logger.warn(`Dropped message on ${topic}: payload is not valid JSON`);
    return;
  }

  const { value: activityMessage, error: validationError } = activityMessageSchema.validate(parsedPayload, {
    stripUnknown: true,
  });
  if (validationError) {
    // Fields and rule types only: Joi's message text can echo the rejected value.
    logger.warn(`Dropped message on ${topic}: invalid activity payload`, {
      fields: validationError.details.map((detail) => detail.path.join('.')),
      rules: validationError.details.map((detail) => detail.type),
    });
    return;
  }

  const { time, activity } = activityMessage;
  const outcome = await recordActivity({ networkId, time, activity });
  const description = `network ${networkId}, bucket ${time.toISOString()} = ${activity} minutes of motion`;
  if (outcome === 'stored') logger.info(`Stored activity: ${description}`);
  else if (outcome === 'duplicate') logger.info(`Ignored duplicate activity: ${description}`);
  else logger.warn(`Dropped activity for unknown network ${networkId}`);
};
