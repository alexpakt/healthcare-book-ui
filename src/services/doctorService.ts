import { apiClient } from './apiClient';
import { childService } from './childService';
import type {
  AssignedChild,
  DoctorAppointment,
  PatientMedicalHistory,
  MedicalNotes,
  DoctorDashboardData,
} from '../types/doctor';
import type { AppointmentStatus, PaginatedResponse } from '../types/common';

export interface CreateAppointmentRequest {
  childId: number;
  doctorId: number;
  appointmentDate: string; // ISO local datetime, e.g. "2026-09-25T14:30:00"
  reason?: string;
  notes?: string;
}

export const doctorService = {
  async createAppointment(request: CreateAppointmentRequest): Promise<DoctorAppointment> {
    try {
      const response = await apiClient.post<DoctorAppointment>('/api/appointments', request);
      return response.data;
    } catch (error) {
      console.error('Error creating appointment:', error);
      throw error;
    }
  },


  async getAssignedChildren(): Promise<AssignedChild[]> {
    try {
      const children = await childService.getMyChildren();

      return children.map((child) => ({
        id: child.id,
        firstName: child.firstName,
        lastName: child.lastName,
        dateOfBirth: child.dateOfBirth,
        parentName: [child.parentFirstName, child.parentLastName].filter(Boolean).join(' '),
        status: 'ACTIVE',
      }));
    } catch (error) {
      console.error('Error fetching assigned children:', error);
      throw error;
    }
  },

  async getTodayAppointments(): Promise<DoctorAppointment[]> {
    try {
      const allAppointments = await apiClient.get<any[]>('/api/appointments');
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);

      return allAppointments.data.filter((apt) => {
        const aptDate = new Date(apt.appointmentDate);
        aptDate.setHours(0, 0, 0, 0);
        return aptDate.getTime() === today.getTime() && apt.status === 'SCHEDULED';
      });
    } catch (error) {
      console.error('Error fetching today appointments:', error);
      throw error;
    }
  },

  async getPendingAppointments(): Promise<DoctorAppointment[]> {
    try {
      const allAppointments = await apiClient.get<any[]>('/api/appointments');
      return allAppointments.data.filter((apt) => apt.status === 'REQUESTED');
    } catch (error) {
      console.error('Error fetching pending appointments:', error);
      throw error;
    }
  },

  async getUpcomingAppointments(limit?: number): Promise<DoctorAppointment[]> {
    try {
      const allAppointments = await apiClient.get<any[]>('/api/appointments');
      const today = new Date();
      const upcoming = allAppointments.data.filter((apt) => {
        const aptDate = new Date(apt.appointmentDate);
        return aptDate >= today && apt.status === 'SCHEDULED';
      });

      return limit ? upcoming.slice(0, limit) : upcoming;
    } catch (error) {
      console.error('Error fetching upcoming appointments:', error);
      throw error;
    }
  },

  async getAppointments(
    page: number = 1,
    pageSize: number = 10
  ): Promise<PaginatedResponse<DoctorAppointment>> {
    try {
      const allAppointments = await apiClient.get<any[]>('/api/appointments');
      const start = (page - 1) * pageSize;
      const end = start + pageSize;

      return {
        content: allAppointments.data.slice(start, end),
        totalElements: allAppointments.data.length,
        totalPages: Math.ceil(allAppointments.data.length / pageSize),
        currentPage: page,
        pageSize: pageSize,
      };
    } catch (error) {
      console.error('Error fetching appointments:', error);
      throw error;
    }
  },

  async updateAppointmentStatus(
    appointmentId: number,
    status: AppointmentStatus
  ): Promise<DoctorAppointment> {
    try {
      const response = await apiClient.patch<DoctorAppointment>(`/api/appointments/${appointmentId}/status`, {
        status,
      });
      return response.data;
    } catch (error) {
      console.error('Error updating appointment status:', error);
      throw error;
    }
  },

  async getPatientMedicalHistory(childId: number): Promise<PatientMedicalHistory> {
    try {
      const [medicalRecords, vaccinations] = await Promise.all([
        apiClient.get<MedicalHistory[]>(`/api/medical-records/child/${childId}`),
        apiClient.get<any[]>(`/api/vaccinations/child/${childId}`),
      ]);

      return {
        childId,
        childName: '',
        medicalRecords: medicalRecords.data || [],
        vaccinations: vaccinations.data || [],
        allergies: [],
      };
    } catch (error) {
      console.error('Error fetching patient medical history:', error);
      throw error;
    }
  },

  async addMedicalNotes(_appointmentId: number, notes: string): Promise<MedicalNotes> {
    try {
      const response = await apiClient.post('/api/medical-records', {
        content: notes,
        recordType: 'APPOINTMENT_NOTES',
      });
      return response.data;
    } catch (error) {
      console.error('Error adding medical notes:', error);
      throw error;
    }
  },

  async updateMedicalNotes(notesId: number, notes: string): Promise<MedicalNotes> {
    try {
      const response = await apiClient.put(`/api/medical-records/${notesId}`, {
        content: notes,
        recordType: 'APPOINTMENT_NOTES',
      });
      return response.data;
    } catch (error) {
      console.error('Error updating medical notes:', error);
      throw error;
    }
  },

  async getDashboardData(): Promise<DoctorDashboardData> {
    try {
      const [assignedChildren, todayAppointments, upcomingAppointments, pendingAppointments] = await Promise.all([
        this.getAssignedChildren(),
        this.getTodayAppointments(),
        this.getUpcomingAppointments(5),
        this.getPendingAppointments(),
      ]);

      return {
        assignedChildren,
        todayAppointments,
        upcomingAppointments,
        pendingAppointments,
        quickStats: {
          totalPatients: assignedChildren.length,
          todayAppointmentsCount: todayAppointments.length,
          upcomingAppointmentsCount: upcomingAppointments.length,
          completedAppointmentsCount: 0,
          pendingRequestsCount: pendingAppointments.length,
        },
      };
    } catch (error) {
      console.error('Error fetching doctor dashboard data:', error);
      throw error;
    }
  },
};

interface MedicalHistory {
  id: number;
  recordType: string;
  recordDate: string;
  content: string;
}