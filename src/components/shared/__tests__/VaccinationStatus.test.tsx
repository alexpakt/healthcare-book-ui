import { describe, expect, it, vi, beforeEach } from 'vitest';
import { screen } from '@testing-library/react';
import { VaccinationStatus } from '../VaccinationStatus';
import { renderWithProviders } from '../../../test/render';
import { mockApi } from '../../../test/http';
import type { VaccinationRecord } from '../../../types/parent';

// Child is 4 months old. Schedules are read from the API and filtered to age + 6 months.
const schedules = [
  { id: 1, vaccineName: 'DTaP', vaccineNameGr: 'Κοκκύτη-Τέτανος', recommendedAgeMonths: 2, doseNumber: 1 },
  { id: 2, vaccineName: 'Hib', vaccineNameGr: 'Haemophilus', recommendedAgeMonths: 4, doseNumber: 1 },
  { id: 3, vaccineName: 'PCV', vaccineNameGr: 'Πνευμονιόκοκκος', recommendedAgeMonths: 4, doseNumber: 1 },
  { id: 4, vaccineName: 'MMR', vaccineNameGr: 'Ιλαρά', recommendedAgeMonths: 6, doseNumber: 1 },
  { id: 5, vaccineName: 'HPV', vaccineNameGr: 'Ιός HPV', recommendedAgeMonths: 40, doseNumber: 1 },
];

const hibRecord: VaccinationRecord = {
  id: 100,
  childId: 1,
  childName: 'Νίκος',
  vaccineName: 'Hib',
  doseNumber: 1,
  administeredDate: '2026-09-01',
  administeredByDoctorName: 'Ελένη Κωνσταντίνου',
};

describe('VaccinationStatus', () => {
  beforeEach(() => {
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  it('labels each dose by its status', async () => {
    mockApi('get', '/api/vaccination-schedules', schedules);

    renderWithProviders(<VaccinationStatus ageInMonths={4} vaccinations={[hibRecord]} />);

    expect(await screen.findByText('Καθυστερημένο')).toBeInTheDocument(); // DTaP, 2 months, not recorded
    expect(screen.getByText('Ολοκληρωμένο')).toBeInTheDocument(); // Hib, recorded
    expect(screen.getByText('Εκκρεμές')).toBeInTheDocument(); // PCV, 4 months, not recorded
    expect(screen.getByText('Μελλοντικό')).toBeInTheDocument(); // MMR, 6 months
  });

  it('leaves out schedules more than six months ahead', async () => {
    mockApi('get', '/api/vaccination-schedules', schedules);

    renderWithProviders(<VaccinationStatus ageInMonths={4} vaccinations={[]} />);

    await screen.findByText('Καθυστερημένο');
    expect(screen.queryByText('Ιός HPV')).not.toBeInTheDocument();
  });

  it('warns the user when a dose is overdue', async () => {
    mockApi('get', '/api/vaccination-schedules', schedules);

    renderWithProviders(<VaccinationStatus ageInMonths={4} vaccinations={[hibRecord]} />);

    expect(await screen.findByText('Προσοχή')).toBeInTheDocument();
  });

  it('shows an error when the schedules cannot be loaded', async () => {
    mockApi('get', '/api/vaccination-schedules', { message: 'down' }, 500);

    renderWithProviders(<VaccinationStatus ageInMonths={4} vaccinations={[]} />);

    expect(await screen.findByText('Αποτυχία φόρτωσης προγράμματος εμβολιασμών')).toBeInTheDocument();
  });
});
