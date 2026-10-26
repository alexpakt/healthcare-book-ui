import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { parentService } from '../parentService';
import { mockApi } from '../../test/http';
import type { Appointment } from '../../types/parent';

// Fixed "now": 21 October 2026, midday local time.
const NOW = new Date(2026, 9, 21, 12, 0, 0);
const DAY = 24 * 60 * 60 * 1000;

const child = (id: number) => ({
  id,
  firstName: `Παιδί${id}`,
  lastName: 'Δοκιμή',
  amka: `1234567890${id}`,
  dateOfBirth: '2025-01-15',
  gender: 'FEMALE' as const,
});

const appointment = (overrides: Partial<Appointment>): Appointment => ({
  id: 1,
  childId: 1,
  childName: 'Παιδί1',
  doctorId: 2,
  doctorName: 'Ελένη Κωνσταντίνου',
  appointmentDate: new Date(NOW.getTime() + DAY).toISOString(),
  reason: 'Έλεγχος',
  status: 'SCHEDULED',
  ...overrides,
});

describe('parentService endpoints', () => {
  it('getVaccinationSchedulesByAge reads schedules for an age in months', async () => {
    const calls = mockApi('get', '/api/vaccination-schedules/age/6', []);
    await parentService.getVaccinationSchedulesByAge(6);
    expect(calls[0].path).toBe('/api/vaccination-schedules/age/6');
  });

  it('getVaccinationSchedulesByVaccine reads schedules for one vaccine', async () => {
    const calls = mockApi('get', '/api/vaccination-schedules/vaccine/DTaP', []);
    await parentService.getVaccinationSchedulesByVaccine('DTaP');
    expect(calls[0].path).toBe('/api/vaccination-schedules/vaccine/DTaP');
  });

});

describe('parentService.getDashboardData', () => {
  beforeEach(() => {
    vi.useFakeTimers({ toFake: ['Date'] });
    vi.setSystemTime(NOW);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('counts children and only scheduled appointments within the next 30 days', async () => {
    mockApi('get', '/api/children', [child(1), child(2)]);
    mockApi(
      'get',
      '/api/appointments',
      [
        appointment({ id: 1, appointmentDate: new Date(NOW.getTime() + 5 * DAY).toISOString() }),
        appointment({ id: 2, appointmentDate: new Date(NOW.getTime() + 60 * DAY).toISOString() }),
        appointment({ id: 3, status: 'REQUESTED', appointmentDate: new Date(NOW.getTime() + 2 * DAY).toISOString() }),
      ]
    );

    const data = await parentService.getDashboardData();

    expect(data.upcomingAppointments.map((a) => a.id)).toEqual([1]);
  });
});
