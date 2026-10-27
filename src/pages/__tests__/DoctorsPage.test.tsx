import { describe, expect, it } from 'vitest';
import { screen, within } from '@testing-library/react';
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
    session: { username: 'maria', role: 'ROLE_PARENT', profileId: 5 },
  });
}

describe('DoctorsPage', () => {
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

  describe('unassigning a doctor', () => {
    it('asks for confirmation, deletes the connection and refreshes the list', async () => {
      mockApi('get', '/api/children', [child]);
      mockApi('get', '/api/children/10/doctors', [eleni]);
      mockApi('get', '/api/doctors', [eleni, giorgos]);
      const deletes = mockApi('delete', '/api/children/10/doctors/1', {}, 204);
      const user = userEvent.setup();

      renderPage();
      await screen.findByText('Ελένη Κωνσταντίνου');

      await user.click(screen.getByRole('button', { name: 'Αποσύνδεση' }));
      const dialog = await screen.findByRole('dialog');
      expect(deletes).toHaveLength(0);

      mockApi('get', '/api/children/10/doctors', []);
      await user.click(within(dialog).getByRole('button', { name: 'Αποσύνδεση' }));

      expect(await screen.findByText(/Δεν υπάρχει συνδεδεμένος ιατρός/)).toBeInTheDocument();
      expect(deletes).toHaveLength(1);
      expect(screen.queryByText('Ελένη Κωνσταντίνου')).not.toBeInTheDocument();
    });

    it('does not delete anything when the confirmation is cancelled', async () => {
      mockApi('get', '/api/children', [child]);
      mockApi('get', '/api/children/10/doctors', [eleni]);
      mockApi('get', '/api/doctors', [eleni, giorgos]);
      const deletes = mockApi('delete', '/api/children/10/doctors/1', {}, 204);
      const user = userEvent.setup();

      renderPage();
      await screen.findByText('Ελένη Κωνσταντίνου');

      await user.click(screen.getByRole('button', { name: 'Αποσύνδεση' }));
      await user.click(within(await screen.findByRole('dialog')).getByRole('button', { name: 'Ακύρωση' }));

      expect(deletes).toHaveLength(0);
      expect(screen.getByText('Ελένη Κωνσταντίνου')).toBeInTheDocument();
    });

    it('shows an error and keeps the doctor when the request fails', async () => {
      mockApi('get', '/api/children', [child]);
      mockApi('get', '/api/children/10/doctors', [eleni]);
      mockApi('get', '/api/doctors', [eleni, giorgos]);
      mockApi('delete', '/api/children/10/doctors/1', { message: 'boom' }, 500);
      const user = userEvent.setup();

      renderPage();
      await screen.findByText('Ελένη Κωνσταντίνου');

      await user.click(screen.getByRole('button', { name: 'Αποσύνδεση' }));
      await user.click(within(await screen.findByRole('dialog')).getByRole('button', { name: 'Αποσύνδεση' }));

      expect(await screen.findByText(/Η αποσύνδεση του ιατρού απέτυχε/)).toBeInTheDocument();
      expect(screen.getByText('Ελένη Κωνσταντίνου')).toBeInTheDocument();
    });

    it('offers no unassign button when listing all doctors', async () => {
      mockApi('get', '/api/children', [child]);
      mockApi('get', '/api/children/10/doctors', [eleni]);
      mockApi('get', '/api/doctors', [eleni, giorgos]);

      renderPage();
      await screen.findByText('Ελένη Κωνσταντίνου');
      await userEvent.setup().click(screen.getByRole('switch', { name: 'Μόνο οι συνδεδεμένοι ιατροί' }));
      await screen.findByText('Γιώργος Παππάς');

      expect(screen.queryByRole('button', { name: 'Αποσύνδεση' })).not.toBeInTheDocument();
    });
  });
});
