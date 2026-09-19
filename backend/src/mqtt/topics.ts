// Activity messages arrive on network/<networkId>/activity, where <networkId> is the id used in the data files.
export const ACTIVITY_TOPIC_FILTER = 'network/+/activity';

// At most 9 digits, so the id always fits a 32-bit integer column.
const ACTIVITY_TOPIC_PATTERN = /^network\/(\d{1,9})\/activity$/;

// The network id in an activity topic, or null when the topic is not an activity topic.
export const parseActivityTopic = (topic: string): number | null => {
  const match = ACTIVITY_TOPIC_PATTERN.exec(topic);
  return match ? Number(match[1]) : null;
};
