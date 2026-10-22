import { beforeEach, describe, expect, it } from 'vitest';
import { screen } from '@testing-library/react';
import { Route } from 'react-router-dom';
import { ProtectedRoute } from '../ProtectedRoute';
import { renderAuthApp } from '../../../test/renderAuth';

const parentPage = (
  <Route
    path="/parent"
    element={<ProtectedRoute requiredRole="ROLE_PARENT"><p>PARENT PAGE</p></ProtectedRoute>}
  />
);
const anyUserPage = (
  <Route path="/home" element={<ProtectedRoute><p>HOME PAGE</p></ProtectedRoute>} />
);

function storeUser(role: 'ROLE_PARENT' | 'ROLE_DOCTOR') {
  localStorage.setItem('token', 't');
  localStorage.setItem('user', JSON.stringify({ username: 'u', role, profileId: 1 }));
}

describe('ProtectedRoute', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('redirects an unauthenticated visitor to the login page', async () => {
    renderAuthApp(<>{parentPage}{anyUserPage}</>, { route: '/home' });
    expect(await screen.findByText('LOGIN PAGE')).toBeInTheDocument();
    expect(screen.queryByText('HOME PAGE')).not.toBeInTheDocument();
  });

  it('renders the page for an authenticated user', async () => {
    storeUser('ROLE_DOCTOR');
    renderAuthApp(<>{parentPage}{anyUserPage}</>, { route: '/home' });
    expect(await screen.findByText('HOME PAGE')).toBeInTheDocument();
  });

  it('redirects a user with the wrong role to the home page', async () => {
    storeUser('ROLE_DOCTOR');
    renderAuthApp(
      <>
        {parentPage}
        <Route path="/" element={<p>HOME ROOT</p>} />
      </>,
      { route: '/parent' }
    );
    expect(await screen.findByText('HOME ROOT')).toBeInTheDocument();
    expect(screen.queryByText('PARENT PAGE')).not.toBeInTheDocument();
  });

  it('renders the page when the role matches', async () => {
    storeUser('ROLE_PARENT');
    renderAuthApp(<>{parentPage}{anyUserPage}</>, { route: '/parent' });
    expect(await screen.findByText('PARENT PAGE')).toBeInTheDocument();
  });
});
