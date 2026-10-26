import { describe, expect, it } from 'vitest';
import { childService } from '../childService';
import { mockApi } from '../../test/http';

describe('childService', () => {
  it('searchByAmka sends the AMKA as a query parameter', async () => {
    const calls = mockApi('get', '/api/children/search', {});
    await childService.searchByAmka('12345678901');
    expect(calls[0].path).toBe('/api/children/search');
    expect(calls[0].search).toContain('12345678901');
  });

  it('getMyChildren lists the children', async () => {
    const calls = mockApi('get', '/api/children', []);
    await childService.getMyChildren();
    expect(calls[0].path).toBe('/api/children');
  });

  it('getById reads one child', async () => {
    const calls = mockApi('get', '/api/children/3', {});
    await childService.getById(3);
    expect(calls[0].path).toBe('/api/children/3');
  });

  it('getChildDoctors reads the doctors connected to one child', async () => {
    const calls = mockApi('get', '/api/children/3/doctors', []);
    await childService.getChildDoctors(3);
    expect(calls[0].path).toBe('/api/children/3/doctors');
  });

  it('createChild posts the child data', async () => {
    const data = { firstName: 'Νίκος', lastName: 'Παπαδόπουλος' };
    const calls = mockApi('post', '/api/children', {});
    await childService.createChild(data as never);
    expect(calls[0].method).toBe('POST');
    expect(calls[0].body).toEqual(data);
  });

  it('updateChild puts the child data to the child endpoint', async () => {
    const data = { firstName: 'Νίκος' };
    const calls = mockApi('put', '/api/children/3', {});
    await childService.updateChild(3, data as never);
    expect(calls[0].method).toBe('PUT');
    expect(calls[0].path).toBe('/api/children/3');
  });

  it('deleteChild sends a delete request', async () => {
    const calls = mockApi('delete', '/api/children/3', undefined, 204);
    await childService.deleteChild(3);
    expect(calls[0].method).toBe('DELETE');
    expect(calls[0].path).toBe('/api/children/3');
  });
});
