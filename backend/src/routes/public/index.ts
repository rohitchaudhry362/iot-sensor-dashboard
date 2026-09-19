import { Router } from 'express'
import { publicAuthRouter } from './auth'
import { healthRouter } from './health'

export const publicRouter = Router()

publicRouter.use(healthRouter)
publicRouter.use('/auth', publicAuthRouter)
