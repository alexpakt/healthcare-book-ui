import { describe, expect, it } from 'vitest';
import { authService } from '../authService';
import { mockApi } from '../../test/http';

describe('authService', () => {
  it('login posts the credentials and returns the auth response', async () => {
    const calls = mockApi('post', '/api/auth/login', { token: 't', role: 'ROLE_PARENT', profileId: 7 });

    const result = await authService.login({ username: 'maria', password: 'pw' });

    expect(calls[0].body).toEqual({ username: 'maria', password: 'pw' });
    expect(result).toEqual({ token: 't', role: 'ROLE_PARENT', profileId: 7 });
  });

  it('registerParent posts to the parent registration endpoint', async () => {
    const calls = mockApi('post', '/api/auth/register/parent', { token: 't', role: 'ROLE_PARENT', profileId: 1 });

    await authService.registerParent({ username: 'p', password: 'pw' } as never);

    expect(calls[0].path).toBe('/api/auth/register/parent');
  });

  it('registerDoctor posts to the doctor registration endpoint', async () => {
    const calls = mockApi('post', '/api/auth/register/doctor', { token: 't', role: 'ROLE_DOCTOR', profileId: 2 });

    await authService.registerDoctor({ username: 'd', password: 'pw' } as never);

    expect(calls[0].path).toBe('/api/auth/register/doctor');
  });

  it('changePassword posts to the change-password endpoint with the payload', async () => {
    const calls = mockApi('post', '/api/auth/change-password', {});

    await authService.changePassword({ currentPassword: 'a', newPassword: 'b' } as never);

    expect(calls[0].path).toBe('/api/auth/change-password');
    expect(calls[0].body).toEqual({ currentPassword: 'a', newPassword: 'b' });
  });

  it('logout removes the token and user from storage', () => {
    localStorage.setItem('token', 't');
    localStorage.setItem('user', '{}');

    authService.logout();

    expect(localStorage.getItem('token')).toBeNull();
    expect(localStorage.getItem('user')).toBeNull();
  });
});
