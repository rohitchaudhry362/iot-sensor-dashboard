export interface ApiError extends Error {
  status: number;
  code: string;
  isApiError: true;
}

export const UNKNOWN_ERROR_MESSAGE = 'Something went wrong, please try again.';

export const createApiError = (status: number, code: string, message: string): ApiError =>
  Object.assign(new Error(message), { status, code, isApiError: true as const });

export const isApiError = (err: unknown): err is ApiError =>
  err instanceof Error && (err as Partial<ApiError>).isApiError === true;

export const networkError = (): ApiError =>
  createApiError(0, 'NETWORK_ERROR', 'Could not reach the server. Check your connection and try again.');

// Parses the backend's `{ error: { code, message } }` shape, falling back to a generic error.
export const toApiError = (status: number, body: unknown): ApiError => {
  const error = (body as { error?: { code?: unknown; message?: unknown } } | null)?.error;
  if (error && typeof error.code === 'string' && typeof error.message === 'string') {
    return createApiError(status, error.code, error.message);
  }
  return createApiError(status, 'UNKNOWN_ERROR', UNKNOWN_ERROR_MESSAGE);
};
