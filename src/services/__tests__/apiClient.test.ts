import { describe, expect, it } from 'vitest';
import { apiClient } from '../apiClient';
import { mockApi } from '../../test/http';

describe('apiClient', () => {
  it('sends the stored token as a Bearer authorization header', async () => {
    localStorage.setItem('token', 'token-123');
    const calls = mockApi('get', '/api/children', []);

    await apiClient.get('/api/children');

    expect(calls[0].authorization).toBe('Bearer token-123');
  });

  it('sends no authorization header when no token is stored', async () => {
    const calls = mockApi('get', '/api/children', []);

    await apiClient.get('/api/children');

    expect(calls[0].authorization).toBeNull();
  });

  it('clears the stored token and user after a 401 from a protected endpoint', async () => {
    localStorage.setItem('token', 'expired');
    localStorage.setItem('user', '{"username":"x"}');
    mockApi('get', '/api/children', { message: 'expired' }, 401);

    await expect(apiClient.get('/api/children')).rejects.toBeDefined();

    expect(localStorage.getItem('token')).toBeNull();
    expect(localStorage.getItem('user')).toBeNull();
  });

  it('keeps the stored token after a 401 from the login endpoint', async () => {
    localStorage.setItem('token', 'still-here');
    mockApi('post', '/api/auth/login', { message: 'bad credentials' }, 401);

    await expect(apiClient.post('/api/auth/login', {})).rejects.toBeDefined();

    expect(localStorage.getItem('token')).toBe('still-here');
  });
});
