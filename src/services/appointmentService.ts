import { apiClient } from './apiClient';
import type { Appointment } from '../types/parent';
import type { AppointmentStatus } from '../types/common';

export interface CreateAppointmentRequest {
  childId: number;
  doctorId: number;
  appointmentDate: string; // ISO local datetime, e.g. "2026-09-25T14:30:00"
  reason?: string;
  notes?: string;
}

export const appointmentService = {
  async getAll<T extends Appointment = Appointment>(): Promise<T[]> {
    const response = await apiClient.get<T[]>('/api/appointments');
    return response.data;
  },

  async getForChild(childId: number): Promise<Appointment[]> {
    const response = await apiClient.get<Appointment[]>(`/api/appointments/child/${childId}`);
    return response.data;
  },

  /** Created with status REQUESTED until the doctor accepts or declines it. */
  async create<T extends Appointment = Appointment>(request: CreateAppointmentRequest): Promise<T> {
    const response = await apiClient.post<T>('/api/appointments', request);
    return response.data;
  },

  /** Parents may only cancel their own REQUESTED or SCHEDULED appointments (enforced server-side). */
  async updateStatus<T extends Appointment = Appointment>(
    appointmentId: number,
    status: AppointmentStatus
  ): Promise<T> {
    const response = await apiClient.patch<T>(`/api/appointments/${appointmentId}/status`, { status });
    return response.data;
  },
};
