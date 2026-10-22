import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { renderHook, waitFor, act } from '@testing-library/react';
import { useApi, useMutation } from '../useApi';

describe('useApi', () => {
  beforeEach(() => {
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('starts in the loading state and then exposes the data', async () => {
    const fetchFn = vi.fn(async () => ['a', 'b']);
    const { result } = renderHook(() => useApi(fetchFn));

    expect(result.current.loading).toBe(true);
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.data).toEqual(['a', 'b']);
    expect(result.current.error).toBeNull();
  });

  it('exposes the server message and status when the fetch fails', async () => {
    const fetchFn = vi.fn(async () => {
      throw Object.assign(new Error('network'), {
        response: { status: 403, data: { message: 'Δεν επιτρέπεται' } },
      });
    });
    const { result } = renderHook(() => useApi(fetchFn));

    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.data).toBeNull();
    expect(result.current.error).toMatchObject({ message: 'Δεν επιτρέπεται', status: 403 });
  });

  it('falls back to the error message and status 500 when the server gives no detail', async () => {
    const fetchFn = vi.fn(async () => {
      throw new Error('boom');
    });
    const { result } = renderHook(() => useApi(fetchFn));

    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.error).toMatchObject({ message: 'boom', status: 500 });
  });

  it('does not fetch when skip is set', async () => {
    const fetchFn = vi.fn(async () => 1);
    renderHook(() => useApi(fetchFn, [], { skip: true }));
    await new Promise((r) => setTimeout(r, 10));
    expect(fetchFn).not.toHaveBeenCalled();
  });

  it('refetch loads the data again', async () => {
    let value = 1;
    const fetchFn = vi.fn(async () => value);
    const { result } = renderHook(() => useApi(fetchFn));
    await waitFor(() => expect(result.current.data).toBe(1));

    value = 2;
    await act(async () => {
      await result.current.refetch();
    });

    expect(result.current.data).toBe(2);
    expect(fetchFn).toHaveBeenCalledTimes(2);
  });

  it('calls onSuccess with the data', async () => {
    // The fetch function is defined outside the hook, as the app's hooks do with useCallback.
    const onSuccess = vi.fn();
    const fetchStable = async () => 'ok';
    renderHook(() => useApi(fetchStable, [], { onSuccess }));
    await waitFor(() => expect(onSuccess).toHaveBeenCalledWith('ok'));
  });
});

describe('useMutation', () => {
  beforeEach(() => {
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('runs the mutation only when mutate is called and stores the result', async () => {
    const mutationFn = vi.fn(async (value?: number) => (value ?? 0) * 2);
    const { result } = renderHook(() => useMutation(mutationFn));

    expect(mutationFn).not.toHaveBeenCalled();
    let returned: number | undefined;
    await act(async () => {
      returned = await result.current.mutate(21);
    });

    expect(returned).toBe(42);
    expect(result.current.data).toBe(42);
    expect(result.current.loading).toBe(false);
  });

  it('rethrows the error and stores it when the mutation fails', async () => {
    const mutationFn = vi.fn(async () => {
      throw Object.assign(new Error('x'), { response: { status: 409, data: { message: 'Υπάρχει ήδη' } } });
    });
    const { result } = renderHook(() => useMutation(mutationFn));

    await act(async () => {
      await expect(result.current.mutate()).rejects.toMatchObject({ message: 'Υπάρχει ήδη', status: 409 });
    });

    expect(result.current.error).toMatchObject({ status: 409 });
  });

  it('reset clears the stored result and error', async () => {
    const { result } = renderHook(() => useMutation(async () => 'done'));
    await act(async () => {
      await result.current.mutate();
    });
    act(() => result.current.reset());
    expect(result.current.data).toBeNull();
  });
});
