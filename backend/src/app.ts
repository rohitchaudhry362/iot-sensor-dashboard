import cors from 'cors'
import express, { type Express } from 'express'
import helmet from 'helmet'
import { env } from './config/env'
import { errorHandler, notFoundHandler } from './middleware/errorHandler'
import { requestLogger } from './middleware/requestLogger'
import { healthRouter } from './routes/public/health'

export const createApp = (): Express => {
  const app = express()

  app.disable('x-powered-by')
  app.use(helmet())
  app.use(cors({ origin: env.CORS_ORIGIN }))
  app.use(express.json({ limit: '100kb' }))
  app.use(requestLogger)

  // health check.
  app.use('/api', healthRouter)

  app.use(notFoundHandler)
  app.use(errorHandler)

  return app
}
