import type { Request, RequestHandler } from 'express';
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

// The same for query parameters, which arrive as strings: Joi converts them to dates and numbers and fills in
// defaults, so handlers read typed values through their own input interface rather than parsing them again.
export const validateQuery =
  (schema: ObjectSchema): RequestHandler =>
  (req, _res, next) => {
    const { value, error } = schema.validate(req.query, { stripUnknown: true });
    if (error) {
      logger.debug('Query validation failed', {
        path: req.path,
        fields: error.details.map((d) => d.path.join('.')),
        rules: error.details.map((d) => d.type),
      });
      next(badRequest('Invalid request'));
      return;
    }
    // Converted values no longer match Express's string-only query type, hence the cast.
    req.query = value as Request['query'];
    next();
  };

export const validateParams =
  (schema: ObjectSchema): RequestHandler =>
  (req, _res, next) => {
    const { value, error } = schema.validate(req.params, { stripUnknown: true });
    if (error) {
      logger.debug('Path parameter validation failed', {
        path: req.path,
        fields: error.details.map((d) => d.path.join('.')),
        rules: error.details.map((d) => d.type),
      });
      next(badRequest('Invalid request'));
      return;
    }
    req.params = value as Request['params'];
    next();
  };
