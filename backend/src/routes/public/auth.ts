import { Router } from 'express'
import { login, logout, refresh, register } from '../../handlers/authHandlers'
import { validateBody } from '../../middleware/validate'
import { loginSchema, registerSchema } from '../../validation/authSchemas'

export const publicAuthRouter = Router()

publicAuthRouter.post('/register', validateBody(registerSchema), register)
publicAuthRouter.post('/login', validateBody(loginSchema), login)
publicAuthRouter.post('/refresh', refresh)
publicAuthRouter.post('/logout', logout)
