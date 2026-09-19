import { QueryClient } from '@tanstack/react-query';
import { isApiError } from '../api/errors';

const isRetryable = (error: unknown): boolean => !isApiError(error) || error.status === 0 || error.status >= 500;

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: (failureCount, error) => failureCount < 3 && isRetryable(error),
      refetchOnWindowFocus: false,
    },
    mutations: { retry: false },
  },
});
