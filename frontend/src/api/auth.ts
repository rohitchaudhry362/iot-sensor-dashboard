import { apiRequest, setAccessToken } from './client';
import type { AuthResponse, User } from './types';

export interface LoginInput {
  email: string;
  password: string;
}

export interface RegisterInput extends LoginInput {
  firstName: string;
  lastName: string;
}

export interface ProfileInput {
  firstName: string;
  lastName: string;
  email: string;
}

const startSession = (result: AuthResponse): AuthResponse => {
  setAccessToken(result.accessToken);
  return result;
};

export const login = async (input: LoginInput): Promise<AuthResponse> =>
  startSession(await apiRequest<AuthResponse>('/api/auth/login', { method: 'POST', body: input, auth: false }));

export const register = async (input: RegisterInput): Promise<AuthResponse> =>
  startSession(await apiRequest<AuthResponse>('/api/auth/register', { method: 'POST', body: input, auth: false }));

export const updateProfile = async (input: ProfileInput): Promise<User> =>
  (await apiRequest<{ user: User }>('/api/auth/me', { method: 'PUT', body: input })).user;

export const logout = async (): Promise<void> => {
  try {
    await apiRequest<void>('/api/auth/logout', { method: 'POST', auth: false });
  } finally {
    setAccessToken(null);
  }
};
