import type { AccessTokenClaims } from '../lib/tokens'

declare global {
  namespace Express {
    interface Request {
      auth?: AccessTokenClaims
    }
  }
}

export {}
