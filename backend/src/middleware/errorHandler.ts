import type { NextFunction, Request, Response } from 'express'
import { isAppError, notFound } from '../lib/errors'
import { logger } from '../lib/logger'

export const notFoundHandler = (_req: Request, _res: Response, next: NextFunction): void => {
  next(notFound('Route not found'))
}

export const errorHandler = (err: unknown, req: Request, res: Response, _next: NextFunction): void => {
  if (isAppError(err)) {
    res.status(err.statusCode).json({ error: { code: err.code, message: err.message } })
    return
  }

  logger.error('Unhandled error', { err, method: req.method, path: req.path })
  res.status(500).json({ error: { code: 'INTERNAL_ERROR', message: 'Something went wrong' } })
}
