import { useEffect, useState, useCallback, useRef } from 'react';
import type { ErrorResponse, ApiQueryOptions } from '../types/common';

interface UseApiState<T> {
  data: T | null;
  loading: boolean;
  error: ErrorResponse | null;
}

interface UseApiOptions extends ApiQueryOptions {
  onSuccess?: (data: any) => void;
  onError?: (error: ErrorResponse) => void;
}

/**
 * Generic hook for fetching data from API
 * Handles loading, error states, and refetching
 */
export function useApi<T>(
  fetchFn: () => Promise<T>,
  _dependencies?: React.DependencyList,
  options: UseApiOptions = {}
): UseApiState<T> & { refetch: () => Promise<void> } {
  const [state, setState] = useState<UseApiState<T>>({
    data: null,
    loading: true,
    error: null,
  });

  // Use ref to store options so they don't affect dependencies
  const optionsRef = useRef(options);

  useEffect(() => {
    optionsRef.current = options;
  }, [options]);

  const fetchData = useCallback(async () => {
    try {
      setState((prev) => ({ ...prev, loading: true, error: null }));
      const data = await fetchFn();
      setState({ data, loading: false, error: null });
      optionsRef.current.onSuccess?.(data);
    } catch (err: any) {
      const error: ErrorResponse = {
        message: err.response?.data?.message || err.message || 'An error occurred',
        status: err.response?.status || 500,
        timestamp: new Date().toISOString(),
      };
      setState({ data: null, loading: false, error });
      optionsRef.current.onError?.(error);
      console.error('API Error:', error);
    }
  }, [fetchFn]);

  const skip = options.skip;

  useEffect(() => {
    if (optionsRef.current.skip) return;

    let isMounted = true;

    fetchData().then(() => {
      if (!isMounted) return;
    });

    return () => {
      isMounted = false;
    };
  }, [fetchData, skip]);

  const refetch = useCallback(async () => {
    await fetchData();
  }, [fetchData]);

  return {
    ...state,
    refetch,
  };
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
        const error: ErrorResponse = {
          message: err.response?.data?.message || err.message || 'An error occurred',
          status: err.response?.status || 500,
          timestamp: new Date().toISOString(),
        };
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
