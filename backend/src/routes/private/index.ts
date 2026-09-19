import { Router } from 'express'
import { requireAuth } from '../../middleware/requireAuth'
import { privateAuthRouter } from './auth'

// Everything mounted here requires a valid access token.
export const privateRouter = Router()

privateRouter.use(requireAuth)
privateRouter.use('/auth', privateAuthRouter)
