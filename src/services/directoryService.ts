import { apiClient } from './apiClient';

export interface DoctorDirectoryEntry {
  id: number;
  firstName: string;
  lastName: string;
  specialization: string;
  phoneNumber?: string;
  address?: string;
}

export const directoryService = {
  async getDoctors(): Promise<DoctorDirectoryEntry[]> {
    const response = await apiClient.get<DoctorDirectoryEntry[]>('/api/doctors');
    return response.data;
  },
};
