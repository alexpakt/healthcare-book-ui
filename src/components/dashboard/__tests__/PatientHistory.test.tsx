import { describe, expect, it } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Route } from 'react-router-dom';
import { PatientHistory } from '../PatientHistory';
import { renderAuthApp } from '../../../test/renderAuth';
import { mockApi } from '../../../test/http';

const child = {
  id: 1,
  firstName: 'Νίκος',
  lastName: 'Παπαδόπουλος',
  amka: '12345678901',
  dateOfBirth: '2025-01-15',
  gender: 'MALE',
};

function renderPage() {
  mockApi('get', '/api/children/1', child);
  const calls = {
    medicalRecords: mockApi('get', '/api/medical-records/child/1', []),
    vaccinations: mockApi('get', '/api/vaccinations/child/1', []),
    schedules: mockApi('get', '/api/vaccination-schedules', []),
    appointments: mockApi('get', '/api/appointments/child/1', []),
    allergies: mockApi('get', '/api/allergies/child/1', []),
    growth: mockApi('get', '/api/growth-measurements/child/1', []),
    birthRecord: mockApi('get', '/api/birth-records/child/1', undefined, 204),
  };
  renderAuthApp(<Route path="/patients/:childId" element={<PatientHistory />} />, {
    route: '/patients/1',
    session: { role: 'ROLE_DOCTOR', profileId: 7 },
  });
  return calls;
}

describe('PatientHistory loads tab data on demand', () => {
  it('requests only the open tab when the page opens', async () => {
    const calls = renderPage();

    await screen.findByRole('button', { name: /Νέο Ιατρικό Αρχείο/ });

    expect(calls.medicalRecords).toHaveLength(1);
    for (const other of [calls.vaccinations, calls.schedules, calls.appointments, calls.allergies, calls.growth, calls.birthRecord]) {
      expect(other).toHaveLength(0);
    }
  });

  it('offers to add a birth record when the child has none, once that tab is opened', async () => {
    const calls = renderPage();
    await screen.findByRole('button', { name: /Νέο Ιατρικό Αρχείο/ });

    await userEvent.click(screen.getByRole('tab', { name: 'Δεδομένα Γέννησης' }));

    expect(await screen.findByRole('button', { name: /Προσθήκη δεδομένων γέννησης/ })).toBeInTheDocument();
    await waitFor(() => expect(calls.birthRecord).toHaveLength(1));
    expect(calls.allergies).toHaveLength(0);
  });
});
