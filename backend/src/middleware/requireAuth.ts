import type { RequestHandler } from 'express'
import { unauthorized } from '../lib/errors'
import { verifyAccessToken } from '../lib/tokens'

const BEARER_PREFIX = 'Bearer '

export const requireAuth: RequestHandler = (req, _res, next) => {
  const header = req.get('authorization')
  const token = header?.startsWith(BEARER_PREFIX) ? header.slice(BEARER_PREFIX.length) : undefined
  const auth = token ? verifyAccessToken(token) : null

  if (!auth) {
    next(unauthorized())
    return
  }
  req.auth = auth
  next()
}
