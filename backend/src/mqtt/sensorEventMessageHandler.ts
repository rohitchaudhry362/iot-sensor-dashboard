import { logger } from '../lib/logger';
import { recordSensorEvent, type Measurement, type SensorIngestOutcome } from '../services/ingestService';
import { sensorEventMessageSchema, type SensorPayload } from '../validation/mqttSchemas';
import { parseMessageBody } from './messageBody';
import type { SensorEventTopic } from './topics';

const DROP_REASONS: Record<Exclude<SensorIngestOutcome, 'stored' | 'duplicate'>, string> = {
  'unknown-sensor': 'sensor is not registered',
  'network-mismatch': 'sensor belongs to a different network than the topic',
  'unknown-action': 'action is not known',
  'unknown-metric': 'metric is not known',
  'unit-mismatch': 'unit does not match the metric',
};

// The validated payload is either empty or one measurement plus its unit; this reshapes it for the service.
const readMeasurement = (sensorPayload: SensorPayload): Measurement | null => {
  const { unit, ...measurements } = sensorPayload;
  const [firstMeasurement] = Object.entries(measurements);
  if (!firstMeasurement) return null;
  const [metricName, metricValue] = firstMeasurement;
  if (typeof unit !== 'string' || typeof metricValue !== 'number') return null;
  return { metricName, unit, value: metricValue };
};

// Turns one MQTT message from a sensor into a stored sensor event. Anything invalid or unknown is logged and dropped.
export const handleSensorEventMessage = async (
  topic: string,
  { networkId, sensorName }: SensorEventTopic,
  payload: Buffer,
): Promise<void> => {
  const message = parseMessageBody(topic, payload, sensorEventMessageSchema);
  if (!message) return;

  const { action: actionName, payload: sensorPayload, occurredAt } = message;
  const measurement = readMeasurement(sensorPayload);
  const outcome = await recordSensorEvent({ networkId, sensorName, actionName, measurement, occurredAt });

  // The unit is left out of the log line: it is free text from the device and only checked against the metric.
  const reading = measurement ? `, ${measurement.metricName} = ${measurement.value}` : '';
  const description = `${actionName} from ${sensorName} (network ${networkId}) at ${occurredAt.toISOString()}${reading}`;
  if (outcome === 'stored') logger.info(`Stored sensor event: ${description}`);
  else if (outcome === 'duplicate') logger.info(`Ignored duplicate sensor event: ${description}`);
  else logger.warn(`Dropped sensor event: ${DROP_REASONS[outcome]}: ${description}`);
};
