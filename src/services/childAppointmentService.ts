import { apiClient } from './apiClient';
import type { Appointment } from '../types/parent';

/** Appointments of one child. Readable by the parent and by any doctor assigned to the child. */
export const childAppointmentService = {
  async getChildAppointments(childId: number): Promise<Appointment[]> {
    const response = await apiClient.get<Appointment[]>(`/api/appointments/child/${childId}`);
    return response.data;
  },
};
