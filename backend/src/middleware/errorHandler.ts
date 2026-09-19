import type { NextFunction, Request, Response } from 'express';
import { isAppError, notFound } from '../lib/errors';
import { logger } from '../lib/logger';

export const notFoundHandler = (_req: Request, _res: Response, next: NextFunction): void => {
  next(notFound('Route not found'));
};

// Errors raised by express.json() carry a `type` such as 'entity.parse.failed'.
const bodyParserError = (err: unknown): { status: number; code: string; message: string } | null => {
  const type = (err as { type?: unknown } | null)?.type;
  if (type === 'entity.parse.failed')
    return { status: 400, code: 'INVALID_JSON', message: 'Request body is not valid JSON' };
  if (type === 'entity.too.large')
    return { status: 413, code: 'PAYLOAD_TOO_LARGE', message: 'Request body is too large' };
  return null;
};

export const errorHandler = (err: unknown, req: Request, res: Response, _next: NextFunction): void => {
  if (isAppError(err)) {
    res.status(err.statusCode).json({ error: { code: err.code, message: err.message } });
    return;
  }

  const parseError = bodyParserError(err);
  if (parseError) {
    res.status(parseError.status).json({ error: { code: parseError.code, message: parseError.message } });
    return;
  }

  logger.error('Unhandled error', { err, method: req.method, path: req.path });
  res.status(500).json({ error: { code: 'INTERNAL_ERROR', message: 'Something went wrong' } });
};
