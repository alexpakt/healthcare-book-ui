import { describe, expect, it } from 'vitest';
import { act, render, screen, waitFor } from '@testing-library/react';
import { AuthProvider } from '../AuthContext';
import { useAuth } from '../../hooks/useAuth';
import { mockApi } from '../../test/http';

function AuthProbe() {
  const { isAuthenticated, user, login, logout, isLoading } = useAuth();
  return (
    <div>
      <p data-testid="state">{isAuthenticated ? 'in' : 'out'}</p>
      <p data-testid="loading">{isLoading ? 'loading' : 'idle'}</p>
      <p data-testid="user">{user ? `${user.username}:${user.role}` : 'none'}</p>
      <button onClick={() => login('maria', 'pw')}>login</button>
      <button onClick={() => logout()}>logout</button>
    </div>
  );
}

describe('AuthContext', () => {
  it('starts logged out when nothing is stored', async () => {
    render(<AuthProvider><AuthProbe /></AuthProvider>);
    await waitFor(() => expect(screen.getByTestId('loading')).toHaveTextContent('idle'));
    expect(screen.getByTestId('state')).toHaveTextContent('out');
  });

  it('restores the user and token from storage on mount', async () => {
    localStorage.setItem('token', 't');
    localStorage.setItem('user', JSON.stringify({ username: 'maria', role: 'ROLE_PARENT', profileId: 1 }));

    render(<AuthProvider><AuthProbe /></AuthProvider>);

    expect(await screen.findByTestId('state')).toHaveTextContent('in');
    expect(screen.getByTestId('user')).toHaveTextContent('maria:ROLE_PARENT');
  });

  it('login stores the token and user, and marks the session as authenticated', async () => {
    mockApi('post', '/api/auth/login', { token: 'jwt-1', role: 'ROLE_DOCTOR', profileId: 9 });
    render(<AuthProvider><AuthProbe /></AuthProvider>);
    await waitFor(() => expect(screen.getByTestId('loading')).toHaveTextContent('idle'));

    await act(async () => {
      screen.getByText('login').click();
    });

    await waitFor(() => expect(screen.getByTestId('state')).toHaveTextContent('in'));
    expect(localStorage.getItem('token')).toBe('jwt-1');
    expect(JSON.parse(localStorage.getItem('user')!)).toEqual({
      username: 'maria',
      role: 'ROLE_DOCTOR',
      profileId: 9,
    });
  });

  it('logout clears the state and storage', async () => {
    localStorage.setItem('token', 't');
    localStorage.setItem('user', JSON.stringify({ username: 'maria', role: 'ROLE_PARENT', profileId: 1 }));
    render(<AuthProvider><AuthProbe /></AuthProvider>);
    await screen.findByTestId('state');

    await act(async () => {
      screen.getByText('logout').click();
    });

    expect(screen.getByTestId('state')).toHaveTextContent('out');
    expect(localStorage.getItem('token')).toBeNull();
    expect(localStorage.getItem('user')).toBeNull();
  });

  describe('corrupt storage', () => {
    it('starts logged out and discards the session when the stored user data is corrupt', async () => {
      localStorage.setItem('token', 't');
      localStorage.setItem('user', '{not json');
      render(<AuthProvider><AuthProbe /></AuthProvider>);
      expect(await screen.findByTestId('state')).toHaveTextContent('out');
      expect(localStorage.getItem('token')).toBeNull();
      expect(localStorage.getItem('user')).toBeNull();
    });
  });
});
