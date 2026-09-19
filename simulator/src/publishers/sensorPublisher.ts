import type { Logger } from '../lib/logger';
import { randomInRange } from '../lib/random';
import { startRecurringTask } from '../schedule/recurring';

const MINUTE_MS = 60 * 1000;

// The two devices in the sample data (sensors.json).
const BATHROOM_SENSOR_NAME = 'SENSOR_7C3E822F6E550000'; // temperature and humidity
const DOOR_SENSOR_NAME = 'SENSOR_282C02BFFFEEE739'; // front door vibration

const VALUE_CHANGED_ACTION = 'SensorValueChanged';
const DETECTED_ACTION = 'SensorDetected';

// Ranges seen in the sample data
const MIN_TEMPERATURE_CELSIUS = 18.8;
const MAX_TEMPERATURE_CELSIUS = 28.7;
const MIN_HUMIDITY_PERCENT = 21;
const MAX_HUMIDITY_PERCENT = 89;

// In the sample data the bathroom sensor reports each reading about every 15 minutes (median gap 15.0).
const BATHROOM_REPORT_INTERVAL_MS = 15 * MINUTE_MS;

// Door events are irregular in the sample data (about 13 a day, in bursts). Here they come after a random gap of
// 1 to 30 minutes, which is much more often than in the data so that a demo shows them.
const MIN_DOOR_EVENT_DELAY_MS = 1 * MINUTE_MS;
const MAX_DOOR_EVENT_DELAY_MS = 30 * MINUTE_MS;

export interface SensorPublisherOptions {
  networkId: number;
  publish: (topic: string, message: string) => void;
  logger: Logger;
}

// Plays the two devices. The bathroom sensor reports a temperature and a humidity reading (two messages) at
// startup and then every 15 minutes; the door sensor reports a detection after each random gap. Values are random
// within the range of the sample data; the timestamp is the moment of publishing. Returns a function that stops both.
export const startSensorPublisher = ({ networkId, publish, logger }: SensorPublisherOptions): (() => void) => {
  const publishSensorEvent = (sensorName: string, action: string, payload: Record<string, unknown>): void => {
    const occurredAt = new Date().toISOString();
    publish(`network/${networkId}/sensors/${sensorName}/event`, JSON.stringify({ action, payload, occurredAt }));
    logger.info(`Published ${action} from ${sensorName}: ${JSON.stringify(payload)}`);
  };

  const stopBathroomSensor = startRecurringTask({
    task: () => {
      const temperature = randomInRange(MIN_TEMPERATURE_CELSIUS, MAX_TEMPERATURE_CELSIUS, 1);
      publishSensorEvent(BATHROOM_SENSOR_NAME, VALUE_CHANGED_ACTION, { unit: 'C', temperature });
      const humidity = randomInRange(MIN_HUMIDITY_PERCENT, MAX_HUMIDITY_PERCENT, 0);
      publishSensorEvent(BATHROOM_SENSOR_NAME, VALUE_CHANGED_ACTION, { unit: '%', humidity });
    },
    nextDelayMs: () => BATHROOM_REPORT_INTERVAL_MS,
    runImmediately: true,
  });

  const stopDoorSensor = startRecurringTask({
    task: () => publishSensorEvent(DOOR_SENSOR_NAME, DETECTED_ACTION, {}),
    nextDelayMs: () => randomInRange(MIN_DOOR_EVENT_DELAY_MS, MAX_DOOR_EVENT_DELAY_MS, 0),
    runImmediately: false,
  });

  return () => {
    stopBathroomSensor();
    stopDoorSensor();
  };
};
