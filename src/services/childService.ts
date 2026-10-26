import { apiClient } from './apiClient';
import type { Child } from '../types/parent';
import type { DoctorDirectoryEntry } from './directoryService';

export interface CreateChildRequest {
  firstName: string;
  lastName: string;
  amka: string;
  dateOfBirth: string;
  gender: 'MALE' | 'FEMALE';
  bloodType?: string;
}

export interface ChildRecord extends Child {
  parentId?: number;
  parentFirstName?: string;
  parentLastName?: string;
}

export const childService = {
  async searchByAmka(amka: string): Promise<ChildRecord> {
    try {
      const response = await apiClient.get<ChildRecord>('/api/children/search', {
        params: { amka },
      });
      return response.data;
    } catch (error) {
      console.error('Error searching child by AMKA:', error);
      throw error;
    }
  },

  async getMyChildren(): Promise<ChildRecord[]> {
    try {
      const response = await apiClient.get<ChildRecord[]>('/api/children');
      return response.data;
    } catch (error) {
      console.error('Error fetching children:', error);
      throw error;
    }
  },

  async getById(childId: number): Promise<ChildRecord> {
    try {
      const response = await apiClient.get<ChildRecord>(`/api/children/${childId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching child:', error);
      throw error;
    }
  },

  async getChildDoctors(childId: number): Promise<DoctorDirectoryEntry[]> {
    const response = await apiClient.get<DoctorDirectoryEntry[]>(`/api/children/${childId}/doctors`);
    return response.data;
  },

  async createChild(childData: CreateChildRequest): Promise<Child> {
    try {
      const response = await apiClient.post<Child>('/api/children', childData);
      return response.data;
    } catch (error) {
      console.error('Error creating child:', error);
      throw error;
    }
  },

  async updateChild(childId: number, childData: CreateChildRequest): Promise<Child> {
    try {
      const response = await apiClient.put<Child>(`/api/children/${childId}`, childData);
      return response.data;
    } catch (error) {
      console.error('Error updating child:', error);
      throw error;
    }
  },

  async deleteChild(childId: number): Promise<void> {
    try {
      await apiClient.delete(`/api/children/${childId}`);
    } catch (error) {
      console.error('Error deleting child:', error);
      throw error;
    }
  },
};