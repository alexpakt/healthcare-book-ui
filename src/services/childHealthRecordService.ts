import { apiClient } from './apiClient';
import type { AllergyRecord, BirthRecord, GrowthMeasurement, MedicalRecord, VaccinationRecord } from '../types/parent';

export const childHealthRecordService = {
  async getBirthRecord(childId: number): Promise<BirthRecord | null> {
    try {
      const response = await apiClient.get<BirthRecord>(`/api/birth-records/child/${childId}`);
      // 204 No Content: the child has no birth record yet, which is an expected state
      return response.status === 204 ? null : response.data;
    } catch (error) {
      console.error('Error fetching birth record:', error);
      throw error;
    }
  },

  async getMedicalRecords(childId: number): Promise<MedicalRecord[]> {
    const response = await apiClient.get<MedicalRecord[]>(`/api/medical-records/child/${childId}`);
    return response.data;
  },

  async getVaccinations(childId: number): Promise<VaccinationRecord[]> {
    const response = await apiClient.get<VaccinationRecord[]>(`/api/vaccinations/child/${childId}`);
    return response.data;
  },

  async getAllergies(childId: number): Promise<AllergyRecord[]> {
    const response = await apiClient.get<AllergyRecord[]>(`/api/allergies/child/${childId}`);
    return response.data;
  },

  async getGrowthMeasurements(childId: number): Promise<GrowthMeasurement[]> {
    const response = await apiClient.get<GrowthMeasurement[]>(
      `/api/growth-measurements/child/${childId}`
    );
    return response.data;
  },

  async getGrowthReferenceCurves(childId: number, measurementType: string) {
    const response = await apiClient.get<any[]>(
      `/api/growth-measurements/references/child/${childId}/type/${measurementType}`
    );
    return response.data;
  },
};
