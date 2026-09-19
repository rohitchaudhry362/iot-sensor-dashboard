import type { RequestHandler } from 'express';
import type { ObjectSchema } from 'joi';
import { badRequest } from '../lib/errors';
import { logger } from '../lib/logger';

// Replaces req.body with the validated value, so handlers only ever see trimmed, normalized, known fields.
export const validateBody =
  (schema: ObjectSchema): RequestHandler =>
  (req, _res, next) => {
    const { value, error } = schema.validate(req.body ?? {}, { stripUnknown: true });
    if (error) {
      logger.debug('Request validation failed', {
        path: req.path,
        fields: error.details.map((d) => d.path.join('.')),
        rules: error.details.map((d) => d.type),
      });
      next(badRequest('Invalid request'));
      return;
    }
    req.body = value;
    next();
  };
