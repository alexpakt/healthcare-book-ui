import { describe, expect, it, vi, beforeEach } from 'vitest';
import { fireEvent, screen, waitFor } from '@testing-library/react';
import { DoctorAppointments } from '../DoctorAppointments';
import { Route } from 'react-router-dom';
import { renderAuthApp } from '../../../test/renderAuth';
import { mockApi } from '../../../test/http';
import type { DoctorAppointment } from '../../../types/doctor';

const scheduled: DoctorAppointment = {
  id: 1,
  childId: 1,
  childName: 'Νίκος',
  doctorId: 7,
  doctorName: 'Δρ. Παπαδόπουλος',
  appointmentDate: '2026-10-30T10:00:00',
  reason: 'Έλεγχος',
  status: 'SCHEDULED',
  parentName: 'Μαρία',
};

describe('DoctorAppointments status errors', () => {
  beforeEach(() => {
    localStorage.setItem('user', JSON.stringify({ profileId: 7 }));
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  it('shows the backend message and reloads the list when a cancel is rejected', async () => {
    const listCalls = mockApi('get', '/api/appointments', [scheduled]);
    mockApi('get', '/api/children', []);
    const patchCalls = mockApi(
      'patch',
      '/api/appointments/1/status',
      { status: 403, message: 'Invalid status transition: CANCELLED -> CANCELLED' },
      403
    );

    renderAuthApp(<Route path="/" element={<DoctorAppointments />} />);
    fireEvent.click(await screen.findByRole('button', { name: /Ακύρωση/ }));

    expect(await screen.findByText('Invalid status transition: CANCELLED -> CANCELLED')).toBeInTheDocument();
    expect(screen.getByText('Η ενέργεια απέτυχε')).toBeInTheDocument();
    expect(patchCalls[0].body).toEqual({ status: 'CANCELLED' });
    await waitFor(() => expect(listCalls.length).toBeGreaterThanOrEqual(2));
  });

  it('clears the error when the next status update succeeds', async () => {
    mockApi('get', '/api/appointments', [scheduled]);
    mockApi('get', '/api/children', []);
    mockApi('patch', '/api/appointments/1/status', { status: 403, message: 'Denied' }, 403);

    renderAuthApp(<Route path="/" element={<DoctorAppointments />} />);
    fireEvent.click(await screen.findByRole('button', { name: /Ακύρωση/ }));
    expect(await screen.findByText('Denied')).toBeInTheDocument();

    mockApi('patch', '/api/appointments/1/status', { ...scheduled, status: 'CANCELLED' });
    fireEvent.click(await screen.findByRole('button', { name: /Ακύρωση/ }));

    await waitFor(() => expect(screen.queryByText('Denied')).not.toBeInTheDocument());
  });
});
