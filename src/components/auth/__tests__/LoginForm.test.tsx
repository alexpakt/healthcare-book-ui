import { describe, expect, it } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Route } from 'react-router-dom';
import { LoginForm } from '../LoginForm';
import { renderAuthApp } from '../../../test/renderAuth';
import { mockApi } from '../../../test/http';

const loginRoute = <Route path="/login" element={<LoginForm />} />;
const homeRoute = <Route path="/" element={<p>HOME</p>} />;

describe('LoginForm', () => {
  it('shows the username and password fields and the submit button', () => {
    renderAuthApp(<>{loginRoute}{homeRoute}</>, { route: '/login', defaultLoginPage: false });
    expect(screen.getByLabelText(/όνομα χρήστη/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/κωδικός πρόσβασης/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Σύνδεση' })).toBeInTheDocument();
  });

  it('sends the entered credentials and navigates home on success', async () => {
    const user = userEvent.setup();
    const calls = mockApi('post', '/api/auth/login', { token: 't', role: 'ROLE_PARENT', profileId: 1 });
    renderAuthApp(<>{loginRoute}{homeRoute}</>, { route: '/login', defaultLoginPage: false });

    await user.type(screen.getByLabelText(/όνομα χρήστη/i), 'maria');
    await user.type(screen.getByLabelText(/κωδικός πρόσβασης/i), 'secret');
    await user.click(screen.getByRole('button', { name: 'Σύνδεση' }));

    expect(await screen.findByText('HOME')).toBeInTheDocument();
    expect(calls[0].body).toEqual({ username: 'maria', password: 'secret' });
  });

  it('shows the server message when the credentials are rejected', async () => {
    const user = userEvent.setup();
    mockApi('post', '/api/auth/login', { message: 'Λάθος στοιχεία σύνδεσης' }, 401);
    renderAuthApp(<>{loginRoute}{homeRoute}</>, { route: '/login', defaultLoginPage: false });

    await user.type(screen.getByLabelText(/όνομα χρήστη/i), 'maria');
    await user.type(screen.getByLabelText(/κωδικός πρόσβασης/i), 'wrong');
    await user.click(screen.getByRole('button', { name: 'Σύνδεση' }));

    expect(await screen.findByText('Λάθος στοιχεία σύνδεσης')).toBeInTheDocument();
    await waitFor(() => expect(screen.queryByText('HOME')).not.toBeInTheDocument());
  });

  it('does not submit when a required field is empty', async () => {
    const user = userEvent.setup();
    const calls = mockApi('post', '/api/auth/login', {});
    renderAuthApp(<>{loginRoute}{homeRoute}</>, { route: '/login', defaultLoginPage: false });

    await user.click(screen.getByRole('button', { name: 'Σύνδεση' }));

    expect(calls).toHaveLength(0);
  });
});
