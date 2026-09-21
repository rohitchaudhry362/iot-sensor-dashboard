import Joi from 'joi';

export interface ActivityMessage {
  time: Date;
  activity: number;
}

// Body of a message on network/<networkId>/activity: the start of a 15-minute bucket and its minutes of motion.
export const activityMessageSchema = Joi.object<ActivityMessage>({
  time: Joi.date().iso().required().example('2026-09-19T22:45:00.000Z'),
  // Minutes of motion in a 15-minute bucket: at most 15. The database has the same rule as a CHECK constraint.
  activity: Joi.number().min(0).max(15).required().example(5.14),
}).example({ time: '2026-09-19T22:45:00.000Z', activity: 5.14 });

export interface NetworkStatusMessage {
  status: 'online' | 'offline';
}

export const networkStatusMessageSchema = Joi.object<NetworkStatusMessage>({
  status: Joi.string().valid('online', 'offline').required().example('online'),
}).example({ status: 'online' });

// Action and metric names are letters, digits and underscores only (at most 50), so they are safe to put in a log line.
const NAME_PATTERN = /^\w{1,50}$/;

const eventOnlyPayloadSchema = Joi.object().length(0);

// A device that measures something sends exactly one measurement and its unit: two keys, one of them "unit".
const measurementPayloadSchema = Joi.object({ unit: Joi.string().max(10).required() })
  .pattern(NAME_PATTERN, Joi.number())
  .length(2);

export type SensorPayload = Record<string, string | number>;

export interface SensorEventMessage {
  action: string;
  payload: SensorPayload;
  occurredAt: Date;
}

// Body of a message on network/<networkId>/sensors/<sensorName>/event. Whether the action, metric and unit are known
// is checked against the database when the event is stored, not here.
export const sensorEventMessageSchema = Joi.object<SensorEventMessage>({
  action: Joi.string().pattern(NAME_PATTERN).required().example('SensorValueChanged'),
  payload: Joi.alternatives()
    .try(eventOnlyPayloadSchema, measurementPayloadSchema)
    .required()
    .example({ unit: 'C', temperature: 24.4 }),
  occurredAt: Joi.date().iso().required().example('2026-09-19T22:45:00.000Z'),
}).example({
  action: 'SensorValueChanged',
  payload: { unit: 'C', temperature: 24.4 },
  occurredAt: '2026-09-19T22:45:00.000Z',
});
