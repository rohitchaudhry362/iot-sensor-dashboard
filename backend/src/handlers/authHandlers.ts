import type { Response } from 'express'
import { asyncHandler } from '../lib/asyncHandler'
import { unauthorized } from '../lib/errors'
import { clearRefreshCookie, readRefreshCookie, setRefreshCookie } from '../lib/refreshCookie'
import {
  endSession,
  getUser,
  loginUser,
  registerUser,
  rotateSession,
  type AuthResult,
} from '../services/authService'
import type { LoginInput, RegisterInput } from '../validation/authSchemas'

const sendAuthResult = (res: Response, status: number, { user, session }: AuthResult): void => {
  setRefreshCookie(res, session.refreshToken, session.refreshTokenExpiresAt)
  res.status(status).json({ accessToken: session.accessToken, user })
}

export const register = asyncHandler(async (req, res) => {
  sendAuthResult(res, 201, await registerUser(req.body as RegisterInput))
})

export const login = asyncHandler(async (req, res) => {
  sendAuthResult(res, 200, await loginUser(req.body as LoginInput))
})

export const refresh = asyncHandler(async (req, res) => {
  const token = readRefreshCookie(req)
  if (!token) throw unauthorized()
  try {
    sendAuthResult(res, 200, await rotateSession(token))
  } catch (err) {
    clearRefreshCookie(res)
    throw err
  }
})

export const logout = asyncHandler(async (req, res) => {
  const token = readRefreshCookie(req)
  if (token) await endSession(token)
  clearRefreshCookie(res)
  res.status(204).end()
})

export const getCurrentUser = asyncHandler(async (req, res) => {
  res.json({ user: await getUser(req.auth!.userUuid) })
})
