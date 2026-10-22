import { describe, expect, it } from 'vitest';
import { growthAlertService } from '../growthAlertService';
import { mockApi } from '../../test/http';

describe('growthAlertService', () => {
  it('getAlerts requests the alerts for the child', async () => {
    const calls = mockApi('get', '/api/growth-measurements/child/5/alerts', []);

    await growthAlertService.getAlerts(5);

    expect(calls[0].method).toBe('GET');
    expect(calls[0].path).toBe('/api/growth-measurements/child/5/alerts');
  });

  it('acknowledge posts to the acknowledge endpoint with the alert key', async () => {
    const calls = mockApi('post', '/api/growth-measurements/child/5/alerts/abc123/acknowledge', {});

    await growthAlertService.acknowledge(5, 'abc123', 'reviewed');

    expect(calls[0].path).toBe('/api/growth-measurements/child/5/alerts/abc123/acknowledge');
    expect(calls[0].body).toEqual({ note: 'reviewed' });
  });

  it('trims the note before sending', async () => {
    const calls = mockApi('post', '/api/growth-measurements/child/5/alerts/k/acknowledge', {});

    await growthAlertService.acknowledge(5, 'k', '   reviewed by doctor  ');

    expect(calls[0].body).toEqual({ note: 'reviewed by doctor' });
  });

  it('sends a null note when the note is blank or missing', async () => {
    const calls = mockApi('post', '/api/growth-measurements/child/5/alerts/k/acknowledge', {});

    await growthAlertService.acknowledge(5, 'k', '   ');
    await growthAlertService.acknowledge(5, 'k');

    expect(calls[0].body).toEqual({ note: null });
    expect(calls[1].body).toEqual({ note: null });
  });
});
