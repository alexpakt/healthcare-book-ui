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
        viewer="doctor"
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
        viewer="doctor"
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
        viewer="doctor"
        title="Σημερινά"
        emptyMessage="Κανένα"
        appointments={[appointment({ status: 'SCHEDULED' })]}
        isLoading={false}
      />
    );

    expect(screen.queryByRole('button', { name: /Ακύρωση/ })).not.toBeInTheDocument();
  });
});

describe('AppointmentsTable viewer', () => {
  it('shows the parent as the other party for a doctor', () => {
    renderWithProviders(
      <AppointmentsTable viewer="doctor" title="Ραντεβού" emptyMessage="Κανένα" appointments={[appointment({})]} isLoading={false} />
    );

    expect(screen.getByRole('columnheader', { name: 'Γονέας' })).toBeInTheDocument();
    expect(screen.getByText('Μαρία')).toBeInTheDocument();
    expect(screen.queryByText('Παπαδόπουλος')).not.toBeInTheDocument();
  });

  it('shows the doctor as the other party for a parent', () => {
    renderWithProviders(
      <AppointmentsTable viewer="parent" title="Ραντεβού" emptyMessage="Κανένα" appointments={[appointment({})]} isLoading={false} />
    );

    expect(screen.getByRole('columnheader', { name: 'Γιατρός' })).toBeInTheDocument();
    expect(screen.getByText('Παπαδόπουλος')).toBeInTheDocument();
    expect(screen.queryByText('Μαρία')).not.toBeInTheDocument();
  });

  it('lets a parent cancel a request that has not been answered yet', () => {
    const onCancel = vi.fn();
    renderWithProviders(
      <AppointmentsTable
        viewer="parent"
        title="Ραντεβού"
        emptyMessage="Κανένα"
        appointments={[appointment({ id: 7, status: 'REQUESTED' }), appointment({ id: 8, status: 'COMPLETED' })]}
        isLoading={false}
        onCancel={onCancel}
      />
    );

    const buttons = screen.getAllByRole('button', { name: /Ακύρωση/ });
    expect(buttons).toHaveLength(1);
    fireEvent.click(buttons[0]);
    expect(onCancel).toHaveBeenCalledWith(7);
  });
});

describe('AppointmentsTable view all', () => {
  it('does not show the button without a handler', () => {
    renderWithProviders(
      <AppointmentsTable viewer="parent" title="Ραντεβού" emptyMessage="Κανένα" appointments={[appointment({})]} isLoading={false} />
    );

    expect(screen.queryByRole('button', { name: /Προβολή όλων/ })).not.toBeInTheDocument();
  });

  it('calls the handler when the button is clicked', () => {
    const onViewAll = vi.fn();
    renderWithProviders(
      <AppointmentsTable
        viewer="parent"
        title="Ραντεβού"
        emptyMessage="Κανένα"
        appointments={[appointment({})]}
        isLoading={false}
        onViewAll={onViewAll}
      />
    );

    fireEvent.click(screen.getByRole('button', { name: /Προβολή όλων/ }));
    expect(onViewAll).toHaveBeenCalled();
  });
});
