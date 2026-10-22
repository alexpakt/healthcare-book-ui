import { apiClient } from './apiClient';
import type { VaccinationSchedule } from '../types/parent';

export interface VaccineCatalogEntry {
  id: number;
  vaccineName: string;
  vaccineNameGr: string;
  componentVaccineNames: string[];
}

export const vaccinationCatalogService = {
  async getVaccinationSchedules(): Promise<VaccinationSchedule[]> {
    const response = await apiClient.get<VaccinationSchedule[]>('/api/vaccination-schedules');
    return response.data;
  },

  async getAllVaccines(): Promise<VaccineCatalogEntry[]> {
    const response = await apiClient.get<VaccineCatalogEntry[]>('/api/vaccines');
    return response.data;
  },
};
