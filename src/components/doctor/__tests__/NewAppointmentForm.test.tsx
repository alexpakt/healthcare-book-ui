import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
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

function renderForm(appointments: unknown[] = []) {
  mockApi('get', '/api/appointments', appointments);
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

describe('NewAppointmentForm slot picker', () => {
  beforeEach(() => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
    vi.setSystemTime(new Date(2026, 10, 2, 10, 0));
  });
  afterEach(() => vi.useRealTimers());

  const appointment = (id: number, doctorId: number, status: string, appointmentDate: string) => ({
    id,
    childId: 1,
    childName: 'Νίκος Παπαδόπουλος',
    doctorId,
    doctorName: 'Δρ',
    appointmentDate,
    reason: '',
    status,
  });

  it('disables the slots the doctor already has booked', async () => {
    renderForm([
      appointment(1, 5, 'SCHEDULED', '2026-11-03T09:00:00'),
      appointment(2, 5, 'REQUESTED', '2026-11-03T09:30:00'),
      appointment(3, 5, 'CANCELLED', '2026-11-03T10:00:00'),
    ]);

    await vi.waitFor(() => expect(screen.getByRole('button', { name: /Τρίτη 3 Νοεμβρίου, 09:00/ })).toBeDisabled());
    expect(screen.getByRole('button', { name: /Τρίτη 3 Νοεμβρίου, 09:30/ })).toBeDisabled();
    expect(screen.getByRole('button', { name: /Τρίτη 3 Νοεμβρίου, 10:00/ })).toBeEnabled();
  });

  it('submits the picked slot', async () => {
    const created = mockApi('post', '/api/appointments', { id: 9 });
    renderForm();
    const user = userEvent.setup();
    await user.click(await screen.findByPlaceholderText('Επιλέξτε ασθενή'));
    await user.click(await screen.findByRole('option', { name: 'Νίκος Παπαδόπουλος', hidden: true }));
    await user.click(await screen.findByRole('button', { name: /Τρίτη 3 Νοεμβρίου, 08:30/ }));
    await user.click(screen.getByRole('button', { name: 'Δημιουργία Ραντεβού' }));

    await vi.waitFor(() => expect(created).toHaveLength(1));
    expect(created[0].body).toMatchObject({ childId: 1, doctorId: 5, appointmentDate: '2026-11-03T08:30:00' });
  });
});
