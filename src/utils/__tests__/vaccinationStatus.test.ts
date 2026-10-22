import { describe, expect, it } from 'vitest';
import {
  getDoseState,
  getSchedulesForAge,
  getVaccinationStatus,
} from '../vaccinationStatus';
import type { Appointment, VaccinationRecord, VaccinationSchedule } from '../../types/parent';

const schedule = (overrides: Partial<VaccinationSchedule> = {}): VaccinationSchedule => ({
  id: 1,
  vaccineName: 'DTaP',
  vaccineNameGr: 'DTaP',
  recommendedAgeMonths: 2,
  doseNumber: 1,
  ...overrides,
});

const record = (overrides: Partial<VaccinationRecord> = {}): VaccinationRecord => ({
  id: 10,
  childId: 1,
  childName: 'Νίκος Παπαδόπουλος',
  vaccineName: 'DTaP',
  doseNumber: 1,
  administeredDate: '2026-03-01',
  administeredByDoctorName: 'Ελένη Κωνσταντίνου',
  ...overrides,
});

const appointment = (overrides: Partial<Appointment> = {}): Appointment => ({
  id: 20,
  childId: 1,
  childName: 'Νίκος Παπαδόπουλος',
  doctorId: 2,
  doctorName: 'Ελένη Κωνσταντίνου',
  appointmentDate: '2026-10-25T10:00:00',
  reason: 'Εμβολιασμός: DTaP (2μ)',
  status: 'SCHEDULED',
  ...overrides,
});

describe('getVaccinationStatus', () => {
  it('is COMPLETED when the vaccination has an administered date', () => {
    expect(getVaccinationStatus(record())).toBe('COMPLETED');
  });

  it('is PENDING when there is no administered date', () => {
    expect(getVaccinationStatus(record({ administeredDate: '' }))).toBe('PENDING');
  });
});

describe('getSchedulesForAge', () => {
  const schedules = [
    schedule({ id: 1, recommendedAgeMonths: 0 }),
    schedule({ id: 2, recommendedAgeMonths: 4 }),
    schedule({ id: 3, recommendedAgeMonths: 10 }),
    schedule({ id: 4, recommendedAgeMonths: 11 }),
  ];

  it('includes schedules up to six months ahead of the current age', () => {
    const ids = getSchedulesForAge(schedules, 4).map((s) => s.id);
    expect(ids).toEqual([1, 2, 3]);
  });

  it('excludes a schedule just beyond the six-month window', () => {
    expect(getSchedulesForAge(schedules, 4).map((s) => s.id)).not.toContain(4);
  });

  it('returns an empty list when no schedule is in the window', () => {
    expect(getSchedulesForAge([schedule({ recommendedAgeMonths: 30 })], 2)).toEqual([]);
  });
});

describe('getDoseState precedence', () => {
  it('reports COMPLETED with the record when a matching vaccination exists', () => {
    const rec = record();
    const state = getDoseState(schedule(), 2, [rec], []);
    expect(state.status).toBe('COMPLETED');
    expect(state.recordedVaccination).toBe(rec);
  });

  it('does not match a recorded vaccination for a different dose number', () => {
    const state = getDoseState(schedule({ doseNumber: 2 }), 2, [record({ doseNumber: 1 })], []);
    expect(state.status).not.toBe('COMPLETED');
  });

  it('reports SCHEDULED when a scheduled appointment names the vaccine and age', () => {
    const apt = appointment();
    const state = getDoseState(schedule(), 2, [], [apt]);
    expect(state.status).toBe('SCHEDULED');
    expect(state.scheduledAppointment).toBe(apt);
  });

  it('ignores appointments that are not SCHEDULED', () => {
    const state = getDoseState(schedule(), 2, [], [appointment({ status: 'REQUESTED' })]);
    expect(state.status).toBe('PENDING');
  });

  it('prefers a recorded vaccination over a scheduled appointment', () => {
    const state = getDoseState(schedule(), 2, [record()], [appointment()]);
    expect(state.status).toBe('COMPLETED');
  });

  it('treats null vaccinations and appointments as empty', () => {
    expect(getDoseState(schedule(), 2, null, null).status).toBe('PENDING');
    expect(getDoseState(schedule(), 2, null, undefined).status).toBe('PENDING');
  });
});

describe('age-based status', () => {
  it('is PENDING when the recommended age is within one month of the child age', () => {
    expect(getDoseState(schedule({ recommendedAgeMonths: 2 }), 2, [], []).status).toBe('PENDING');
    expect(getDoseState(schedule({ recommendedAgeMonths: 3 }), 2, [], []).status).toBe('PENDING');
    expect(getDoseState(schedule({ recommendedAgeMonths: 1 }), 2, [], []).status).toBe('PENDING');
  });

  it('is OVERDUE when the recommended age is more than one month in the past', () => {
    expect(getDoseState(schedule({ recommendedAgeMonths: 2 }), 4, [], []).status).toBe('OVERDUE');
  });

  it('is FUTURE when the recommended age is more than one month ahead', () => {
    expect(getDoseState(schedule({ recommendedAgeMonths: 6 }), 2, [], []).status).toBe('FUTURE');
  });

  it('places the one-month boundary inside PENDING', () => {
    // age 4: PENDING covers 3..5. 3 is PENDING, 2 is OVERDUE.
    expect(getDoseState(schedule({ recommendedAgeMonths: 3 }), 4, [], []).status).toBe('PENDING');
    expect(getDoseState(schedule({ recommendedAgeMonths: 2 }), 4, [], []).status).toBe('OVERDUE');
  });
});

describe('scheduled appointment matching', () => {
  it('a 13-month appointment does not mark a 3-month dose as SCHEDULED', () => {
    const apt = appointment({ reason: 'Εμβολιασμός: DTaP (13μ)' });
    const state = getDoseState(schedule({ recommendedAgeMonths: 3 }), 3, [], [apt]);
    expect(state.status).not.toBe('SCHEDULED');
  });

  it('marks the dose SCHEDULED when the appointment reason names the vaccine and this age', () => {
    const apt = appointment({ reason: 'Εμβολιασμός: DTaP (3μ)' });
    const state = getDoseState(schedule({ recommendedAgeMonths: 3 }), 3, [], [apt]);
    expect(state.status).toBe('SCHEDULED');
  });

  it('does not match a different vaccine whose name contains the scheduled vaccine name', () => {
    const apt = appointment({ reason: 'Εμβολιασμός: DTaP-IPV (2μ)' });
    const state = getDoseState(schedule({ vaccineName: 'DTaP', recommendedAgeMonths: 2 }), 2, [], [apt]);
    expect(state.status).not.toBe('SCHEDULED');
  });
});
