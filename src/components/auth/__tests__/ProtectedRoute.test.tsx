import { describe, expect, it } from 'vitest';
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

describe('ProtectedRoute', () => {
  it('redirects an unauthenticated visitor to the login page', async () => {
    renderAuthApp(<>{parentPage}{anyUserPage}</>, { route: '/home' });
    expect(await screen.findByText('LOGIN PAGE')).toBeInTheDocument();
    expect(screen.queryByText('HOME PAGE')).not.toBeInTheDocument();
  });

  it('renders the page for an authenticated user', async () => {
    renderAuthApp(<>{parentPage}{anyUserPage}</>, { route: '/home', session: { role: 'ROLE_DOCTOR' } });
    expect(await screen.findByText('HOME PAGE')).toBeInTheDocument();
  });

  it('redirects a user with the wrong role to the home page', async () => {
    renderAuthApp(
      <>
        {parentPage}
        <Route path="/" element={<p>HOME ROOT</p>} />
      </>,
      { route: '/parent', session: { role: 'ROLE_DOCTOR' } }
    );
    expect(await screen.findByText('HOME ROOT')).toBeInTheDocument();
    expect(screen.queryByText('PARENT PAGE')).not.toBeInTheDocument();
  });

  it('renders the page when the role matches', async () => {
    renderAuthApp(<>{parentPage}{anyUserPage}</>, { route: '/parent', session: { role: 'ROLE_PARENT' } });
    expect(await screen.findByText('PARENT PAGE')).toBeInTheDocument();
  });
});
