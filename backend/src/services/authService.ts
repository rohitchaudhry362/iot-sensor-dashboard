import type { Prisma } from '@prisma/client'
import { env } from '../config/env'
import { conflict, unauthorized } from '../lib/errors'
import { logger } from '../lib/logger'
import { hashPassword, verifyPassword } from '../lib/password'
import { prisma } from '../lib/prisma'
import { generateRefreshToken, hashRefreshToken, signAccessToken } from '../lib/tokens'
import type { LoginInput, RegisterInput } from '../validation/authSchemas'

const DAY_MS = 24 * 60 * 60 * 1000

const publicUserSelect = {
  userUuid: true,
  email: true,
  firstName: true,
  lastName: true,
  createdAt: true,
} satisfies Prisma.UserSelect

export type PublicUser = Prisma.UserGetPayload<{ select: typeof publicUserSelect }>

export interface Session {
  accessToken: string
  refreshToken: string
  refreshTokenExpiresAt: Date
}

export interface AuthResult {
  user: PublicUser
  session: Session
}

const createSession = async (db: Prisma.TransactionClient, userUuid: string, now: Date): Promise<Session> => {
  const refreshToken = generateRefreshToken()
  const refreshTokenExpiresAt = new Date(now.getTime() + env.REFRESH_TOKEN_TTL_DAYS * DAY_MS)

  // Housekeeping: expired tokens are useless, so drop this user's old ones whenever a new one is issued.
  await db.refreshToken.deleteMany({ where: { userUuid, expiresAt: { lte: now } } })
  await db.refreshToken.create({
    data: { userUuid, tokenHash: hashRefreshToken(refreshToken), expiresAt: refreshTokenExpiresAt },
  })

  return {
    accessToken: signAccessToken(userUuid),
    refreshToken,
    refreshTokenExpiresAt,
  }
}

export const registerUser = async (input: RegisterInput): Promise<AuthResult> => {
  const existing = await prisma.user.findUnique({ where: { email: input.email }, select: { userUuid: true } })
  if (existing) throw conflict('EMAIL_TAKEN', 'An account with this email already exists')

  const user = await prisma.user.create({
    data: {
      email: input.email,
      firstName: input.firstName,
      lastName: input.lastName,
      passwordHash: await hashPassword(input.password),
    },
    select: publicUserSelect,
  })
  logger.info('User registered', { userUuid: user.userUuid })
  return { user, session: await createSession(prisma, user.userUuid, new Date()) }
}

const invalidCredentials = () => {
  logger.info('Failed login attempt')
  return unauthorized('Incorrect email or password')
}

export const loginUser = async (input: LoginInput): Promise<AuthResult> => {
  const user = await prisma.user.findUnique({
    where: { email: input.email },
    select: { ...publicUserSelect, passwordHash: true },
  })
  if (!user) throw invalidCredentials()
  if (!(await verifyPassword(input.password, user.passwordHash))) throw invalidCredentials()

  const { passwordHash: _passwordHash, ...userDetails } = user;
  logger.info('User logged in', { userUuid: user.userUuid })
  return { user: userDetails, session: await createSession(prisma, user.userUuid, new Date()) }
}

const sessionExpired = () => unauthorized('Your session has expired, please sign in again')

export const rotateSession = async (rawRefreshToken: string): Promise<AuthResult> => {
  const now = new Date()
  const stored = await prisma.refreshToken.findUnique({
    where: { tokenHash: hashRefreshToken(rawRefreshToken) },
    include: { user: { select: publicUserSelect } },
  })
  if (!stored || stored.expiresAt <= now) throw sessionExpired()

  if (stored.revokedAt) {
    await prisma.refreshToken.deleteMany({ where: { userUuid: stored.userUuid } })
    logger.warn('Refresh token reuse detected, all sessions revoked')
    throw sessionExpired()
  }

  await prisma.refreshToken.update({ where: { id: stored.id }, data: { revokedAt: now } })
  return { user: stored.user, session: await createSession(prisma, stored.userUuid, now) }
}

export const endSession = async (rawRefreshToken: string): Promise<void> => {
  await prisma.refreshToken.deleteMany({ where: { tokenHash: hashRefreshToken(rawRefreshToken) } })
}

export const getUser = async (userUuid: string): Promise<PublicUser> => {
  const user = await prisma.user.findUnique({ where: { userUuid }, select: publicUserSelect })
  if (!user) throw unauthorized()
  return user
}
