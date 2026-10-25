import { beforeEach, describe, expect, it } from 'vitest';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Route } from 'react-router-dom';
import DoctorsPage from '../DoctorsPage';
import { renderAuthApp } from '../../test/renderAuth';
import { mockApi } from '../../test/http';

const eleni = { id: 1, firstName: 'Ελένη', lastName: 'Κωνσταντίνου', specialization: 'Παιδίατρος' };
const giorgos = { id: 2, firstName: 'Γιώργος', lastName: 'Παππάς', specialization: 'Παιδίατρος' };
const child = { id: 10, firstName: 'Νίκος', lastName: 'Παπαδόπουλος', amka: '12345678901', dateOfBirth: '2020-01-15', gender: 'MALE' };

function renderPage() {
  return renderAuthApp(<Route path="/doctors" element={<DoctorsPage />} />, {
    route: '/doctors',
    defaultLoginPage: false,
  });
}

describe('DoctorsPage', () => {
  beforeEach(() => {
    localStorage.setItem('token', 'token');
    localStorage.setItem('user', JSON.stringify({ username: 'maria', role: 'ROLE_PARENT', profileId: 5 }));
  });

  it('shows only the doctors connected to the child by default', async () => {
    mockApi('get', '/api/children', [child]);
    mockApi('get', '/api/children/10/doctors', [eleni]);
    mockApi('get', '/api/doctors', [eleni, giorgos]);

    renderPage();

    expect(await screen.findByText('Ελένη Κωνσταντίνου')).toBeInTheDocument();
    expect(screen.queryByText('Γιώργος Παππάς')).not.toBeInTheDocument();
    expect(screen.getByRole('switch', { name: 'Μόνο οι συνδεδεμένοι ιατροί' })).toBeChecked();
  });

  it('shows all doctors when the connected-only filter is switched off', async () => {
    mockApi('get', '/api/children', [child]);
    mockApi('get', '/api/children/10/doctors', [eleni]);
    mockApi('get', '/api/doctors', [eleni, giorgos]);

    renderPage();
    await screen.findByText('Ελένη Κωνσταντίνου');

    await userEvent.setup().click(screen.getByRole('switch', { name: 'Μόνο οι συνδεδεμένοι ιατροί' }));

    expect(await screen.findByText('Γιώργος Παππάς')).toBeInTheDocument();
    expect(screen.getByText('Ελένη Κωνσταντίνου')).toBeInTheDocument();
  });

  it('shows all doctors and no filter when the parent has no children', async () => {
    mockApi('get', '/api/children', []);
    mockApi('get', '/api/doctors', [eleni, giorgos]);

    renderPage();

    expect(await screen.findByText('Γιώργος Παππάς')).toBeInTheDocument();
    expect(screen.queryByRole('switch', { name: 'Μόνο οι συνδεδεμένοι ιατροί' })).not.toBeInTheDocument();
  });

  it('explains how to see all doctors when the child has no connected doctor', async () => {
    mockApi('get', '/api/children', [child]);
    mockApi('get', '/api/children/10/doctors', []);
    mockApi('get', '/api/doctors', [eleni, giorgos]);

    renderPage();

    expect(
      await screen.findByText(/Δεν υπάρχει συνδεδεμένος ιατρός για αυτό το παιδί/)
    ).toBeInTheDocument();
    expect(screen.queryByText('Γιώργος Παππάς')).not.toBeInTheDocument();
  });
});
