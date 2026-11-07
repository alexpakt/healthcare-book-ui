import { useEffect, useState, useCallback, useRef } from 'react';
import type { ErrorResponse, ApiQueryOptions } from '../types/common';

interface UseApiState<T> {
  data: T | null;
  loading: boolean;
  error: ErrorResponse | null;
}

function toErrorResponse(err: any): ErrorResponse {
  return {
    message: err.response?.data?.message || err.message || 'An error occurred',
    status: err.response?.status || 500,
    timestamp: new Date().toISOString(),
  };
}

/**
 * Fetches data on mount and again whenever a value in `dependencies` changes.
 * `refetch` forces a new fetch.
 */
export function useApi<T>(
  fetchFn: () => Promise<T>,
  dependencies: React.DependencyList = [],
  { skip = false }: ApiQueryOptions = {}
): UseApiState<T> & { refetch: () => void } {
  const [state, setState] = useState<UseApiState<T>>({ data: null, loading: true, error: null });
  const [reloadCount, setReloadCount] = useState(0);

  useEffect(() => {
    if (skip) return;

    // Set on cleanup so a response from an outdated request is ignored
    let cancelled = false;
    // oxlint-disable-next-line react/set-state-in-effect -- the effect starts the fetch, so loading must be set here
    setState((prev) => ({ ...prev, loading: true, error: null }));
    fetchFn()
      .then((data) => {
        if (!cancelled) setState({ data, loading: false, error: null });
      })
      .catch((err) => {
        if (cancelled) return;
        const error = toErrorResponse(err);
        console.error('API Error:', error);
        setState({ data: null, loading: false, error });
      });

    return () => {
      cancelled = true;
    };
    // fetchFn is a new function every render, so the caller's dependencies decide when to refetch
    // oxlint-disable-next-line react-hooks/exhaustive-deps
  }, [skip, reloadCount, ...dependencies]);

  const refetch = () => setReloadCount((count) => count + 1);

  return { ...state, refetch };
}

/**
 * Hook for mutations (POST, PUT, PATCH, DELETE)
 */
interface UseMutationOptions {
  onSuccess?: (data: any) => void;
  onError?: (error: ErrorResponse) => void;
}

interface UseMutationState<T, V> extends UseApiState<T> {
  mutate: (data?: V) => Promise<T>;
  reset: () => void;
}

export function useMutation<T, V = any>(
  mutationFn: (data?: V) => Promise<T>,
  options: UseMutationOptions = {}
): UseMutationState<T, V> {
  const [state, setState] = useState<UseApiState<T>>({
    data: null,
    loading: false,
    error: null,
  });

  const optionsRef = useRef(options);

  useEffect(() => {
    optionsRef.current = options;
  }, [options]);

  const mutate = useCallback(
    async (data?: V): Promise<T> => {
      try {
        setState((prev) => ({ ...prev, loading: true, error: null }));
        const result = await mutationFn(data);
        setState({ data: result, loading: false, error: null });
        optionsRef.current.onSuccess?.(result);
        return result;
      } catch (err: any) {
        const error = toErrorResponse(err);
        setState({ data: null, loading: false, error });
        optionsRef.current.onError?.(error);
        throw error;
      }
    },
    [mutationFn]
  );

  const reset = useCallback(() => {
    setState({ data: null, loading: false, error: null });
  }, []);

  return {
    ...state,
    mutate,
    reset,
  };
}
