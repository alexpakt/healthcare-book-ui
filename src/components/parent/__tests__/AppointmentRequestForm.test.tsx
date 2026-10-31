import { describe, expect, it, vi } from 'vitest';
import { screen } from '@testing-library/react';
import { renderWithProviders } from '../../../test/render';
import { mockApi } from '../../../test/http';
import { AppointmentRequestForm } from '../AppointmentRequestForm';

const eleni = { id: 1, firstName: 'Ελένη', lastName: 'Κωνσταντίνου', specialization: 'Παιδίατρος' };
const giorgos = { id: 2, firstName: 'Γιώργος', lastName: 'Παππάς', specialization: 'Παιδίατρος' };
const nikos = { id: 10, firstName: 'Νίκος', lastName: 'Παπαδόπουλος' };
const maria = { id: 11, firstName: 'Μαρία', lastName: 'Παπαδοπούλου' };

function renderForm(initialChildId?: number) {
  return renderWithProviders(<AppointmentRequestForm opened onClose={vi.fn()} initialChildId={initialChildId} />);
}

describe('AppointmentRequestForm preselection', () => {
  it('preselects the only child and their only doctor', async () => {
    mockApi('get', '/api/children', [nikos]);
    mockApi('get', '/api/children/10/doctors', [eleni]);
    mockApi('get', '/api/appointments', []);

    renderForm();

    expect(await screen.findByDisplayValue('Νίκος Παπαδόπουλος')).toBeInTheDocument();
    expect(await screen.findByDisplayValue('Ελένη Κωνσταντίνου — Παιδίατρος')).toBeInTheDocument();
  });

  it('preselects the only child but not a doctor when the child has several', async () => {
    mockApi('get', '/api/children', [nikos]);
    mockApi('get', '/api/children/10/doctors', [eleni, giorgos]);
    mockApi('get', '/api/appointments', []);

    renderForm();

    expect(await screen.findByDisplayValue('Νίκος Παπαδόπουλος')).toBeInTheDocument();
    expect(await screen.findByPlaceholderText('Επιλέξτε γιατρό')).toHaveValue('');
  });

  it('preselects nothing when the parent has several children', async () => {
    mockApi('get', '/api/children', [nikos, maria]);
    mockApi('get', '/api/appointments', []);

    renderForm();

    expect(await screen.findByPlaceholderText('Επιλέξτε παιδί')).toHaveValue('');
    expect(screen.queryByDisplayValue('Νίκος Παπαδόπουλος')).not.toBeInTheDocument();
  });

  it('preselects the only doctor of the chosen child when the parent has several children', async () => {
    mockApi('get', '/api/children', [nikos, maria]);
    mockApi('get', '/api/children/11/doctors', [eleni]);
    mockApi('get', '/api/appointments', []);

    renderForm(11);

    expect(await screen.findByDisplayValue('Μαρία Παπαδοπούλου')).toBeInTheDocument();
    expect(await screen.findByDisplayValue('Ελένη Κωνσταντίνου — Παιδίατρος')).toBeInTheDocument();
  });
});
