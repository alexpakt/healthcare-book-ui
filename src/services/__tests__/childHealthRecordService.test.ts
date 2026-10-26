import { describe, expect, it } from 'vitest';
import { childHealthRecordService } from '../childHealthRecordService';
import { mockApi } from '../../test/http';

describe('childHealthRecordService', () => {
  it('getBirthRecord returns the birth record of one child', async () => {
    const calls = mockApi('get', '/api/birth-records/child/4', { id: 1, birthWeightGrams: 3800 });
    const record = await childHealthRecordService.getBirthRecord(4);
    expect(calls[0].path).toBe('/api/birth-records/child/4');
    expect(record).toMatchObject({ birthWeightGrams: 3800 });
  });

  it('getBirthRecord returns null when the child has no birth record yet (204)', async () => {
    mockApi('get', '/api/birth-records/child/4', undefined, 204);
    expect(await childHealthRecordService.getBirthRecord(4)).toBeNull();
  });

  it.each([
    ['getMedicalRecords', '/api/medical-records/child/4'],
    ['getVaccinations', '/api/vaccinations/child/4'],
    ['getAllergies', '/api/allergies/child/4'],
  ] as const)('%s reads the records of one child', async (method, path) => {
    const calls = mockApi('get', path, []);
    await childHealthRecordService[method](4);
    expect(calls[0].path).toBe(path);
  });

  it('getGrowthMeasurements reads the measurements of one child', async () => {
    const calls = mockApi('get', '/api/growth-measurements/child/4', []);
    await childHealthRecordService.getGrowthMeasurements(4);
    expect(calls[0].path).toBe('/api/growth-measurements/child/4');
  });

  it('getGrowthReferenceCurves reads the reference curves for one measurement type', async () => {
    const calls = mockApi('get', '/api/growth-measurements/references/child/4/type/WEIGHT', []);
    await childHealthRecordService.getGrowthReferenceCurves(4, 'WEIGHT');
    expect(calls[0].path).toBe('/api/growth-measurements/references/child/4/type/WEIGHT');
  });
});
