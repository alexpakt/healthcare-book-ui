import { describe, expect, it } from 'vitest';
import { authService } from '../authService';
import { mockApi } from '../../test/http';

describe('authService', () => {
  it('login posts the credentials and returns the auth response', async () => {
    const calls = mockApi('post', '/api/auth/login', { role: 'ROLE_PARENT', profileId: 7 });

    const result = await authService.login({ username: 'maria', password: 'pw' });

    expect(calls[0].body).toEqual({ username: 'maria', password: 'pw' });
    expect(result).toEqual({ role: 'ROLE_PARENT', profileId: 7 });
  });

  it('registerParent posts to the parent registration endpoint', async () => {
    const calls = mockApi('post', '/api/auth/register/parent', { role: 'ROLE_PARENT', profileId: 1 });

    await authService.registerParent({ username: 'p', password: 'pw' } as never);

    expect(calls[0].path).toBe('/api/auth/register/parent');
  });

  it('registerDoctor posts to the doctor registration endpoint', async () => {
    const calls = mockApi('post', '/api/auth/register/doctor', { role: 'ROLE_DOCTOR', profileId: 2 });

    await authService.registerDoctor({ username: 'd', password: 'pw' } as never);

    expect(calls[0].path).toBe('/api/auth/register/doctor');
  });

  it('changePassword posts to the change-password endpoint with the payload', async () => {
    const calls = mockApi('post', '/api/auth/change-password', {});

    await authService.changePassword({ currentPassword: 'a', newPassword: 'b' } as never);

    expect(calls[0].path).toBe('/api/auth/change-password');
    expect(calls[0].body).toEqual({ currentPassword: 'a', newPassword: 'b' });
  });

  it('me returns the user the auth cookie identifies', async () => {
    mockApi('get', '/api/auth/me', { username: 'maria', role: 'ROLE_PARENT', profileId: 7 });

    expect(await authService.me()).toEqual({ username: 'maria', role: 'ROLE_PARENT', profileId: 7 });
  });

  it('logout asks the API to clear the auth cookie', async () => {
    const calls = mockApi('post', '/api/auth/logout', undefined, 204);

    await authService.logout();

    expect(calls).toHaveLength(1);
  });
});
