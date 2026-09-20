import { logger } from '../lib/logger';
import { handleActivityMessage } from './activityMessageHandler';
import { handleSensorEventMessage } from './sensorEventMessageHandler';
import { parseActivityTopic, parseSensorEventTopic } from './topics';

// Sends a message to the handler for its topic. The topic is parsed here once, so the handlers get typed ids.
export const routeMessage = async (topic: string, payload: Buffer): Promise<void> => {
  const activityNetworkId = parseActivityTopic(topic);
  if (activityNetworkId !== null) return handleActivityMessage(topic, activityNetworkId, payload);

  const sensorEventTopic = parseSensorEventTopic(topic);
  if (sensorEventTopic) return handleSensorEventMessage(topic, sensorEventTopic, payload);

  logger.warn(`Ignored message on unexpected topic ${topic}`);
};
