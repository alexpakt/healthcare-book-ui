import { apiClient } from './apiClient';
import type { Child } from '../types/parent';

export interface CreateChildRequest {
  firstName: string;
  lastName: string;
  dateOfBirth: string; // YYYY-MM-DD format
  gender: 'MALE' | 'FEMALE';
  bloodType?: string;
}

export interface ChildRecord extends Child {
  parentId?: number;
  parentFirstName?: string;
  parentLastName?: string;
}

export const childService = {
  async getMyChildren(): Promise<ChildRecord[]> {
    try {
      const response = await apiClient.get<ChildRecord[]>('/api/children');
      return response.data;
    } catch (error) {
      console.error('Error fetching children:', error);
      throw error;
    }
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