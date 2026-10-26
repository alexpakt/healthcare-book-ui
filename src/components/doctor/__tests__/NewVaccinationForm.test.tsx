import { describe, expect, it, vi, beforeEach } from 'vitest';
import { screen } from '@testing-library/react';
import { NewVaccinationForm } from '../NewVaccinationForm';
import { Route } from 'react-router-dom';
import type { ReactElement } from 'react';
import { renderAuthApp } from '../../../test/renderAuth';
import { mockApi } from '../../../test/http';
import type { VaccinationSchedule } from '../../../types/parent';

const schedules: VaccinationSchedule[] = [
  { id: 1, vaccineName: 'DTaP', vaccineNameGr: 'Κοκκύτη', recommendedAgeMonths: 2, doseNumber: 1 },
  { id: 2, vaccineName: 'Hib', vaccineNameGr: 'Haemophilus', recommendedAgeMonths: 2, doseNumber: 1 },
];

function renderAsDoctor(ui: ReactElement) {
  return renderAuthApp(<Route path="/" element={ui} />, { session: { role: 'ROLE_DOCTOR', profileId: 7 } });
}

describe('NewVaccinationForm opened from a grid dose', () => {
  beforeEach(() => {
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  it('shows the dose it will record for a combination vaccine', async () => {
    mockApi('get', '/api/vaccines', [
      { id: 1, vaccineName: 'Hexavalent', vaccineNameGr: 'Εξαδύναμο', componentVaccineNames: ['DTaP', 'Hib'] },
      { id: 2, vaccineName: 'DTaP', vaccineNameGr: 'Κοκκύτη', componentVaccineNames: [] },
      { id: 3, vaccineName: 'Hib', vaccineNameGr: 'Haemophilus', componentVaccineNames: [] },
    ]);

    renderAsDoctor(
      <NewVaccinationForm
        opened
        onClose={vi.fn()}
        childId={1}
        childName="Νίκος"
        schedules={schedules}
        vaccinations={[]}
        initialVaccineName="Hexavalent"
      />
    );

    expect(await screen.findByText('Θα καταχωρηθεί')).toBeInTheDocument();
  });

  it('does not crash when the backend omits componentVaccineNames', async () => {
    mockApi('get', '/api/vaccines', [
      { id: 1, vaccineName: 'Hexavalent', vaccineNameGr: 'Εξαδύναμο' },
    ]);

    renderAsDoctor(
      <NewVaccinationForm
        opened
        onClose={vi.fn()}
        childId={1}
        childName="Νίκος"
        schedules={schedules}
        vaccinations={[]}
        initialVaccineName="Hexavalent"
      />
    );

    expect(await screen.findByText('Θα καταχωρηθεί')).toBeInTheDocument();
  });
});
