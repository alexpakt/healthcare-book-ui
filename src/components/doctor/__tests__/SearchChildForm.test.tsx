import { describe, expect, it, vi, beforeEach } from 'vitest';
import { screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Route } from 'react-router-dom';
import { SearchChildForm } from '../SearchChildForm';
import { renderAuthApp } from '../../../test/renderAuth';
import { mockApi } from '../../../test/http';

const child = {
  id: 10,
  firstName: 'Νίκος',
  lastName: 'Παπαδόπουλος',
  amka: '12345678901',
  dateOfBirth: '2020-01-15',
  gender: 'MALE',
  bloodType: 'A+',
};

function renderForm() {
  return renderAuthApp(<Route path="/" element={<SearchChildForm patients={[]} />} />, {
    session: { role: 'ROLE_DOCTOR', profileId: 7 },
  });
}

async function searchAndOpenRequestModal() {
  const user = userEvent.setup();
  await user.type(await screen.findByLabelText(/AMKA Παιδιού/), child.amka);
  await user.click(screen.getByRole('button', { name: 'Αναζήτηση' }));
  await user.click(await screen.findByRole('button', { name: 'Αίτηση Σύνδεσης' }));
  return { user, dialog: await screen.findByRole('dialog') };
}

describe('SearchChildForm connection request', () => {
  beforeEach(() => {
    vi.spyOn(console, 'error').mockImplementation(() => {});
    mockApi('get', '/api/children/search', child);
  });

  it('shows a failed request error inside the modal, not behind it', async () => {
    mockApi('post', '/api/doctor-child-requests', { message: 'Υπάρχει ήδη αίτημα σύνδεσης' }, 400);

    renderForm();
    const { user, dialog } = await searchAndOpenRequestModal();
    await user.click(within(dialog).getByRole('button', { name: 'Αποστολή Αίτησης' }));

    expect(await within(dialog).findByText('Υπάρχει ήδη αίτημα σύνδεσης')).toBeInTheDocument();
    expect(screen.getAllByText('Υπάρχει ήδη αίτημα σύνδεσης')).toHaveLength(1);
  });

  it('clears the error when the modal is closed and reopened', async () => {
    mockApi('post', '/api/doctor-child-requests', { message: 'Υπάρχει ήδη αίτημα σύνδεσης' }, 400);

    renderForm();
    const { user, dialog } = await searchAndOpenRequestModal();
    await user.click(within(dialog).getByRole('button', { name: 'Αποστολή Αίτησης' }));
    await within(dialog).findByText('Υπάρχει ήδη αίτημα σύνδεσης');

    await user.click(within(dialog).getByRole('button', { name: 'Ακύρωση' }));
    await user.click(await screen.findByRole('button', { name: 'Αίτηση Σύνδεσης' }));

    expect(within(await screen.findByRole('dialog')).queryByText('Υπάρχει ήδη αίτημα σύνδεσης')).not.toBeInTheDocument();
  });
});
