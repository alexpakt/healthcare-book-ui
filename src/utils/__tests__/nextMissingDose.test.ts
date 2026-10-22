import { describe, expect, it } from 'vitest';
import { getNextMissingDoseNumber } from '../vaccinationStatus';
import type { VaccinationRecord, VaccinationSchedule } from '../../types/parent';

const schedules: VaccinationSchedule[] = [
  { id: 1, vaccineName: 'DTaP', vaccineNameGr: 'Κοκκύτη', recommendedAgeMonths: 2, doseNumber: 1 },
  { id: 2, vaccineName: 'DTaP', vaccineNameGr: 'Κοκκύτη', recommendedAgeMonths: 4, doseNumber: 2 },
  { id: 3, vaccineName: 'DTaP', vaccineNameGr: 'Κοκκύτη', recommendedAgeMonths: 6, doseNumber: 3 },
];

const recorded = (vaccineName: string, doseNumber: number): VaccinationRecord => ({
  id: doseNumber,
  childId: 1,
  childName: 'Νίκος',
  vaccineName,
  doseNumber,
  administeredDate: '2026-01-10',
  administeredByDoctorName: 'Ελένη',
});

describe('getNextMissingDoseNumber', () => {
  it('starts at the first scheduled dose when nothing is recorded', () => {
    expect(getNextMissingDoseNumber(schedules, [], 'DTaP')).toBe(1);
  });

  it('picks the lowest scheduled dose not yet recorded, even if later doses are recorded', () => {
    const vaccinations = [recorded('DTaP', 1), recorded('DTaP', 3)];
    expect(getNextMissingDoseNumber(schedules, vaccinations, 'DTaP')).toBe(2);
  });

  it('goes one past the highest scheduled dose once all are recorded', () => {
    const vaccinations = [recorded('DTaP', 1), recorded('DTaP', 2), recorded('DTaP', 3)];
    expect(getNextMissingDoseNumber(schedules, vaccinations, 'DTaP')).toBe(4);
  });

  it('ignores recorded doses of other vaccines', () => {
    expect(getNextMissingDoseNumber(schedules, [recorded('Hib', 1)], 'DTaP')).toBe(1);
  });

  it('returns 1 for a vaccine with no schedule, as the backend does', () => {
    expect(getNextMissingDoseNumber(schedules, [], 'Rotavirus')).toBe(1);
  });
});
