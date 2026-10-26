import type { ReactElement } from 'react';
import { render } from '@testing-library/react';
import { MantineProvider } from '@mantine/core';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { AuthProvider } from '../context/AuthContext';
import { mockSession } from './http';

/**
 * Renders the app's auth provider and routes inside a memory router.
 * `routes` describes the pages under test. A stub login page is included unless `defaultLoginPage` is false,
 * so redirects can be seen. Pass false when the test renders the real login page.
 * Pass `session` to start signed in as that user; without it the visitor is signed out.
 */
export function renderAuthApp(
  routes: ReactElement,
  {
    route = '/',
    defaultLoginPage = true,
    session,
  }: { route?: string; defaultLoginPage?: boolean; session?: Parameters<typeof mockSession>[0] } = {}
) {
  if (session) mockSession(session);
  return render(
    <MantineProvider>
      <AuthProvider>
        <MemoryRouter initialEntries={[route]}>
          <Routes>
            {defaultLoginPage && <Route path="/login" element={<p>LOGIN PAGE</p>} />}
            {routes}
          </Routes>
        </MemoryRouter>
      </AuthProvider>
    </MantineProvider>
  );
}
