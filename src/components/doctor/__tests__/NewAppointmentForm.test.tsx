import { describe, expect, it } from 'vitest';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Route } from 'react-router-dom';
import { NewAppointmentForm } from '../NewAppointmentForm';
import { renderAuthApp } from '../../../test/renderAuth';
import { mockApi } from '../../../test/http';

const child = (id: number, firstName: string, lastName: string) => ({
  id,
  firstName,
  lastName,
  amka: `1234567890${id}`,
  dateOfBirth: '2025-01-15',
  gender: 'MALE' as const,
});

function renderForm() {
  mockApi('get', '/api/children', [child(1, 'Νίκος', 'Παπαδόπουλος'), child(2, 'Ελένη', 'Γεωργίου'), child(3, 'Νίκη', 'Αντωνίου')]);
  renderAuthApp(
    <Route path="/" element={<NewAppointmentForm opened onClose={() => {}} />} />,
    { session: { role: 'ROLE_DOCTOR', profileId: 5 } }
  );
}

describe('NewAppointmentForm patient search', () => {
  it('filters the patients as the doctor types, ignoring accents and case', async () => {
    renderForm();
    const patient = await screen.findByPlaceholderText('Επιλέξτε ασθενή');
    await screen.findByRole('option', { name: 'Νίκος Παπαδόπουλος', hidden: true });

    await userEvent.type(patient, 'νικος');

    const shown = screen.getAllByRole('option', { hidden: true }).map((option) => option.textContent);
    expect(shown).toEqual(['Νίκος Παπαδόπουλος']);
  });

  it('says so when no patient matches', async () => {
    renderForm();
    const patient = await screen.findByPlaceholderText('Επιλέξτε ασθενή');
    await screen.findByRole('option', { name: 'Νίκος Παπαδόπουλος', hidden: true });

    await userEvent.type(patient, 'ζζζ');

    expect(await screen.findByText('Δεν βρέθηκε ασθενής')).toBeInTheDocument();
  });
});
