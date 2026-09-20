// Activity messages arrive on network/<networkId>/activity, where <networkId> is the id used in the data files.
export const ACTIVITY_TOPIC_FILTER = 'network/+/activity';

// At most 9 digits, so the id always fits a 32-bit integer column.
const ACTIVITY_TOPIC_PATTERN = /^network\/(\d{1,9})\/activity$/;

// The network id in an activity topic, or null when the topic is not an activity topic.
export const parseActivityTopic = (topic: string): number | null => {
  const match = ACTIVITY_TOPIC_PATTERN.exec(topic);
  return match ? Number(match[1]) : null;
};

// Sensor events arrive on network/<networkId>/sensors/<sensorName>/event.
export const SENSOR_EVENT_TOPIC_FILTER = 'network/+/sensors/+/event';

// Sensor names are at most 64 characters (sensors.name); only letters, digits, underscores and hyphens are accepted,
// so a name from a topic is safe to log and to look up.
const SENSOR_EVENT_TOPIC_PATTERN = /^network\/(\d{1,9})\/sensors\/([\w-]{1,64})\/event$/;

export interface SensorEventTopic {
  networkId: number;
  sensorName: string;
}

// The network id and sensor name in a sensor event topic, or null when the topic is not a sensor event topic.
export const parseSensorEventTopic = (topic: string): SensorEventTopic | null => {
  const match = SENSOR_EVENT_TOPIC_PATTERN.exec(topic);
  return match ? { networkId: Number(match[1]), sensorName: match[2] } : null;
};
