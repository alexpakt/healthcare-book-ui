import { describe, expect, it } from 'vitest';
import { appointmentService } from '../appointmentService';
import { mockApi } from '../../test/http';

describe('appointmentService', () => {
  it('getAll lists the appointments of the current user', async () => {
    const calls = mockApi('get', '/api/appointments', [{ id: 1 }]);
    const result = await appointmentService.getAll();
    expect(calls[0].path).toBe('/api/appointments');
    expect(result).toHaveLength(1);
  });

  it('getForChild reads the appointments of one child', async () => {
    const calls = mockApi('get', '/api/appointments/child/4', []);
    await appointmentService.getForChild(4);
    expect(calls[0].path).toBe('/api/appointments/child/4');
  });

  it('create posts the appointment request', async () => {
    const request = { childId: 1, doctorId: 2, appointmentDate: '2026-10-25T10:00:00' };
    const calls = mockApi('post', '/api/appointments', { id: 9 });
    await appointmentService.create(request);
    expect(calls[0].method).toBe('POST');
    expect(calls[0].body).toEqual(request);
  });

  it('updateStatus patches the status of one appointment', async () => {
    const calls = mockApi('patch', '/api/appointments/8/status', { id: 8 });
    await appointmentService.updateStatus(8, 'CANCELLED');
    expect(calls[0].method).toBe('PATCH');
    expect(calls[0].body).toEqual({ status: 'CANCELLED' });
  });
});
