import { describe, expect, it } from 'vitest';
import { doctorChildRequestService } from '../doctorChildRequestService';
import { mockApi } from '../../test/http';

describe('doctorChildRequestService', () => {
  it('getPendingRequests reads the pending requests', async () => {
    const calls = mockApi('get', '/api/doctor-child-requests/pending', []);
    await doctorChildRequestService.getPendingRequests();
    expect(calls[0].path).toBe('/api/doctor-child-requests/pending');
  });

  it('getSentPendingRequests reads the requests sent by the parent', async () => {
    const calls = mockApi('get', '/api/doctor-child-requests/pending/sent', []);
    await doctorChildRequestService.getSentPendingRequests();
    expect(calls[0].path).toBe('/api/doctor-child-requests/pending/sent');
  });

  it('approveRequest posts to the approve endpoint', async () => {
    const calls = mockApi('post', '/api/doctor-child-requests/9/approve', {});
    await doctorChildRequestService.approveRequest(9);
    expect(calls[0].method).toBe('POST');
    expect(calls[0].path).toBe('/api/doctor-child-requests/9/approve');
  });

  it('rejectRequest posts to the reject endpoint', async () => {
    const calls = mockApi('post', '/api/doctor-child-requests/9/reject', {});
    await doctorChildRequestService.rejectRequest(9, 'duplicate');
    expect(calls[0].path).toBe('/api/doctor-child-requests/9/reject');
  });
});
