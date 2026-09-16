import type { AppointmentStatus, VaccinationStatus, Gender } from './common';

export interface Child {
  id: number;
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  gender: Gender;
  bloodType?: string;
  profilePictureUrl?: string;
}

export interface Appointment {
  id: number;
  childId: number;
  childName: string;
  doctorId: number;
  doctorName: string;
  appointmentDate: string;
  appointmentTime: string;
  reason: string;
  status: AppointmentStatus;
  notes?: string;
}

export interface VaccinationRecord {
  id: number;
  childId: number;
  vaccineName: string;
  vaccinationDate: string;
  nextDueDate: string;
  status: VaccinationStatus;
  doctorId: number;
  doctorName: string;
}

export interface MedicalRecord {
  id: number;
  childId: number;
  recordType: string;
  recordDate: string;
  content: string;
}

export interface ParentQuickStats {
  totalChildren: number;
  upcomingAppointmentsCount: number;
  overdueVaccinationsCount: number;
}

export interface ParentDashboardData {
  children: Child[];
  upcomingAppointments: Appointment[];
  vaccinationReminders: VaccinationRecord[];
  quickStats: ParentQuickStats;
}
