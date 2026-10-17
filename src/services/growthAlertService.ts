import { apiClient } from './apiClient';
import type { GrowthAlert } from '../types/growthAlert';

/**
 * Growth alerts for clinical review. Doctors only; alerts are monitoring aids, not diagnoses.
 */
export const growthAlertService = {
  async getAlerts(childId: number): Promise<GrowthAlert[]> {
    const response = await apiClient.get<GrowthAlert[]>(`/api/growth-measurements/child/${childId}/alerts`);
    return response.data;
  },

  async acknowledge(childId: number, alertKey: string, note?: string): Promise<GrowthAlert> {
    const response = await apiClient.post<GrowthAlert>(
      `/api/growth-measurements/child/${childId}/alerts/${alertKey}/acknowledge`,
      { note: note?.trim() || null }
    );
    return response.data;
  },
};
