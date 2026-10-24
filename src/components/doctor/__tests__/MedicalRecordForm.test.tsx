import { describe, expect, it, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import type { ReactNode } from 'react';
import { MantineProvider } from '@mantine/core';
import { MemoryRouter } from 'react-router-dom';
import { MedicalRecordForm } from '../MedicalRecordForm';
import type { MedicalHistory } from '../../../types/doctor';

const Providers = ({ children }: { children: ReactNode }) => (
  <MantineProvider>
    <MemoryRouter>{children}</MemoryRouter>
  </MantineProvider>
);

const record = (overrides: Partial<MedicalHistory>): MedicalHistory => ({
  id: 1,
  childId: 7,
  childName: 'Νίκος',
  doctorId: 3,
  doctorName: 'Δρ. Παπαδόπουλος',
  recordDate: '2026-03-10T00:00:00',
  diagnosis: 'Οξεία φαρυγγίτιδα',
  notes: 'Πυρετός 38.5',
  prescription: 'Αμοξικιλλίνη 250mg',
  ...overrides,
});

describe('MedicalRecordForm edit', () => {
  it('shows the saved values when an edit is opened after the form was mounted', async () => {
    const { rerender } = render(
      <MedicalRecordForm opened={false} childId={7} editRecord={null} onClose={vi.fn()} />,
      { wrapper: Providers }
    );

    rerender(
      <MedicalRecordForm opened childId={7} editRecord={record({})} onClose={vi.fn()} />
    );

    expect(await screen.findByLabelText(/Διάγνωση/)).toHaveValue('Οξεία φαρυγγίτιδα');
    expect(screen.getByLabelText('Συνταγή (Προαιρετικό)')).toHaveValue('Αμοξικιλλίνη 250mg');
    expect(screen.getByLabelText('Σημειώσεις (Προαιρετικό)')).toHaveValue('Πυρετός 38.5');
    await waitFor(() => expect(document.querySelector('input[type="date"]')).toHaveValue('2026-03-10'));
  });

  it('shows the newly selected record after closing and editing another one', async () => {
    const { rerender } = render(
      <MedicalRecordForm opened={false} childId={7} editRecord={null} onClose={vi.fn()} />,
      { wrapper: Providers }
    );

    rerender(
      <MedicalRecordForm opened childId={7} editRecord={record({ id: 1 })} onClose={vi.fn()} />
    );
    rerender(
      <MedicalRecordForm opened={false} childId={7} editRecord={record({ id: 1 })} onClose={vi.fn()} />
    );
    rerender(
      <MedicalRecordForm
        opened
        childId={7}
        editRecord={record({ id: 2, diagnosis: 'Ωτίτιδα', notes: '', prescription: '' })}
        onClose={vi.fn()}
      />
    );

    expect(await screen.findByLabelText(/Διάγνωση/)).toHaveValue('Ωτίτιδα');
    expect(screen.getByLabelText('Συνταγή (Προαιρετικό)')).toHaveValue('');
  });
});
