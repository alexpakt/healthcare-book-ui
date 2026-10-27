import { describe, expect, it } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Route } from 'react-router-dom';
import { ChildDetail } from '../ChildDetail';
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
  return {
    appointments: mockApi('get', '/api/appointments/child/1', []),
    vaccinations: mockApi('get', '/api/vaccinations/child/1', []),
    schedules: mockApi('get', '/api/vaccination-schedules', []),
    medicalRecords: mockApi('get', '/api/medical-records/child/1', []),
    allergies: mockApi('get', '/api/allergies/child/1', []),
    growth: mockApi('get', '/api/growth-measurements/child/1', []),
    birthRecord: mockApi('get', '/api/birth-records/child/1', undefined, 204),
    render: () =>
      renderAuthApp(<Route path="/children/:childId" element={<ChildDetail />} />, {
        route: '/children/1',
        session: { role: 'ROLE_PARENT', profileId: 1 },
      }),
  };
}

describe('ChildDetail loads tab data on demand', () => {
  it('requests only the open tab when the page opens', async () => {
    const page = renderPage();
    page.render();

    await screen.findByText('Δεν υπάρχουν ραντεβού για αυτό το παιδί');

    expect(page.appointments).toHaveLength(1);
    for (const other of [page.vaccinations, page.schedules, page.medicalRecords, page.allergies, page.growth, page.birthRecord]) {
      expect(other).toHaveLength(0);
    }
  });

  it('requests a tab only once the parent opens it', async () => {
    const page = renderPage();
    page.render();
    await screen.findByText('Δεν υπάρχουν ραντεβού για αυτό το παιδί');

    await userEvent.click(screen.getByRole('tab', { name: 'Αλλεργίες' }));
    await waitFor(() => expect(page.allergies).toHaveLength(1));
    expect(page.medicalRecords).toHaveLength(0);

    await userEvent.click(screen.getByRole('tab', { name: 'Δεδομένα Γέννησης' }));
    await waitFor(() => expect(page.birthRecord).toHaveLength(1));
    expect(await screen.findByText('Δεν υπάρχουν δεδομένα γέννησης για αυτό το παιδί.')).toBeInTheDocument();
    expect(page.growth).toHaveLength(0);
  });

  it('keeps a visited tab mounted, so revisiting it does not refetch', async () => {
    const page = renderPage();
    page.render();
    await screen.findByText('Δεν υπάρχουν ραντεβού για αυτό το παιδί');

    await userEvent.click(screen.getByRole('tab', { name: 'Αλλεργίες' }));
    await waitFor(() => expect(page.allergies).toHaveLength(1));

    await userEvent.click(screen.getByRole('tab', { name: 'Ραντεβού' }));
    await userEvent.click(screen.getByRole('tab', { name: 'Αλλεργίες' }));

    expect(page.allergies).toHaveLength(1);
    expect(page.appointments).toHaveLength(1);
  });
});
