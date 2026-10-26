import { describe, expect, it } from 'vitest';
import { act, render, screen, waitFor } from '@testing-library/react';
import { AuthProvider } from '../AuthContext';
import { useAuth } from '../../hooks/useAuth';
import { mockApi, mockSession } from '../../test/http';

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

async function renderProbe() {
  render(<AuthProvider><AuthProbe /></AuthProvider>);
  await waitFor(() => expect(screen.getByTestId('loading')).toHaveTextContent('idle'));
}

describe('AuthContext', () => {
  it('is loading until the session check finishes', async () => {
    render(<AuthProvider><AuthProbe /></AuthProvider>);
    expect(screen.getByTestId('loading')).toHaveTextContent('loading');
    await waitFor(() => expect(screen.getByTestId('loading')).toHaveTextContent('idle'));
  });

  it('starts logged out when there is no session', async () => {
    await renderProbe();
    expect(screen.getByTestId('state')).toHaveTextContent('out');
  });

  it('restores the user from the session check on mount', async () => {
    mockSession({ username: 'maria', role: 'ROLE_PARENT', profileId: 1 });

    await renderProbe();

    expect(screen.getByTestId('state')).toHaveTextContent('in');
    expect(screen.getByTestId('user')).toHaveTextContent('maria:ROLE_PARENT');
  });

  it('login marks the session as authenticated and keeps nothing in browser storage', async () => {
    mockApi('post', '/api/auth/login', { role: 'ROLE_DOCTOR', profileId: 9 });
    await renderProbe();

    await act(async () => {
      screen.getByText('login').click();
    });

    await waitFor(() => expect(screen.getByTestId('state')).toHaveTextContent('in'));
    expect(screen.getByTestId('user')).toHaveTextContent('maria:ROLE_DOCTOR');
    expect(localStorage.length).toBe(0);
  });

  it('logout calls the API and clears the state', async () => {
    mockSession({ username: 'maria' });
    const logoutCalls = mockApi('post', '/api/auth/logout', undefined, 204);
    await renderProbe();

    await act(async () => {
      screen.getByText('logout').click();
    });

    expect(logoutCalls).toHaveLength(1);
    expect(screen.getByTestId('state')).toHaveTextContent('out');
  });

  it('logout clears the state even when the API call fails', async () => {
    mockSession({ username: 'maria' });
    mockApi('post', '/api/auth/logout', { message: 'boom' }, 500);
    await renderProbe();

    await act(async () => {
      screen.getByText('logout').click();
    });

    await waitFor(() => expect(screen.getByTestId('state')).toHaveTextContent('out'));
  });
});
