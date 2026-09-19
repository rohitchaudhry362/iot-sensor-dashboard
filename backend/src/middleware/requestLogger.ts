import type { NextFunction, Request, Response } from 'express'
import { logger } from '../lib/logger'

export const requestLogger = (req: Request, res: Response, next: NextFunction): void => {
  const start = Date.now()
  res.on('finish', () => {
    logger.http(`${req.method} ${req.originalUrl} ${res.statusCode}`, { durationMs: Date.now() - start })
  })
  next()
}
