import { networkError, toApiError } from './errors';
import type { AuthResponse } from './types';

type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

interface RequestOptions {
  method?: HttpMethod;
  body?: unknown;
  // Public endpoints (login, register) must not trigger a token refresh on 401.
  auth?: boolean;
}

let accessToken: string | null = null;
let sessionExpiredListener: (() => void) | null = null;

export const setAccessToken = (token: string | null): void => {
  accessToken = token;
};

export const onSessionExpired = (listener: (() => void) | null): void => {
  sessionExpiredListener = listener;
};

const send = async (path: string, method: HttpMethod, body: unknown, token: string | null): Promise<Response> => {
  try {
    return await fetch(path, {
      method,
      credentials: 'same-origin',
      headers: {
        Accept: 'application/json',
        ...(body !== undefined && { 'Content-Type': 'application/json' }),
        ...(token && { Authorization: `Bearer ${token}` }),
      },
      body: body === undefined ? undefined : JSON.stringify(body),
    });
  } catch {
    throw networkError();
  }
};

// Asks the server for a new access token using the refresh cookie, and remembers it.
export const refreshSession = async (): Promise<AuthResponse> => {
  const result = await apiRequest<AuthResponse>('/api/auth/refresh', { method: 'POST', auth: false });
  setAccessToken(result.accessToken);
  return result;
};

export const apiRequest = async <T>(
  path: string,
  { method = 'GET', body, auth = true }: RequestOptions = {},
): Promise<T> => {
  let res = await send(path, method, body, auth ? accessToken : null);

  if (res.status === 401 && auth) {
    try {
      await refreshSession();
    } catch (err) {
      setAccessToken(null);
      sessionExpiredListener?.();
      throw err;
    }
    res = await send(path, method, body, accessToken);
  }

  if (res.status === 204) return undefined as T;
  const responseBody: unknown = await res.json().catch(() => null);
  if (!res.ok) throw toApiError(res.status, responseBody);
  return responseBody as T;
};
