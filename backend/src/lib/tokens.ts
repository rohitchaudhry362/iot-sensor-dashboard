import crypto from 'node:crypto';
import jwt from 'jsonwebtoken';
import { env } from '../config/env';

export interface AccessTokenClaims {
  userUuid: string;
  expiresAt: number;
}

export const signAccessToken = (userUuid: string): string =>
  jwt.sign({ userUuid }, env.JWT_SECRET, { expiresIn: env.JWT_ACCESS_TTL_SECONDS, algorithm: 'HS256' });

export const verifyAccessToken = (token: string): AccessTokenClaims | null => {
  try {
    const payload = jwt.verify(token, env.JWT_SECRET, { algorithms: ['HS256'] });
    if (typeof payload === 'string' || typeof payload.userUuid !== 'string' || typeof payload.exp !== 'number') {
      return null;
    }
    return { userUuid: payload.userUuid, expiresAt: payload.exp };
  } catch {
    return null;
  }
};

// Refresh tokens are opaque random strings, not JWTs: they are looked up (and revoked) in the database.
export const generateRefreshToken = (): string => crypto.randomBytes(32).toString('base64url');

export const hashRefreshToken = (token: string): string => crypto.createHash('sha256').update(token).digest('hex');
