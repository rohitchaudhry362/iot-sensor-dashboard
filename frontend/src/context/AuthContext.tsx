import { useQueryClient } from '@tanstack/react-query';
import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { onSessionExpired, refreshSession } from '../api/client';
import type { User } from '../api/types';
import { logout as logoutRequest } from '../api/auth';

type AuthState =
  | { status: 'loading'; user: null }
  | { status: 'authenticated'; user: User }
  | { status: 'unauthenticated'; user: null };

export interface AuthContextValue {
  state: AuthState;
  startSession: (user: User) => void;
  logout: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextValue | null>(null);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [authState, setAuthState] = useState<AuthState>({ status: 'loading', user: null });
  const queryClient = useQueryClient();

  const endSession = useCallback(() => {
    queryClient.clear();
    setAuthState({ status: 'unauthenticated', user: null });
  }, [queryClient]);

  // Restore the session after a page load using the httpOnly refresh cookie.
  useEffect(() => {
    let active = true;
    refreshSession()
      .then(({ user }) => active && setAuthState({ status: 'authenticated', user }))
      .catch(() => active && setAuthState({ status: 'unauthenticated', user: null }));
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    onSessionExpired(endSession);
    return () => onSessionExpired(null);
  }, [endSession]);

  const value = useMemo<AuthContextValue>(
    () => ({
      state: authState,
      startSession: (user) => setAuthState({ status: 'authenticated', user }),
      logout: async () => {
        try {
          await logoutRequest();
        } finally {
          endSession();
        }
      },
    }),
    [authState, endSession],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextValue => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used inside <AuthProvider>');
  return context;
};
