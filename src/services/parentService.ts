import { apiClient } from './apiClient';
import type { Child, Appointment, VaccinationRecord, MedicalRecord, ParentDashboardData } from '../types/parent';
import type { AppointmentStatus } from '../types/common';
import { getVaccinationStatus } from '../utils/vaccinationStatus';

export interface CreateAppointmentRequest {
  childId: number;
  doctorId: number;
  appointmentDate: string;
  reason?: string;
  notes?: string;
}

/**
 * Parent service - Fetches data from resource endpoints
 * The backend uses role-based authorization on individual resource endpoints
 * No role-specific aggregation endpoints exist, so we fetch and aggregate on the frontend
 */
export const parentService = {
  /**
   * Get all children for the current parent
   */
  async getChildren(): Promise<Child[]> {
    const response = await apiClient.get<Child[]>('/api/children');
    return response.data;
  },

  /**
   * Get a specific child by ID
   */
  async getChildById(childId: number): Promise<Child> {
    const response = await apiClient.get<Child>(`/api/children/${childId}`);
    return response.data;
  },

  /**
   * Get vaccinations for a specific child
   */
  async getChildVaccinations(childId: number): Promise<VaccinationRecord[]> {
    const response = await apiClient.get<VaccinationRecord[]>(
      `/api/vaccinations/child/${childId}`
    );
    return response.data;
  },

  /**
   * Get medical records for a specific child
   */
  async getChildMedicalRecords(childId: number): Promise<MedicalRecord[]> {
    const response = await apiClient.get<MedicalRecord[]>(
      `/api/medical-records/child/${childId}`
    );
    return response.data;
  },

  /**
   * Get all appointments for the current parent
   */
  async getAppointments(): Promise<Appointment[]> {
    const response = await apiClient.get<Appointment[]>('/api/appointments');
    return response.data;
  },

  /**
   * Get appointments for a specific child
   */
  async getChildAppointments(childId: number): Promise<Appointment[]> {
    const response = await apiClient.get<Appointment[]>(
      `/api/appointments/child/${childId}`
    );
    return response.data;
  },

  /**
   * Request a new appointment for a child. Created with status REQUESTED
   * until the doctor accepts or declines it.
   */
  async createAppointment(request: CreateAppointmentRequest): Promise<Appointment> {
    const response = await apiClient.post<Appointment>('/api/appointments', request);
    return response.data;
  },

  /**
   * Update an appointment's status. Parents may only cancel their own
   * REQUESTED or SCHEDULED appointments (enforced server-side).
   */
  async updateAppointmentStatus(appointmentId: number, status: AppointmentStatus): Promise<Appointment> {
    const response = await apiClient.patch<Appointment>(`/api/appointments/${appointmentId}/status`, {
      status,
    });
    return response.data;
  },

  /**
   * Aggregate dashboard data for parent
   * Fetches children, appointments, and vaccinations, then calculates stats
   */
  async getDashboardData(): Promise<ParentDashboardData> {
    try {
      // Fetch all data in parallel
      const [childrenData, appointmentsData] = await Promise.all([
        this.getChildren(),
        this.getAppointments(),
      ]);

      // Fetch vaccinations for each child
      const vaccinationPromises = childrenData.map((child) =>
        this.getChildVaccinations(child.id)
      );
      const vaccinationsByChild = await Promise.all(vaccinationPromises);
      const allVaccinations = vaccinationsByChild.flat();

      // Calculate upcoming appointments (next 30 days)
      const today = new Date();
      const thirtyDaysLater = new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000);

      const upcomingAppointments = appointmentsData.filter((apt) => {
        const aptDate = new Date(apt.appointmentDate);
        return aptDate >= today && aptDate <= thirtyDaysLater && apt.status === 'SCHEDULED';
      });

      // Find overdue vaccinations (no server-side status; derive from nextDoseDate)
      const overdueVaccinations = allVaccinations.filter(
        (v) => getVaccinationStatus(v) === 'OVERDUE'
      );

      return {
        children: childrenData,
        upcomingAppointments,
        vaccinationReminders: allVaccinations,
        quickStats: {
          totalChildren: childrenData.length,
          upcomingAppointmentsCount: upcomingAppointments.length,
          overdueVaccinationsCount: overdueVaccinations.length,
        },
      };
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      throw error;
    }
  },
};
