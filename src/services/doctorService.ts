import { apiClient } from './apiClient';
import { appointmentService } from './appointmentService';
import { childService } from './childService';
import type {
  AssignedChild,
  DoctorAppointment,
  MedicalHistory,
  AllergyRecord,
  DoctorDashboardData,
} from '../types/doctor';
import type { GrowthMeasurement, BirthRecord } from '../types/parent';
import type { PaginatedResponse } from '../types/common';
import type { DoctorProfile, UpdateDoctorProfileRequest } from '../types/profile';

export interface MedicalRecordRequest {
  childId: number;
  appointmentId?: number;
  recordDate: string; // YYYY-MM-DD
  diagnosis: string;
  notes?: string;
  prescription?: string;
}

export interface GrowthMeasurementRequest {
  childId: number;
  measurementDate: string; // YYYY-MM-DD
  heightCm?: number | null;
  weightKg?: number | null;
  headCircumferenceCm?: number | null;
  notes?: string;
}

export interface CreateVaccinationRequest {
  childId: number;
  administeredByDoctorId?: number;
  vaccineName: string;
  administeredDate: string; // YYYY-MM-DD
  batchNumber?: string;
  notes?: string;
}

export type BirthRecordRequest = Omit<BirthRecord, 'id' | 'childName'>;

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
    return filterToday(await appointmentService.getAll<DoctorAppointment>());
  },

  async getPendingAppointments(): Promise<DoctorAppointment[]> {
    return filterPending(await appointmentService.getAll<DoctorAppointment>());
  },

  async getUpcomingAppointments(limit?: number): Promise<DoctorAppointment[]> {
    return filterUpcoming(await appointmentService.getAll<DoctorAppointment>(), limit);
  },

  async getAppointments(
    page: number = 1,
    pageSize: number = 10
  ): Promise<PaginatedResponse<DoctorAppointment>> {
    const allAppointments = await appointmentService.getAll<DoctorAppointment>();
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

  async createGrowthMeasurement(request: GrowthMeasurementRequest): Promise<GrowthMeasurement> {
    try {
      const response = await apiClient.post<GrowthMeasurement>(
        '/api/growth-measurements',
        request
      );
      return response.data;
    } catch (error) {
      console.error('Error creating growth measurement:', error);
      throw error;
    }
  },

  async createAllergy(childId: number, request: {
    allergen: string;
    severity: 'MILD' | 'MODERATE' | 'SEVERE';
    reaction?: string;
    diagnosedDate: string;
    notes?: string;
  }): Promise<AllergyRecord> {
    try {
      const response = await apiClient.post<AllergyRecord>('/api/allergies', {
        childId,
        ...request,
      });
      return response.data;
    } catch (error) {
      console.error('Error creating allergy:', error);
      throw error;
    }
  },

  async updateAllergy(allergyId: number, request: {
    allergen: string;
    severity: 'MILD' | 'MODERATE' | 'SEVERE';
    reaction?: string;
    diagnosedDate: string;
    notes?: string;
  }): Promise<AllergyRecord> {
    try {
      const response = await apiClient.put<AllergyRecord>(`/api/allergies/${allergyId}`, request);
      return response.data;
    } catch (error) {
      console.error('Error updating allergy:', error);
      throw error;
    }
  },

  async deleteAllergy(allergyId: number): Promise<void> {
    try {
      await apiClient.delete(`/api/allergies/${allergyId}`);
    } catch (error) {
      console.error('Error deleting allergy:', error);
      throw error;
    }
  },

  async createVaccination(request: CreateVaccinationRequest): Promise<any> {
    try {
      const response = await apiClient.post('/api/vaccinations', request);
      return response.data;
    } catch (error) {
      console.error('Error creating vaccination:', error);
      throw error;
    }
  },

  async createBirthRecord(request: BirthRecordRequest): Promise<BirthRecord> {
    try {
      const response = await apiClient.post<BirthRecord>('/api/birth-records', request);
      return response.data;
    } catch (error) {
      console.error('Error creating birth record:', error);
      throw error;
    }
  },

  async updateBirthRecord(childId: number, request: BirthRecordRequest): Promise<BirthRecord> {
    try {
      const response = await apiClient.put<BirthRecord>(`/api/birth-records/child/${childId}`, request);
      return response.data;
    } catch (error) {
      console.error('Error updating birth record:', error);
      throw error;
    }
  },

  async getMyProfile(): Promise<DoctorProfile> {
    try {
      const response = await apiClient.get<DoctorProfile>('/api/doctors/me');
      return response.data;
    } catch (error) {
      console.error('Error fetching doctor profile:', error);
      throw error;
    }
  },

  async updateMyProfile(request: UpdateDoctorProfileRequest): Promise<DoctorProfile> {
    try {
      const response = await apiClient.patch<DoctorProfile>('/api/doctors/me', request);
      return response.data;
    } catch (error) {
      console.error('Error updating doctor profile:', error);
      throw error;
    }
  },

  async getDashboardData(): Promise<DoctorDashboardData> {
    try {
      const [assignedChildren, allAppointments] = await Promise.all([
        this.getAssignedChildren(),
        appointmentService.getAll<DoctorAppointment>(),
      ]);
      const todayAppointments = filterToday(allAppointments);
      const upcomingAppointments = filterUpcoming(allAppointments, 5);
      const pendingAppointments = filterPending(allAppointments);

      return {
        assignedChildren,
        todayAppointments,
        upcomingAppointments,
        pendingAppointments,
      };
    } catch (error) {
      console.error('Error fetching doctor dashboard data:', error);
      throw error;
    }
  },
};