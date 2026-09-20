import { apiClient } from './apiClient';
import { childService } from './childService';
import type {
  AssignedChild,
  DoctorAppointment,
  PatientMedicalHistory,
  MedicalHistory,
  VaccinationHistory,
  AllergyRecord,
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

export interface MedicalRecordRequest {
  childId: number;
  appointmentId?: number;
  recordDate: string; // YYYY-MM-DD
  diagnosis: string;
  notes?: string;
  prescription?: string;
}

const filterToday = (appointments: DoctorAppointment[]): DoctorAppointment[] => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return appointments.filter((apt) => {
    const aptDate = new Date(apt.appointmentDate);
    aptDate.setHours(0, 0, 0, 0);
    return aptDate.getTime() === today.getTime() && apt.status === 'SCHEDULED';
  });
};

const filterUpcoming = (appointments: DoctorAppointment[], limit?: number): DoctorAppointment[] => {
  const today = new Date();
  const upcoming = appointments.filter((apt) => {
    const aptDate = new Date(apt.appointmentDate);
    return aptDate >= today && apt.status === 'SCHEDULED';
  });
  return limit ? upcoming.slice(0, limit) : upcoming;
};

const filterPending = (appointments: DoctorAppointment[]): DoctorAppointment[] =>
  appointments.filter((apt) => apt.status === 'REQUESTED');

export const doctorService = {
  /**
   * Fetches the doctor's full appointment list once. Today's/upcoming/pending
   * views and getDashboardData() all derive from this instead of each
   * independently re-fetching the same /api/appointments list.
   */
  async getAllAppointments(): Promise<DoctorAppointment[]> {
    try {
      const response = await apiClient.get<DoctorAppointment[]>('/api/appointments');
      return response.data;
    } catch (error) {
      console.error('Error fetching appointments:', error);
      throw error;
    }
  },
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
    return filterToday(await this.getAllAppointments());
  },

  async getPendingAppointments(): Promise<DoctorAppointment[]> {
    return filterPending(await this.getAllAppointments());
  },

  async getUpcomingAppointments(limit?: number): Promise<DoctorAppointment[]> {
    return filterUpcoming(await this.getAllAppointments(), limit);
  },

  async getAppointments(
    page: number = 1,
    pageSize: number = 10
  ): Promise<PaginatedResponse<DoctorAppointment>> {
    const allAppointments = await this.getAllAppointments();
    const start = (page - 1) * pageSize;
    const end = start + pageSize;

    return {
      content: allAppointments.slice(start, end),
      totalElements: allAppointments.length,
      totalPages: Math.ceil(allAppointments.length / pageSize),
      currentPage: page,
      pageSize: pageSize,
    };
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
      const [child, medicalRecords, vaccinations, allergies] = await Promise.all([
        childService.getById(childId),
        apiClient.get<MedicalHistory[]>(`/api/medical-records/child/${childId}`),
        apiClient.get<VaccinationHistory[]>(`/api/vaccinations/child/${childId}`),
        apiClient.get<AllergyRecord[]>(`/api/allergies/child/${childId}`),
      ]);

      return {
        childId,
        childName: `${child.firstName} ${child.lastName}`,
        medicalRecords: medicalRecords.data || [],
        vaccinations: vaccinations.data || [],
        allergies: allergies.data || [],
      };
    } catch (error) {
      console.error('Error fetching patient medical history:', error);
      throw error;
    }
  },

  async createMedicalRecord(request: MedicalRecordRequest): Promise<MedicalHistory> {
    try {
      const response = await apiClient.post<MedicalHistory>('/api/medical-records', request);
      return response.data;
    } catch (error) {
      console.error('Error creating medical record:', error);
      throw error;
    }
  },

  async updateMedicalRecord(recordId: number, request: MedicalRecordRequest): Promise<MedicalHistory> {
    try {
      const response = await apiClient.put<MedicalHistory>(`/api/medical-records/${recordId}`, request);
      return response.data;
    } catch (error) {
      console.error('Error updating medical record:', error);
      throw error;
    }
  },

  async getDashboardData(): Promise<DoctorDashboardData> {
    try {
      const [assignedChildren, allAppointments] = await Promise.all([
        this.getAssignedChildren(),
        this.getAllAppointments(),
      ]);
      const todayAppointments = filterToday(allAppointments);
      const upcomingAppointments = filterUpcoming(allAppointments, 5);
      const pendingAppointments = filterPending(allAppointments);

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