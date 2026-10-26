import { apiClient } from './apiClient';
import { appointmentService } from './appointmentService';
import { childService } from './childService';
import type { VaccinationSchedule, ParentDashboardData } from '../types/parent';
import type { ParentProfile, UpdateParentProfileRequest } from '../types/profile';

export const parentService = {

  async getVaccinationSchedulesByAge(ageMonths: number): Promise<VaccinationSchedule[]> {
    const response = await apiClient.get<VaccinationSchedule[]>(
      `/api/vaccination-schedules/age/${ageMonths}`
    );
    return response.data;
  },

  async getVaccinationSchedulesByVaccine(vaccineName: string): Promise<VaccinationSchedule[]> {
    const response = await apiClient.get<VaccinationSchedule[]>(
      `/api/vaccination-schedules/vaccine/${vaccineName}`
    );
    return response.data;
  },

  async getMyProfile(): Promise<ParentProfile> {
    const response = await apiClient.get<ParentProfile>('/api/parents/me');
    return response.data;
  },

  async updateMyProfile(request: UpdateParentProfileRequest): Promise<ParentProfile> {
    const response = await apiClient.patch<ParentProfile>('/api/parents/me', request);
    return response.data;
  },

  async getDashboardData(): Promise<ParentDashboardData> {
    try {
      const [childrenData, appointmentsData] = await Promise.all([
        childService.getMyChildren(),
        appointmentService.getAll(),
      ]);

      const today = new Date();
      const thirtyDaysLater = new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000);

      const upcomingAppointments = appointmentsData.filter((apt) => {
        const aptDate = new Date(apt.appointmentDate);
        return aptDate >= today && aptDate <= thirtyDaysLater && apt.status === 'SCHEDULED';
      });

      return {
        children: childrenData,
        upcomingAppointments,
      };
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      throw error;
    }
  },
};
