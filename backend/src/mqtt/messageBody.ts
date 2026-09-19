import type Joi from 'joi';
import { logger } from '../lib/logger';

// Reads the body of an MQTT message: JSON, checked against the schema. MQTT payloads come from devices, so they are
// untrusted input: an invalid message is logged and null is returned, never thrown, so one bad message cannot stop
// the subscriber.
export const parseMessageBody = <Body>(topic: string, payload: Buffer, schema: Joi.ObjectSchema<Body>): Body | null => {
  let parsedPayload: unknown;
  try {
    parsedPayload = JSON.parse(payload.toString('utf8'));
  } catch {
    logger.warn(`Dropped message on ${topic}: payload is not valid JSON`);
    return null;
  }

  const { value: body, error: validationError } = schema.validate(parsedPayload, { stripUnknown: true });
  if (validationError) {
    // Fields and rule types only: Joi's message text can echo the rejected value.
    logger.warn(`Dropped message on ${topic}: invalid payload`, {
      fields: validationError.details.map((detail) => detail.path.join('.')),
      rules: validationError.details.map((detail) => detail.type),
    });
    return null;
  }
  return body;
};
