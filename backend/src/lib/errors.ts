export interface AppError extends Error {
  statusCode: number
  code: string
  isAppError: true
}

export const createAppError = (statusCode: number, code: string, message: string): AppError =>
  Object.assign(new Error(message), { statusCode, code, isAppError: true as const })

export const isAppError = (err: unknown): err is AppError =>
  err instanceof Error && (err as Partial<AppError>).isAppError === true

export const notFound = (message = 'Resource not found'): AppError => createAppError(404, 'NOT_FOUND', message)
export const badRequest = (message: string): AppError => createAppError(400, 'BAD_REQUEST', message)
export const unauthorized = (message = 'Authentication required'): AppError =>
  createAppError(401, 'UNAUTHORIZED', message)
