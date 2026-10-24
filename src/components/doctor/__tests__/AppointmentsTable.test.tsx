import { describe, expect, it, vi } from 'vitest';
import { fireEvent, screen } from '@testing-library/react';
import { AppointmentsTable } from '../AppointmentsTable';
import { renderWithProviders } from '../../../test/render';
import type { DoctorAppointment } from '../../../types/doctor';

const appointment = (overrides: Partial<DoctorAppointment>): DoctorAppointment => ({
  id: 1,
  childId: 1,
  childName: 'Νίκος',
  doctorId: 1,
  doctorName: 'Παπαδόπουλος',
  appointmentDate: '2026-10-30T10:00:00',
  reason: 'Έλεγχος',
  status: 'SCHEDULED',
  parentName: 'Μαρία',
  ...overrides,
});

describe('AppointmentsTable cancel action', () => {
  it('shows a cancel button for scheduled appointments and calls onCancel with the id', () => {
    const onCancel = vi.fn();

    renderWithProviders(
      <AppointmentsTable
        title="Προσεχή"
        emptyMessage="Κανένα"
        appointments={[appointment({ id: 42, status: 'SCHEDULED' })]}
        isLoading={false}
        onCancel={onCancel}
      />
    );

    fireEvent.click(screen.getByRole('button', { name: /Ακύρωση/ }));
    expect(onCancel).toHaveBeenCalledWith(42);
  });

  it('does not show a cancel button for appointments that are not scheduled', () => {
    renderWithProviders(
      <AppointmentsTable
        title="Αιτήματα"
        emptyMessage="Κανένα"
        appointments={[appointment({ status: 'REQUESTED' }), appointment({ id: 2, status: 'COMPLETED' })]}
        isLoading={false}
        onCancel={vi.fn()}
      />
    );

    expect(screen.queryByRole('button', { name: /Ακύρωση/ })).not.toBeInTheDocument();
  });

  it('does not render a cancel button when no onCancel handler is given', () => {
    renderWithProviders(
      <AppointmentsTable
        title="Σημερινά"
        emptyMessage="Κανένα"
        appointments={[appointment({ status: 'SCHEDULED' })]}
        isLoading={false}
      />
    );

    expect(screen.queryByRole('button', { name: /Ακύρωση/ })).not.toBeInTheDocument();
  });
});
