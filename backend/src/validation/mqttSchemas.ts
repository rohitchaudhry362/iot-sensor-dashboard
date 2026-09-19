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
