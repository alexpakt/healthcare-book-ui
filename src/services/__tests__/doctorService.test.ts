import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { doctorService } from '../doctorService';
import { mockApi } from '../../test/http';
import type { DoctorAppointment } from '../../types/doctor';

// Fixed "now": 21 October 2026, midday local time.
const NOW = new Date(2026, 9, 21, 12, 0, 0);
const DAY = 24 * 60 * 60 * 1000;

const appointment = (overrides: Partial<DoctorAppointment>): DoctorAppointment => ({
  id: 1,
  childId: 1,
  childName: 'Παιδί1',
  doctorId: 2,
  doctorName: 'Ελένη Κωνσταντίνου',
  appointmentDate: new Date(2026, 9, 21, 15, 0, 0).toISOString(),
  reason: 'Έλεγχος',
  status: 'SCHEDULED',
  parentName: 'Μαρία Παπαδοπούλου',
  ...overrides,
});

describe('doctorService endpoints', () => {
  it('createMedicalRecord posts to the medical record endpoint', async () => {
    const calls = mockApi('post', '/api/medical-records', {});
    await doctorService.createMedicalRecord({ childId: 1, recordDate: '2026-10-21', diagnosis: 'Ωτίτιδα' });
    expect(calls[0].method).toBe('POST');
    expect(calls[0].body).toEqual({ childId: 1, recordDate: '2026-10-21', diagnosis: 'Ωτίτιδα' });
  });

  it('updateMedicalRecord puts to the record by id', async () => {
    const calls = mockApi('put', '/api/medical-records/31', {});
    await doctorService.updateMedicalRecord(31, { childId: 1, recordDate: '2026-10-21', diagnosis: 'x' });
    expect(calls[0].method).toBe('PUT');
    expect(calls[0].path).toBe('/api/medical-records/31');
  });

  it('createGrowthMeasurement posts the measurement', async () => {
    const calls = mockApi('post', '/api/growth-measurements', {});
    await doctorService.createGrowthMeasurement({ childId: 1, measurementDate: '2026-10-21', weightKg: 9.2 });
    expect(calls[0].path).toBe('/api/growth-measurements');
    expect(calls[0].body).toMatchObject({ weightKg: 9.2 });
  });

  it('createVaccination posts the vaccination record', async () => {
    const calls = mockApi('post', '/api/vaccinations', {});
    await doctorService.createVaccination({ childId: 1, vaccineName: 'DTaP', administeredDate: '2026-10-21' });
    expect(calls[0].path).toBe('/api/vaccinations');
    expect(calls[0].body).toMatchObject({ vaccineName: 'DTaP' });
  });

  it('deleteAllergy sends a delete request for the allergy', async () => {
    const calls = mockApi('delete', '/api/allergies/6', undefined, 204);
    await doctorService.deleteAllergy(6);
    expect(calls[0].method).toBe('DELETE');
    expect(calls[0].path).toBe('/api/allergies/6');
  });

  it('getPatientMedicalHistory combines records, vaccinations and allergies for one child', async () => {
    mockApi('get', '/api/children/3', { id: 3, firstName: 'Νίκος', lastName: 'Παπαδόπουλος' });
    mockApi('get', '/api/medical-records/child/3', [{ id: 1 }]);
    mockApi('get', '/api/vaccinations/child/3', [{ id: 2 }]);
    mockApi('get', '/api/allergies/child/3', [{ id: 3 }]);

    const history = await doctorService.getPatientMedicalHistory(3);

    expect(history.medicalRecords).toHaveLength(1);
    expect(history.vaccinations).toHaveLength(1);
    expect(history.allergies).toHaveLength(1);
  });
});

describe('doctorService appointment views', () => {
  beforeEach(() => {
    vi.useFakeTimers({ toFake: ['Date'] });
    vi.setSystemTime(NOW);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('getTodayAppointments returns only scheduled appointments on today’s date', async () => {
    mockApi('get', '/api/appointments', [
      appointment({ id: 1 }),
      appointment({ id: 2, status: 'REQUESTED' }),
      appointment({ id: 3, appointmentDate: new Date(2026, 9, 20, 15).toISOString() }),
    ]);
    const today = await doctorService.getTodayAppointments();
    expect(today.map((a) => a.id)).toEqual([1]);
  });

  it('getPendingAppointments returns only requests awaiting a decision', async () => {
    mockApi('get', '/api/appointments', [
      appointment({ id: 1 }),
      appointment({ id: 2, status: 'REQUESTED' }),
    ]);
    const pending = await doctorService.getPendingAppointments();
    expect(pending.map((a) => a.id)).toEqual([2]);
  });

  it('getUpcomingAppointments returns future scheduled appointments up to the limit', async () => {
    mockApi('get', '/api/appointments', [
      appointment({ id: 1, appointmentDate: new Date(NOW.getTime() + 1 * DAY).toISOString() }),
      appointment({ id: 2, appointmentDate: new Date(NOW.getTime() + 2 * DAY).toISOString() }),
      appointment({ id: 3, appointmentDate: new Date(NOW.getTime() + 3 * DAY).toISOString() }),
      appointment({ id: 4, appointmentDate: new Date(NOW.getTime() - 1 * DAY).toISOString() }),
    ]);
    const upcoming = await doctorService.getUpcomingAppointments(2);
    expect(upcoming.map((a) => a.id)).toEqual([1, 2]);
  });

  it('getAppointments pages the full list and reports totals', async () => {
    const many = Array.from({ length: 25 }, (_, i) => appointment({ id: i + 1 }));
    mockApi('get', '/api/appointments', many);

    const page = await doctorService.getAppointments(2, 10);

    expect(page.content.map((a) => a.id)).toEqual([11, 12, 13, 14, 15, 16, 17, 18, 19, 20]);
    expect(page.totalElements).toBe(25);
    expect(page.totalPages).toBe(3);
    expect(page.currentPage).toBe(2);
  });

});
