import { describe, expect, it, vi } from 'vitest';
import { screen } from '@testing-library/react';
import { renderWithProviders } from '../../../test/render';
import { MedicalRecordsList } from '../MedicalRecordsList';
import type { MedicalRecord } from '../../../types/parent';

const record = (id: number, doctorId: number): MedicalRecord => ({
  id,
  childId: 1,
  childName: 'Νίκος',
  doctorId,
  doctorName: `Γιατρός ${doctorId}`,
  recordDate: '2025-03-01',
  diagnosis: `Διάγνωση ${id}`,
});

describe('MedicalRecordsList', () => {
  it('shows the edit button only for records the viewer may edit', () => {
    renderWithProviders(
      <MedicalRecordsList
        records={[record(1, 7), record(2, 8)]}
        isLoading={false}
        onEdit={vi.fn()}
        canEdit={(r) => r.doctorId === 7}
      />
    );

    expect(screen.getAllByRole('button', { name: 'Επεξεργασία' })).toHaveLength(1);
  });
});
