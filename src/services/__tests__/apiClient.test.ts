import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { apiClient } from '../apiClient';
import { mockApi } from '../../test/http';

describe('apiClient', () => {
  let location: { pathname: string; href: string };

  beforeEach(() => {
    location = { pathname: '/children', href: '' };
    vi.stubGlobal('location', location);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('sends cookies with every request and never an authorization header', async () => {
    const calls = mockApi('get', '/api/children', []);

    await apiClient.get('/api/children');

    expect(apiClient.defaults.withCredentials).toBe(true);
    expect(calls[0].authorization).toBeNull();
  });

  it('sends the user to the login page after a 401 from a protected endpoint', async () => {
    mockApi('get', '/api/children', { message: 'expired' }, 401);

    await expect(apiClient.get('/api/children')).rejects.toBeDefined();

    expect(location.href).toBe('/login');
  });

  it('does not redirect after a 401 from the login endpoint', async () => {
    mockApi('post', '/api/auth/login', { message: 'bad credentials' }, 401);

    await expect(apiClient.post('/api/auth/login', {})).rejects.toBeDefined();

    expect(location.href).toBe('');
  });

  it('does not redirect after a 401 from the session check', async () => {
    mockApi('get', '/api/auth/me', { message: 'no session' }, 401);

    await expect(apiClient.get('/api/auth/me')).rejects.toBeDefined();

    expect(location.href).toBe('');
  });

  it('does not redirect when a 401 arrives while already on the login page', async () => {
    location.pathname = '/login';
    mockApi('get', '/api/children', { message: 'expired' }, 401);

    await expect(apiClient.get('/api/children')).rejects.toBeDefined();

    expect(location.href).toBe('');
  });
});
