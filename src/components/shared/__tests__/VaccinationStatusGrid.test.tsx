import { describe, expect, it, vi } from 'vitest';
import { fireEvent, screen } from '@testing-library/react';
import { VaccinationStatusGrid } from '../VaccinationStatusGrid';
import { renderWithProviders } from '../../../test/render';
import type { Appointment, VaccinationRecord, VaccinationSchedule } from '../../../types/parent';

// Child is 4 months old. Doses are shown when they fall within age + 6 months.
const schedules: VaccinationSchedule[] = [
  { id: 1, vaccineName: 'DTaP', vaccineNameGr: 'Κοκκύτη', recommendedAgeMonths: 2, doseNumber: 1 },
  { id: 2, vaccineName: 'DTaP', vaccineNameGr: 'Κοκκύτη', recommendedAgeMonths: 4, doseNumber: 2 },
  { id: 3, vaccineName: 'Hib', vaccineNameGr: 'Haemophilus', recommendedAgeMonths: 4, doseNumber: 1 },
];

const dtapDose1: VaccinationRecord = {
  id: 10,
  childId: 1,
  childName: 'Νίκος',
  vaccineName: 'DTaP',
  doseNumber: 1,
  administeredDate: '2026-09-01',
  administeredByDoctorName: 'Ελένη',
};

const hibBooked: Appointment = {
  id: 20,
  childId: 1,
  childName: 'Νίκος',
  doctorId: 2,
  doctorName: 'Ελένη',
  appointmentDate: '2026-11-03T10:00:00',
  reason: 'Εμβολιασμός: Hib (4μ)',
  status: 'SCHEDULED',
};

const renderGrid = (viewerRole: 'PARENT' | 'DOCTOR', onDoseClick = vi.fn()) => {
  renderWithProviders(
    <VaccinationStatusGrid
      ageInMonths={4}
      schedules={schedules}
      vaccinations={[dtapDose1]}
      appointments={[hibBooked]}
      viewerRole={viewerRole}
      onDoseClick={onDoseClick}
    />
  );
  return onDoseClick;
};

describe('VaccinationStatusGrid', () => {
  it('reports a pending dose to the parent with the vaccine and dose', () => {
    const onDoseClick = renderGrid('PARENT');

    fireEvent.click(screen.getByText('⏳ Εκκρεμές'));

    expect(onDoseClick).toHaveBeenCalledWith({
      vaccineName: 'DTaP',
      vaccineNameGr: 'Κοκκύτη',
      doseNumber: 2,
      recommendedAgeMonths: 4,
      status: 'PENDING',
    });
  });

  it('does not report a completed dose', () => {
    const onDoseClick = renderGrid('DOCTOR');

    fireEvent.click(screen.getByText('Ολοκληρωμένο'));

    expect(onDoseClick).not.toHaveBeenCalled();
  });

  it('does not let a parent act on a dose that already has an appointment', () => {
    const onDoseClick = renderGrid('PARENT');

    fireEvent.click(screen.getByText('✓ Προγραμματισμένο'));

    expect(onDoseClick).not.toHaveBeenCalled();
  });

  it('lets a doctor act on a dose that already has an appointment', () => {
    const onDoseClick = renderGrid('DOCTOR');

    fireEvent.click(screen.getByText('✓ Προγραμματισμένο'));

    expect(onDoseClick).toHaveBeenCalledWith(expect.objectContaining({ vaccineName: 'Hib', status: 'SCHEDULED' }));
  });

  it('shows the doctor hint and the doctor warning for an overdue dose', () => {
    // Nothing recorded: DTaP dose 1 (due at 2 months) is overdue for a 4-month-old.
    renderWithProviders(
      <VaccinationStatusGrid
        ageInMonths={4}
        schedules={schedules}
        vaccinations={[]}
        appointments={[]}
        viewerRole="DOCTOR"
        onDoseClick={vi.fn()}
      />
    );

    expect(screen.getAllByText('Κλικ για ενέργεια').length).toBeGreaterThan(0);
    expect(screen.getByText(/Καταχωρήστε τη δόση/)).toBeInTheDocument();
  });
});
