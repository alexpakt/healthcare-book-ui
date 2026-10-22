import { describe, expect, it } from 'vitest';
import { directoryService } from '../directoryService';
import { mockApi } from '../../test/http';

describe('directoryService', () => {
  it('getDoctors requests the doctor directory', async () => {
    const doctors = [{ id: 1, firstName: 'Ελένη', lastName: 'Κωνσταντίνου', specialization: 'Παιδίατρος' }];
    const calls = mockApi('get', '/api/doctors', doctors);

    const result = await directoryService.getDoctors();

    expect(calls[0].path).toBe('/api/doctors');
    expect(result).toEqual(doctors);
  });
});
