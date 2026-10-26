import { describe, expect, it } from 'vitest';
import { screen } from '@testing-library/react';
import { AppointmentStatusBadge } from '../AppointmentStatusBadge';
import { renderWithProviders } from '../../../test/render';

describe('AppointmentStatusBadge', () => {
  it.each([
    ['REQUESTED', 'ΣΕ ΑΝΑΜΟΝΗ'],
    ['SCHEDULED', 'ΠΡΟΓΡΑΜΜΑΤΙΣΜΕΝΟ'],
    ['COMPLETED', 'ΟΛΟΚΛΗΡΩΜΕΝΟ'],
    ['DECLINED', 'ΑΠΟΡΡΙΦΘΗΚΕ'],
    ['CANCELLED', 'ΑΚΥΡΩΘΗΚΕ'],
  ] as const)('shows the Greek label for %s', (status, label) => {
    renderWithProviders(<AppointmentStatusBadge status={status} />);
    expect(screen.getByText(label)).toBeInTheDocument();
  });
});
